package settings

import (
	"github.com/bistroflow/backend/internal/models"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) GetAll() (map[string]string, error) {
	var settings []models.Setting
	if err := r.db.Find(&settings).Error; err != nil {
		return nil, err
	}

	result := make(map[string]string, len(settings))
	for _, s := range settings {
		result[s.Key] = s.Value
	}
	return result, nil
}

func (r *Repository) Get(key string) (*models.Setting, error) {
	var setting models.Setting
	err := r.db.Where("key = ?", key).First(&setting).Error
	return &setting, err
}

func (r *Repository) Upsert(key, value, description string) error {
	setting := models.Setting{
		Key:         key,
		Value:       value,
		Description: description,
	}
	return r.db.Where("key = ?", key).Assign(setting).FirstOrCreate(&setting).Error
}

func (r *Repository) List() ([]models.Setting, error) {
	var settings []models.Setting
	err := r.db.Order("key ASC").Find(&settings).Error
	return settings, err
}
