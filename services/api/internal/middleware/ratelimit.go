package middleware

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/redis/go-redis/v9"
)

type RateLimitMiddleware struct {
	redis *redis.Client
}

func NewRateLimitMiddleware(redisClient *redis.Client) *RateLimitMiddleware {
	return &RateLimitMiddleware{redis: redisClient}
}

func (m *RateLimitMiddleware) RateLimitByIP(limit int, window time.Duration) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ip := c.RealIP()
			key := fmt.Sprintf("ratelimit:ip:%s", ip)

			ctx := context.Background()
			count, err := m.redis.Incr(ctx, key).Result()
			if err != nil {
				return next(c)
			}

			if count == 1 {
				m.redis.Expire(ctx, key, window)
			}

			if count > int64(limit) {
				return c.JSON(http.StatusTooManyRequests, map[string]string{
					"error": "rate limit exceeded",
				})
			}

			return next(c)
		}
	}
}

func (m *RateLimitMiddleware) RateLimitByAPIKey(limit int, window time.Duration) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			apiKeyID := c.Get("api_key_id")
			if apiKeyID == nil {
				return next(c)
			}

			key := fmt.Sprintf("ratelimit:apikey:%s", apiKeyID)

			ctx := context.Background()
			count, err := m.redis.Incr(ctx, key).Result()
			if err != nil {
				return next(c)
			}

			if count == 1 {
				m.redis.Expire(ctx, key, window)
			}

			if count > int64(limit) {
				return c.JSON(http.StatusTooManyRequests, map[string]string{
					"error": "API key rate limit exceeded",
				})
			}

			return next(c)
		}
	}
}

func (m *RateLimitMiddleware) RateLimitByOrganization(limit int, window time.Duration) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			orgID := c.Get("organization_id")
			if orgID == nil {
				return next(c)
			}

			key := fmt.Sprintf("ratelimit:org:%s", orgID)

			ctx := context.Background()
			count, err := m.redis.Incr(ctx, key).Result()
			if err != nil {
				return next(c)
			}

			if count == 1 {
				m.redis.Expire(ctx, key, window)
			}

			if count > int64(limit) {
				return c.JSON(http.StatusTooManyRequests, map[string]string{
					"error": "organization rate limit exceeded",
				})
			}

			return next(c)
		}
	}
}
