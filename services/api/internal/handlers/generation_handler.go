package handlers

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/tryon-ai/api/internal/models"
	"github.com/tryon-ai/api/internal/services"
)

type GenerationHandler struct {
	genService *services.GenerationService
	orgService *services.OrganizationService
}

func NewGenerationHandler(genService *services.GenerationService, orgService *services.OrganizationService) *GenerationHandler {
	return &GenerationHandler{
		genService: genService,
		orgService: orgService,
	}
}

// Create generation via API key (merchant integration)
func (h *GenerationHandler) Create(c echo.Context) error {
	orgID := c.Get("organization_id").(string)
	apiKeyID := c.Get("api_key_id").(string)

	var req models.CreateGenerationRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request"})
	}

	// Set default output count
	if req.OutputCount == 0 {
		req.OutputCount = 4
	}

	gen, err := h.genService.Create(orgID, &apiKeyID, &req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, gen)
}

// Get generation by ID
func (h *GenerationHandler) GetByID(c echo.Context) error {
	orgID := c.Get("organization_id").(string)
	genID := c.Param("generation_id")

	gen, err := h.genService.GetByID(genID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "generation not found"})
	}

	// Check ownership
	if gen.OrganizationID != orgID {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "access denied"})
	}

	return c.JSON(http.StatusOK, gen)
}

// Get generations by organization (dashboard)
func (h *GenerationHandler) GetByOrganizationID(c echo.Context) error {
	userID := c.Get("user_id").(string)
	orgID := c.Param("id")

	// Check ownership
	if err := h.orgService.CheckOwnership(orgID, userID); err != nil {
		return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
	}

	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit == 0 {
		limit = 20
	}

	offset, _ := strconv.Atoi(c.QueryParam("offset"))

	gens, err := h.genService.GetByOrganizationID(orgID, limit, offset)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to fetch generations"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"generations": gens,
		"limit":       limit,
		"offset":      offset,
	})
}

// Get usage statistics
func (h *GenerationHandler) GetUsage(c echo.Context) error {
	userID := c.Get("user_id").(string)
	orgID := c.Param("id")

	// Check ownership
	if err := h.orgService.CheckOwnership(orgID, userID); err != nil {
		return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
	}

	usage, err := h.genService.GetUsage(orgID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to fetch usage"})
	}

	return c.JSON(http.StatusOK, usage)
}

// Get images for generation
func (h *GenerationHandler) GetImages(c echo.Context) error {
	orgID := c.Get("organization_id").(string)
	genID := c.Param("generation_id")

	gen, err := h.genService.GetByID(genID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "generation not found"})
	}

	// Check ownership
	if gen.OrganizationID != orgID {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "access denied"})
	}

	// TODO: Get actual generated images from database
	// For now return mock data
	images := []models.GenerationImageResponse{
		{ID: "1", ViewType: models.ViewTypeFront, URL: "https://placeholder.com/front.jpg"},
		{ID: "2", ViewType: models.ViewTypeLeft, URL: "https://placeholder.com/left.jpg"},
		{ID: "3", ViewType: models.ViewTypeRight, URL: "https://placeholder.com/right.jpg"},
		{ID: "4", ViewType: models.ViewTypeBack, URL: "https://placeholder.com/back.jpg"},
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"images": images,
	})
}
