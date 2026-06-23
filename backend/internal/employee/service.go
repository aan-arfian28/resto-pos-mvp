package employee

import (
	"fmt"

	"github.com/bistroflow/backend/internal/models"
	"github.com/bistroflow/backend/pkg/validator"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

type CreateEmployeeRequest struct {
	Username        string          `json:"username"`
	Password        string          `json:"password"`
	ConfirmPassword string          `json:"confirm_password"`
	FullName        string          `json:"full_name"`
	Role            models.UserRole `json:"role"`
}

type UpdateEmployeeRequest struct {
	FullName string          `json:"full_name"`
	Role     models.UserRole `json:"role"`
	IsActive *bool           `json:"is_active,omitempty"`
}

func (s *Service) List() ([]models.User, error) {
	return s.repo.FindAll()
}

func (s *Service) GetByID(id string) (*models.User, error) {
	return s.repo.FindByID(id)
}

func (s *Service) Create(req CreateEmployeeRequest) (*models.User, error) {
	if errMsg := validator.ValidateUsername(req.Username); errMsg != "" {
		return nil, fmt.Errorf("%s", errMsg)
	}
	if errMsg := validator.ValidatePassword(req.Password); errMsg != "" {
		return nil, fmt.Errorf("%s", errMsg)
	}
	if req.Password != req.ConfirmPassword {
		return nil, fmt.Errorf("password and confirmation do not match")
	}
	if errMsg := validator.ValidateRequired(req.FullName, "Full name"); errMsg != "" {
		return nil, fmt.Errorf("%s", errMsg)
	}
	if req.Role != models.RoleOwner && req.Role != models.RoleCashier {
		return nil, fmt.Errorf("invalid role: must be 'owner' or 'cashier'")
	}

	taken, err := s.repo.IsUsernameTaken(req.Username, "")
	if err != nil {
		return nil, fmt.Errorf("checking username: %w", err)
	}
	if taken {
		return nil, fmt.Errorf("username already taken")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("hashing password: %w", err)
	}

	user := &models.User{
		ID:           uuid.New(),
		Username:     req.Username,
		PasswordHash: string(hash),
		Role:         req.Role,
		FullName:     req.FullName,
		IsActive:     true,
	}

	if err := s.repo.Create(user); err != nil {
		return nil, fmt.Errorf("creating employee: %w", err)
	}

	return user, nil
}

func (s *Service) Update(id string, req UpdateEmployeeRequest) (*models.User, error) {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("employee not found: %w", err)
	}

	if req.FullName != "" {
		user.FullName = req.FullName
	}
	if req.Role == models.RoleOwner || req.Role == models.RoleCashier {
		user.Role = req.Role
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}

	if err := s.repo.Update(user); err != nil {
		return nil, fmt.Errorf("updating employee: %w", err)
	}
	return user, nil
}

func (s *Service) Delete(id string, currentUserID string) error {
	if id == currentUserID {
		return fmt.Errorf("cannot delete your own account")
	}

	user, err := s.repo.FindByID(id)
	if err != nil {
		return fmt.Errorf("employee not found: %w", err)
	}
	_ = user

	return s.repo.SoftDelete(id)
}
