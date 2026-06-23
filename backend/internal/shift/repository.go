package shift

import (
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

func (r *Repository) FindActiveByUserID(userID string) (*models.Shift, error) {
	var shift models.Shift
	err := r.db.Where("user_id = ? AND status = ?", userID, models.ShiftOpen).
		Order("start_time DESC").First(&shift).Error
	if err != nil {
		return nil, err
	}
	return &shift, nil
}

func (r *Repository) Create(shift *models.Shift) error {
	return r.db.Create(shift).Error
}

func (r *Repository) Update(shift *models.Shift) error {
	return r.db.Save(shift).Error
}

func (r *Repository) FindByID(id string) (*models.Shift, error) {
	var shift models.Shift
	err := r.db.Preload("User").Where("id = ?", id).First(&shift).Error
	return &shift, err
}

func (r *Repository) FindHistory(userID string, limit int) ([]models.Shift, error) {
	var shifts []models.Shift
	query := r.db.Preload("User").Order("start_time DESC")
	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}
	if limit > 0 {
		query = query.Limit(limit)
	}
	err := query.Find(&shifts).Error
	return shifts, err
}

func (r *Repository) GetTotalTunaiForShift(shiftID uuid.UUID) (float64, error) {
	var total float64
	err := r.db.Model(&models.Order{}).
		Where("shift_id = ? AND payment_method = ? AND status = ?",
			shiftID, models.PaymentCash, models.OrderCompleted).
		Select("COALESCE(SUM(grand_total), 0)").
		Scan(&total).Error
	return total, err
}

func (r *Repository) GetTotalVoidForShift(shiftID uuid.UUID) (float64, error) {
	var total float64
	err := r.db.Model(&models.Order{}).
		Where("shift_id = ? AND status = ?", shiftID, models.OrderVoided).
		Select("COALESCE(SUM(grand_total), 0)").
		Scan(&total).Error
	return total, err
}

func (r *Repository) HasPendingOrders(shiftID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.Model(&models.Order{}).
		Where("shift_id = ? AND is_synced = ? AND status = ?",
			shiftID, false, models.OrderCompleted).
		Count(&count).Error
	return count > 0, err
}
