package activitylog

import "github.com/bistroflow/backend/internal/models"

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) List(userID, actionType string, page, limit int) ([]models.UserActivityLog, int64, error) {
	return s.repo.List(userID, actionType, page, limit)
}
