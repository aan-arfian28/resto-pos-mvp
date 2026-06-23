package opex

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

type CreateOpexRequest struct {
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
	Category    string  `json:"category,omitempty"`
	Date        string  `json:"date"`
}

func (s *Service) List() ([]models.Opex, error) {
	return s.repo.FindAll()
}

func (s *Service) Create(userID string, req CreateOpexRequest) (*models.Opex, error) {
	if errMsg := validator.ValidateRequired(req.Description, "Description"); errMsg != "" {
		return nil, fmt.Errorf("%s", errMsg)
	}
	if req.Amount <= 0 {
		return nil, fmt.Errorf("amount must be greater than 0")
	}

	uid, _ := uuid.Parse(userID)

	o := &models.Opex{
		ID:          uuid.New(),
		Description: req.Description,
		Amount:      req.Amount,
		Category:    req.Category,
		Date:        req.Date,
		UserID:      uid,
	}

	if err := s.repo.Create(o); err != nil {
		return nil, fmt.Errorf("creating opex: %w", err)
	}
	return o, nil
}

func (s *Service) Update(id string, req CreateOpexRequest) (*models.Opex, error) {
	o, err := s.repo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("opex not found")
	}

	o.Description = req.Description
	o.Amount = req.Amount
	o.Category = req.Category
	o.Date = req.Date

	if err := s.repo.Update(o); err != nil {
		return nil, fmt.Errorf("updating opex: %w", err)
	}
	return o, nil
}

func (s *Service) Delete(id string) error {
	return s.repo.Delete(id)
}
