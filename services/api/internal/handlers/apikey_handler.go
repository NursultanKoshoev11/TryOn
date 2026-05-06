package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/tryon-ai/api/internal/models"
	"github.com/tryon-ai/api/internal/services"
)

type APIKeyHandler struct {
	apikeyService *services.APIKeyService
	orgService    *services.OrganizationService
}

func NewAPIKeyHandler(apikeyService *services.APIKeyService, orgService *services.OrganizationService) *APIKeyHandler {
	return &APIKeyHandler{
		apikeyService: apikeyService,
		orgService:    orgService,
	}
}

func (h *APIKeyHandler) Create(c echo.Context) error {
	userID := c.Get("user_id").(string)
	orgID := c.Param("id")

	// Check ownership
	if err := h.orgService.CheckOwnership(orgID, userID); err != nil {
		return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
	}

	var req models.CreateAPIKeyRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	apiKey, err := h.apikeyService.Create(orgID, &req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, apiKey)
}

func (h *APIKeyHandler) GetByOrganizationID(c echo.Context) error {
	userID := c.Get("user_id").(string)
	orgID := c.Param("id")

	// Check ownership
	if err := h.orgService.CheckOwnership(orgID, userID); err != nil {
		return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
	}

	keys, err := h.apikeyService.GetByOrganizationID(orgID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to fetch API keys"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"api_keys": keys,
	})
}

func (h *APIKeyHandler) Revoke(c echo.Context) error {
	userID := c.Get("user_id").(string)
	orgID := c.Param("id")
	keyID := c.Param("key_id")

	// Check ownership
	if err := h.orgService.CheckOwnership(orgID, userID); err != nil {
		return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
	}

	if err := h.apikeyService.Revoke(keyID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to revoke API key"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "API key revoked"})
}

func (h *APIKeyHandler) Rotate(c echo.Context) error {
	userID := c.Get("user_id").(string)
	orgID := c.Param("id")
	keyID := c.Param("key_id")

	// Check ownership
	if err := h.orgService.CheckOwnership(orgID, userID); err != nil {
		return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
	}

	newKey, err := h.apikeyService.Rotate(keyID, orgID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, newKey)
}
