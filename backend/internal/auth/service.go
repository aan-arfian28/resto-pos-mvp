package auth

import (
	"errors"
	"fmt"

	"github.com/bistroflow/backend/internal/models"
	"github.com/bistroflow/backend/pkg/ratelimit"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Service struct {
	repo        *Repository
	jwt         *JWTService
	rateLimiter *ratelimit.RateLimiter
}

func NewService(repo *Repository, jwt *JWTService, rateLimiter *ratelimit.RateLimiter) *Service {
	return &Service{
		repo:        repo,
		jwt:         jwt,
		rateLimiter: rateLimiter,
	}
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token    string          `json:"token"`
	UserID   string          `json:"user_id"`
	Username string          `json:"username"`
	Role     models.UserRole `json:"role"`
	FullName string          `json:"full_name"`
}

var (
	ErrInvalidCredentials = errors.New("invalid username or password")
	ErrAccountDisabled    = errors.New("account is disabled")
	ErrRateLimited        = errors.New("too many login attempts")
)

func (s *Service) Login(req LoginRequest, clientIP string) (*LoginResponse, error) {
	if s.rateLimiter.IsBlocked(clientIP) {
		return nil, ErrRateLimited
	}

	user, err := s.repo.FindByUsername(req.Username)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			s.rateLimiter.RecordAttempt(clientIP)
			return nil, ErrInvalidCredentials
		}
		return nil, fmt.Errorf("finding user: %w", err)
	}

	if !user.IsActive {
		return nil, ErrAccountDisabled
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		s.rateLimiter.RecordAttempt(clientIP)
		return nil, ErrInvalidCredentials
	}

	s.rateLimiter.ClearAttempts(clientIP)

	token, err := s.jwt.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		return nil, fmt.Errorf("generating token: %w", err)
	}

	return &LoginResponse{
		Token:    token,
		UserID:   user.ID.String(),
		Username: user.Username,
		Role:     user.Role,
		FullName: user.FullName,
	}, nil
}

func (s *Service) GetProfile(userID string) (*models.User, error) {
	return s.repo.FindByID(userID)
}

func (s *Service) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

func (s *Service) CreateUser(username, password, fullName string, role models.UserRole) (*models.User, error) {
	hash, err := s.HashPassword(password)
	if err != nil {
		return nil, fmt.Errorf("hashing password: %w", err)
	}

	user := &models.User{
		ID:           uuid.New(),
		Username:     username,
		PasswordHash: hash,
		Role:         role,
		FullName:     fullName,
		IsActive:     true,
	}

	if err := s.repo.Create(user); err != nil {
		return nil, fmt.Errorf("creating user: %w", err)
	}

	return user, nil
}
