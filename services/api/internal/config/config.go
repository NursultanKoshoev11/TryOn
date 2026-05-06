package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	DatabaseURL           string
	RedisURL              string
	S3Endpoint            string
	S3Bucket              string
	S3AccessKey           string
	S3SecretKey           string
	S3UseSSL              bool
	JWTSecret             string
	JWTRefreshSecret      string
	JWTExpirationHours    int
	JWTRefreshExpirationDays int
	APIKeySecret          string
	Environment           string
	Port                  string
	LogLevel              string
	CORSAllowedOrigins    []string
}

func Load() *Config {
	return &Config{
		DatabaseURL:           getEnv("DATABASE_URL", "postgres://tryon_user:tryon_password@localhost:5432/tryon_ai_db?sslmode=disable"),
		RedisURL:              getEnv("REDIS_URL", "redis://localhost:6379/0"),
		S3Endpoint:            getEnv("S3_ENDPOINT", "http://localhost:9000"),
		S3Bucket:              getEnv("S3_BUCKET", "tryon-ai"),
		S3AccessKey:           getEnv("S3_ACCESS_KEY", "minioadmin"),
		S3SecretKey:           getEnv("S3_SECRET_KEY", "minioadmin"),
		S3UseSSL:              getEnvBool("S3_USE_SSL", false),
		JWTSecret:             getEnv("JWT_SECRET", "dev-secret-key-change-in-production"),
		JWTRefreshSecret:      getEnv("JWT_REFRESH_SECRET", "dev-refresh-secret-key"),
		JWTExpirationHours:    getEnvInt("JWT_EXPIRATION_HOURS", 24),
		JWTRefreshExpirationDays: getEnvInt("JWT_REFRESH_EXPIRATION_DAYS", 7),
		APIKeySecret:          getEnv("API_KEY_SECRET", "dev-api-key-secret"),
		Environment:           getEnv("ENVIRONMENT", "development"),
		Port:                  getEnv("PORT", "8080"),
		LogLevel:              getEnv("LOG_LEVEL", "debug"),
		CORSAllowedOrigins:    strings.Split(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173"), ","),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}
