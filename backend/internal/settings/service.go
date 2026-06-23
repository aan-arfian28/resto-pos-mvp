package settings

import (
	"fmt"
	"strconv"
	"strings"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

type ActiveSettings struct {
	TaxEnabled   bool    `json:"tax_enabled"`
	TaxRate      float64 `json:"tax_rate"`
	TokenEnabled bool    `json:"token_enabled"`
}

type UpdateSettingsRequest struct {
	TaxEnabled   *bool    `json:"tax_enabled,omitempty"`
	TaxRate      *float64 `json:"tax_rate,omitempty"`
	TokenEnabled *bool    `json:"token_enabled,omitempty"`
}

func (s *Service) GetActive() (*ActiveSettings, error) {
	all, err := s.repo.GetAll()
	if err != nil {
		return nil, fmt.Errorf("fetching settings: %w", err)
	}

	settings := &ActiveSettings{
		TaxEnabled:   false,
		TaxRate:      11.0,
		TokenEnabled: true,
	}

	if v, ok := all["tax_enabled"]; ok {
		settings.TaxEnabled = v == "true"
	}
	if v, ok := all["tax_rate"]; ok {
		rate, _ := strconv.ParseFloat(v, 64)
		if rate > 0 {
			settings.TaxRate = rate
		}
	}
	if v, ok := all["token_enabled"]; ok {
		settings.TokenEnabled = v == "true"
	}

	return settings, nil
}

func (s *Service) List() (map[string]string, error) {
	return s.repo.GetAll()
}

func (s *Service) Update(req UpdateSettingsRequest) error {
	if req.TaxEnabled != nil {
		value := "false"
		if *req.TaxEnabled {
			value = "true"
		}
		if err := s.repo.Upsert("tax_enabled", value, "Enable PPN tax calculation"); err != nil {
			return fmt.Errorf("updating tax_enabled: %w", err)
		}
	}

	if req.TaxRate != nil {
		if *req.TaxRate < 0 || *req.TaxRate > 100 {
			return fmt.Errorf("tax rate must be between 0 and 100")
		}
		value := strings.TrimRight(strings.TrimRight(
			fmt.Sprintf("%.2f", *req.TaxRate), "0"), ".")
		if err := s.repo.Upsert("tax_rate", value, "PPN tax rate percentage"); err != nil {
			return fmt.Errorf("updating tax_rate: %w", err)
		}
	}

	if req.TokenEnabled != nil {
		value := "false"
		if *req.TokenEnabled {
			value = "true"
		}
		if err := s.repo.Upsert("token_enabled", value, "Enable table/token number input"); err != nil {
			return fmt.Errorf("updating token_enabled: %w", err)
		}
	}

	return nil
}
