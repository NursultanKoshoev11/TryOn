package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"

	"github.com/tryon-ai/api/internal/config"
	"github.com/tryon-ai/api/internal/handlers"
	"github.com/tryon-ai/api/internal/repository"
	"github.com/tryon-ai/api/internal/services"
	mw "github.com/tryon-ai/api/internal/middleware"
)

func main() {
	// Load config
	cfg := config.Load()

	// Connect to PostgreSQL
	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	fmt.Println("✓ Connected to PostgreSQL")

	// Connect to Redis
	opt, err := redis.ParseURL(cfg.RedisURL)
	if err != nil {
		log.Fatalf("Failed to parse Redis URL: %v", err)
	}

	redisClient := redis.NewClient(opt)
	defer redisClient.Close()

	fmt.Println("✓ Connected to Redis")

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	orgRepo := repository.NewOrganizationRepository(db)
	apikeyRepo := repository.NewAPIKeyRepository(db)
	genRepo := repository.NewGenerationRepository(db)
	subRepo := repository.NewSubscriptionRepository(db)

	// Initialize services
	authService := services.NewAuthService(userRepo, cfg.JWTSecret, cfg.JWTRefreshSecret, cfg.JWTExpirationHours, cfg.JWTRefreshExpirationDays)
	orgService := services.NewOrganizationService(orgRepo)
	apikeyService := services.NewAPIKeyService(apikeyRepo, subRepo, cfg.APIKeySecret)
	genService := services.NewGenerationService(genRepo, subRepo, orgRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	orgHandler := handlers.NewOrganizationHandler(orgService)
	apikeyHandler := handlers.NewAPIKeyHandler(apikeyService, orgService)
	genHandler := handlers.NewGenerationHandler(genService, orgService)

	// Initialize middleware
	authMiddleware := mw.NewAuthMiddleware(authService)
	apikeyMiddleware := mw.NewAPIKeyMiddleware(apikeyService)
	rateLimitMiddleware := mw.NewRateLimitMiddleware(redisClient)

	// Initialize Echo
	e := echo.New()

	// Global middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.RequestID())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: cfg.CORSAllowedOrigins,
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.PATCH, echo.DELETE},
		AllowHeaders: []string{echo.HeaderContentType, echo.HeaderAuthorization},
	}))

	// Rate limiting
	e.Use(rateLimitMiddleware.RateLimitByIP(100, time.Minute))

	// Health endpoints
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{"status": "ok"})
	})

	e.GET("/ready", func(c echo.Context) error {
		return c.JSON(200, map[string]string{"status": "ready"})
	})

	// API v1
	v1 := e.Group("/api/v1")

	// Auth routes (public)
	auth := v1.Group("/auth")
	auth.POST("/register", authHandler.Register)
	auth.POST("/login", authHandler.Login)
	auth.POST("/refresh", authHandler.RefreshToken)

	// Protected routes (JWT)
	protected := v1.Group("")
	protected.Use(authMiddleware.RequireAuth)

	// User routes
	protected.GET("/me", authHandler.GetMe)

	// Organization routes
	protected.GET("/organizations", orgHandler.GetByUserID)
	protected.POST("/organizations", orgHandler.Create)
	protected.GET("/organizations/:id", orgHandler.GetByID)
	protected.PATCH("/organizations/:id", orgHandler.Update)
	protected.DELETE("/organizations/:id", orgHandler.Delete)

	// API Key routes
	protected.GET("/organizations/:id/api-keys", apikeyHandler.GetByOrganizationID)
	protected.POST("/organizations/:id/api-keys", apikeyHandler.Create)
	protected.DELETE("/organizations/:id/api-keys/:key_id", apikeyHandler.Revoke)
	protected.POST("/organizations/:id/api-keys/:key_id/rotate", apikeyHandler.Rotate)

	// Usage routes
	protected.GET("/organizations/:id/usage", genHandler.GetUsage)
	protected.GET("/organizations/:id/generations", genHandler.GetByOrganizationID)

	// Generation routes (API key auth)
	tryon := v1.Group("/tryon")
	tryon.Use(apikeyMiddleware.ValidateAPIKey)
	tryon.Use(rateLimitMiddleware.RateLimitByAPIKey(1000, time.Minute))
	tryon.Use(rateLimitMiddleware.RateLimitByOrganization(10000, 24*time.Hour))

	tryon.POST("/generations", genHandler.Create)
	tryon.GET("/generations/:generation_id", genHandler.GetByID)
	tryon.GET("/generations/:generation_id/images", genHandler.GetImages)

	// Admin routes
	admin := v1.Group("/admin")
	admin.Use(authMiddleware.RequireAuth)
	admin.Use(authMiddleware.RequireAdmin)

	admin.GET("/organizations", orgHandler.GetAll)
	admin.POST("/organizations/:id/suspend", orgHandler.Suspend)
	admin.POST("/organizations/:id/activate", orgHandler.Activate)

	// Start server
	fmt.Printf("\n🚀 API server starting on port %s\n", cfg.Port)
	fmt.Printf("Environment: %s\n", cfg.Environment)
	fmt.Println("\nEndpoints:")
	fmt.Println("  Health: http://localhost:" + cfg.Port + "/health")
	fmt.Println("  API: http://localhost:" + cfg.Port + "/api/v1")
	fmt.Println("\n✓ Server ready\n")

	log.Fatal(e.Start(":" + cfg.Port))
}
