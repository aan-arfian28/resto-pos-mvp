package menu

import (
	"fmt"

	"github.com/bistroflow/backend/internal/models"
	"github.com/bistroflow/backend/pkg/validator"
	"github.com/google/uuid"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// Category DTOs
type CreateCategoryRequest struct {
	Name     string  `json:"name"`
	ParentID *string `json:"parent_id,omitempty"`
}

type UpdateCategoryRequest struct {
	Name     string  `json:"name"`
	ParentID *string `json:"parent_id,omitempty"`
}

func (s *Service) ListCategories() ([]models.Category, error) {
	return s.repo.FindAllCategories()
}

func (s *Service) GetCategory(id string) (*models.Category, error) {
	return s.repo.FindCategoryByID(id)
}

func (s *Service) CreateCategory(req CreateCategoryRequest) (*models.Category, error) {
	if errMsg := validator.ValidateRequired(req.Name, "Category name"); errMsg != "" {
		return nil, fmt.Errorf("%s", errMsg)
	}

	cat := &models.Category{
		ID:   uuid.New(),
		Name: req.Name,
	}
	if req.ParentID != nil && *req.ParentID != "" {
		pid, err := uuid.Parse(*req.ParentID)
		if err != nil {
			return nil, fmt.Errorf("invalid parent_id")
		}
		cat.ParentID = &pid
	}

	if err := s.repo.CreateCategory(cat); err != nil {
		return nil, fmt.Errorf("creating category: %w", err)
	}
	return cat, nil
}

func (s *Service) UpdateCategory(id string, req UpdateCategoryRequest) (*models.Category, error) {
	cat, err := s.repo.FindCategoryByID(id)
	if err != nil {
		return nil, fmt.Errorf("category not found")
	}

	if req.Name != "" {
		cat.Name = req.Name
	}
	if req.ParentID != nil {
		if *req.ParentID == "" {
			cat.ParentID = nil
		} else {
			pid, err := uuid.Parse(*req.ParentID)
			if err != nil {
				return nil, fmt.Errorf("invalid parent_id")
			}
			cat.ParentID = &pid
		}
	}

	if err := s.repo.UpdateCategory(cat); err != nil {
		return nil, fmt.Errorf("updating category: %w", err)
	}
	return cat, nil
}

func (s *Service) DeleteCategory(id string) error {
	return s.repo.DeleteCategory(id)
}

// Menu Item DTOs
type CreateMenuItemRequest struct {
	CategoryID            *string `json:"category_id,omitempty"`
	Name                  string  `json:"name"`
	Description           string  `json:"description,omitempty"`
	BasePrice             float64 `json:"base_price"`
	ImageURL              string  `json:"image_url,omitempty"`
	DeliveryMarkupPercent float64 `json:"delivery_markup_percent"`
}

type UpdateMenuItemRequest struct {
	CategoryID            *string `json:"category_id,omitempty"`
	Name                  string  `json:"name,omitempty"`
	Description           string  `json:"description,omitempty"`
	BasePrice             float64 `json:"base_price"`
	ImageURL              string  `json:"image_url,omitempty"`
	DeliveryMarkupPercent float64 `json:"delivery_markup_percent"`
	IsAvailable           *bool   `json:"is_available,omitempty"`
}

func (s *Service) ListMenuItems() ([]models.MenuItem, error) {
	return s.repo.FindAllMenuItems()
}

func (s *Service) ListAvailableMenuItems() ([]models.MenuItem, error) {
	return s.repo.FindAvailableMenuItems()
}

func (s *Service) GetMenuItem(id string) (*models.MenuItem, error) {
	return s.repo.FindMenuItemByID(id)
}

func (s *Service) CreateMenuItem(req CreateMenuItemRequest) (*models.MenuItem, error) {
	if errMsg := validator.ValidateRequired(req.Name, "Menu item name"); errMsg != "" {
		return nil, fmt.Errorf("%s", errMsg)
	}
	if req.BasePrice < 0 {
		return nil, fmt.Errorf("base price must be >= 0")
	}
	if req.DeliveryMarkupPercent < 0 {
		return nil, fmt.Errorf("delivery markup percent must be >= 0")
	}

	item := &models.MenuItem{
		ID:                    uuid.New(),
		Name:                  req.Name,
		Description:           req.Description,
		BasePrice:             req.BasePrice,
		ImageURL:              req.ImageURL,
		DeliveryMarkupPercent: req.DeliveryMarkupPercent,
		IsAvailable:           true,
	}

	if req.CategoryID != nil && *req.CategoryID != "" {
		cid, err := uuid.Parse(*req.CategoryID)
		if err != nil {
			return nil, fmt.Errorf("invalid category_id")
		}
		item.CategoryID = &cid
	}

	if err := s.repo.CreateMenuItem(item); err != nil {
		return nil, fmt.Errorf("creating menu item: %w", err)
	}
	return item, nil
}

func (s *Service) UpdateMenuItem(id string, req UpdateMenuItemRequest) (*models.MenuItem, error) {
	item, err := s.repo.FindMenuItemByID(id)
	if err != nil {
		return nil, fmt.Errorf("menu item not found")
	}

	if req.Name != "" {
		item.Name = req.Name
	}
	if req.Description != "" {
		item.Description = req.Description
	}
	if req.BasePrice > 0 {
		item.BasePrice = req.BasePrice
	}
	if req.ImageURL != "" {
		item.ImageURL = req.ImageURL
	}
	if req.DeliveryMarkupPercent >= 0 {
		item.DeliveryMarkupPercent = req.DeliveryMarkupPercent
	}
	if req.IsAvailable != nil {
		item.IsAvailable = *req.IsAvailable
	}
	if req.CategoryID != nil {
		if *req.CategoryID == "" {
			item.CategoryID = nil
		} else {
			cid, err := uuid.Parse(*req.CategoryID)
			if err != nil {
				return nil, fmt.Errorf("invalid category_id")
			}
			item.CategoryID = &cid
		}
	}

	if err := s.repo.UpdateMenuItem(item); err != nil {
		return nil, fmt.Errorf("updating menu item: %w", err)
	}
	return item, nil
}

func (s *Service) DeleteMenuItem(id string) error {
	return s.repo.DeleteMenuItem(id)
}

func (s *Service) CalculateDeliveryPrice(basePrice, markupPercent float64) float64 {
	return basePrice + (basePrice * markupPercent / 100)
}
