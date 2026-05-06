package middleware

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/tryon-ai/api/internal/services"
)

type APIKeyMiddleware struct {
	apikeyService *services.APIKeyService
}

func NewAPIKeyMiddleware(apikeyService *services.APIKeyService) *APIKeyMiddleware {
	return &APIKeyMiddleware{apikeyService: apikeyService}
}

func (m *APIKeyMiddleware) ValidateAPIKey(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"error": "missing API key",
			})
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"error": "invalid authorization header format",
			})
		}

		apiKey := parts[1]
		key, err := m.apikeyService.ValidateAPIKey(apiKey)
		if err != nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"error": "invalid API key",
			})
		}

		// Check allowed domains if configured
		if key.AllowedDomains != "" {
			origin := c.Request().Header.Get("Origin")
			referer := c.Request().Header.Get("Referer")
			
			allowedDomains := strings.Split(key.AllowedDomains, ",")
			allowed := false
			for _, domain := range allowedDomains {
				domain = strings.TrimSpace(domain)
				if strings.Contains(origin, domain) || strings.Contains(referer, domain) {
					allowed = true
					break
				}
			}

			if !allowed {
				return c.JSON(http.StatusForbidden, map[string]string{
					"error": "domain not allowed for this API key",
				})
			}
		}

		// Store API key info in context
		c.Set("api_key_id", key.ID)
		c.Set("organization_id", key.OrganizationID)

		return next(c)
	}
}
