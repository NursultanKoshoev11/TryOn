package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/tryon-ai/api/internal/models"
	"github.com/tryon-ai/api/internal/services"
)

type OrganizationHandler struct {
	orgService *services.OrganizationService
}

func NewOrganizationHandler(orgService *services.OrganizationService) *OrganizationHandler {
	return &OrganizationHandler{orgService: orgService}
}

func (h *OrganizationHandler) Create(c echo.Context) error {
	userID := c.Get("user_id").(string)

	var req models.CreateOrganizationRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	org, err := h.orgService.Create(userID, &req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, org)
}

func (h *OrganizationHandler) GetByID(c echo.Context) error {
	userID := c.Get("user_id").(string)
	orgID := c.Param("id")

	// Check ownership
	if err := h.orgService.CheckOwnership(orgID, userID); err != nil {
		return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
	}

	org, err := h.orgService.GetByID(orgID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "organization not found"})
	}

	return c.JSON(http.StatusOK, org)
}

func (h *OrganizationHandler) GetByUserID(c echo.Context) error {
	userID := c.Get("user_id").(string)

	orgs, err := h.orgService.GetByUserID(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to fetch organizations"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"organizations": orgs,
	})
}

func (h *OrganizationHandler) Update(c echo.Context) error {
	userID := c.Get("user_id").(string)
	orgID := c.Param("id")

	// Check ownership
	if err := h.orgService.CheckOwnership(orgID, userID); err != nil {
		return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
	}

	var req models.UpdateOrganizationRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	org, err := h.orgService.Update(orgID, &req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, org)
}

func (h *OrganizationHandler) Delete(c echo.Context) error {
	userID := c.Get("user_id").(string)
	orgID := c.Param("id")

	// Check ownership
	if err := h.orgService.CheckOwnership(orgID, userID); err != nil {
		return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
	}

	if err := h.orgService.Delete(orgID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to delete organization"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "organization deleted"})
}

// Admin endpoints
func (h *OrganizationHandler) GetAll(c echo.Context) error {
	orgs, err := h.orgService.GetAll()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to fetch organizations"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"organizations": orgs,
	})
}

func (h *OrganizationHandler) Suspend(c echo.Context) error {
	orgID := c.Param("id")

	if err := h.orgService.Suspend(orgID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to suspend organization"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "organization suspended"})
}

func (h *OrganizationHandler) Activate(c echo.Context) error {
	orgID := c.Param("id")

	if err := h.orgService.Activate(orgID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to activate organization"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "organization activated"})
}
