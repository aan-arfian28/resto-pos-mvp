package activitylog

import (
	"encoding/json"

	"github.com/bistroflow/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(log *models.UserActivityLog) error {
	return r.db.Create(log).Error
}

func (r *Repository) List(userID, actionType string, page, limit int) ([]models.UserActivityLog, int64, error) {
	var logs []models.UserActivityLog
	var total int64

	query := r.db.Model(&models.UserActivityLog{}).Preload("User")

	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}
	if actionType != "" {
		query = query.Where("action_type = ?", actionType)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&logs).Error
	return logs, total, err
}

func LogActivity(db *gorm.DB, userID, actionType, description string, metadata map[string]interface{}) error {
	var metaJSON json.RawMessage
	if metadata != nil {
		data, err := json.Marshal(metadata)
		if err != nil {
			return err
		}
		metaJSON = data
	}

	uid, err := uuid.Parse(userID)
	if err != nil {
		uid = uuid.Nil
	}

	log := &models.UserActivityLog{
		UserID:      uid,
		ActionType:  actionType,
		Description: description,
		Metadata:    metaJSON,
	}

	return db.Create(log).Error
}
