package opex

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

func (r *Repository) FindAll() ([]models.Opex, error) {
	var expenses []models.Opex
	err := r.db.Preload("User").Order("date DESC, created_at DESC").Find(&expenses).Error
	return expenses, err
}

func (r *Repository) FindByID(id string) (*models.Opex, error) {
	var o models.Opex
	err := r.db.Where("id = ?", id).First(&o).Error
	return &o, err
}

func (r *Repository) Create(o *models.Opex) error {
	return r.db.Create(o).Error
}

func (r *Repository) Update(o *models.Opex) error {
	return r.db.Save(o).Error
}

func (r *Repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Opex{}).Error
}

func (r *Repository) SumByDateRange(from, to string) (float64, error) {
	var total float64
	err := r.db.Model(&models.Opex{}).
		Where("date >= ? AND date <= ?", from, to).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total).Error
	return total, err
}
