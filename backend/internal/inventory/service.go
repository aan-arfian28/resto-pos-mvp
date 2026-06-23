package inventory

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

type CreateRawMaterialRequest struct {
	Name         string  `json:"name"`
	Unit         string  `json:"unit"`
	CurrentStock float64 `json:"current_stock"`
	MinimumStock float64 `json:"minimum_stock"`
}

func (s *Service) ListRawMaterials() ([]models.RawMaterial, error) {
	return s.repo.FindAllRawMaterials()
}

func (s *Service) CreateRawMaterial(req CreateRawMaterialRequest) (*models.RawMaterial, error) {
	if errMsg := validator.ValidateRequired(req.Name, "Name"); errMsg != "" {
		return nil, fmt.Errorf("%s", errMsg)
	}
	if errMsg := validator.ValidateRequired(req.Unit, "Unit"); errMsg != "" {
		return nil, fmt.Errorf("%s", errMsg)
	}

	m := &models.RawMaterial{
		ID:           uuid.New(),
		Name:         req.Name,
		Unit:         req.Unit,
		CurrentStock: req.CurrentStock,
		MinimumStock: req.MinimumStock,
	}
	if err := s.repo.CreateRawMaterial(m); err != nil {
		return nil, fmt.Errorf("creating raw material: %w", err)
	}
	return m, nil
}

func (s *Service) UpdateRawMaterial(id string, req CreateRawMaterialRequest) (*models.RawMaterial, error) {
	m, err := s.repo.FindRawMaterialByID(id)
	if err != nil {
		return nil, fmt.Errorf("raw material not found")
	}
	m.Name = req.Name
	m.Unit = req.Unit
	m.MinimumStock = req.MinimumStock
	if err := s.repo.UpdateRawMaterial(m); err != nil {
		return nil, fmt.Errorf("updating raw material: %w", err)
	}
	return m, nil
}

func (s *Service) DeleteRawMaterial(id string) error {
	hasRecent, err := s.repo.HasRecentTransactions(id, 30)
	if err != nil {
		return fmt.Errorf("checking transactions: %w", err)
	}
	if hasRecent {
		return fmt.Errorf("cannot delete: material has transactions in the last 30 days")
	}
	return s.repo.DeleteRawMaterial(id)
}

type StockInRequest struct {
	MaterialID string  `json:"raw_material_id"`
	Quantity   float64 `json:"quantity"`
	Reference  string  `json:"reference,omitempty"`
	Reason     string  `json:"reason,omitempty"`
}

type StockOutRequest struct {
	MaterialID string  `json:"raw_material_id"`
	Quantity   float64 `json:"quantity"`
	Reason     string  `json:"reason"`
}

func (s *Service) StockIn(userID string, req StockInRequest) error {
	if req.Quantity <= 0 {
		return fmt.Errorf("quantity must be positive")
	}

	if err := s.repo.UpdateStock(req.MaterialID, req.Quantity); err != nil {
		return fmt.Errorf("updating stock: %w", err)
	}

	uid, _ := uuid.Parse(userID)
	mid, _ := uuid.Parse(req.MaterialID)
	tx := &models.StockTransaction{
		ID:            uuid.New(),
		RawMaterialID: mid,
		Type:          models.StockIn,
		Quantity:      req.Quantity,
		Reason:        req.Reason,
		Reference:     req.Reference,
		UserID:        uid,
	}
	return s.repo.CreateStockTransaction(tx)
}

func (s *Service) StockOut(userID string, req StockOutRequest) error {
	if req.Quantity <= 0 {
		return fmt.Errorf("quantity must be positive")
	}

	material, err := s.repo.FindRawMaterialByID(req.MaterialID)
	if err != nil {
		return fmt.Errorf("raw material not found")
	}
	if material.CurrentStock < req.Quantity {
		return fmt.Errorf("insufficient stock: have %.2f %s, trying to remove %.2f %s",
			material.CurrentStock, material.Unit, req.Quantity, material.Unit)
	}

	if err := s.repo.UpdateStock(req.MaterialID, -req.Quantity); err != nil {
		return fmt.Errorf("updating stock: %w", err)
	}

	uid, _ := uuid.Parse(userID)
	mid, _ := uuid.Parse(req.MaterialID)
	tx := &models.StockTransaction{
		ID:            uuid.New(),
		RawMaterialID: mid,
		Type:          models.StockOut,
		Quantity:      req.Quantity,
		Reason:        req.Reason,
		UserID:        uid,
	}
	return s.repo.CreateStockTransaction(tx)
}

func (s *Service) GetLowStock() ([]models.RawMaterial, error) {
	return s.repo.FindLowStock()
}

func (s *Service) GetHistory(materialID string, page, limit int) ([]models.StockTransaction, int64, error) {
	offset := (page - 1) * limit
	return s.repo.FindStockHistory(materialID, limit, offset)
}
