package pos

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

func (r *Repository) CreateOrder(order *models.Order) error {
	return r.db.Create(order).Error
}

func (r *Repository) CreateOrderWithItems(order *models.Order) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(order).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *Repository) FindOrderByID(id string) (*models.Order, error) {
	var order models.Order
	err := r.db.Preload("Items").Preload("Items.MenuItem").Where("id = ?", id).First(&order).Error
	return &order, err
}

func (r *Repository) FindOrdersByShift(shiftID uuid.UUID) ([]models.Order, error) {
	var orders []models.Order
	err := r.db.Preload("Items").Where("shift_id = ?", shiftID).
		Order("created_at DESC").Find(&orders).Error
	return orders, err
}

func (r *Repository) UpdateOrder(order *models.Order) error {
	return r.db.Save(order).Error
}

func (r *Repository) ProcessBatchOrder(order *models.Order) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Create the order
		if err := tx.Create(order).Error; err != nil {
			return err
		}
		// The order_items are auto-created via GORM association
		return nil
	})
}

func (r *Repository) FindMenuItem(id string) (*models.MenuItem, error) {
	var item models.MenuItem
	err := r.db.Where("id = ?", id).First(&item).Error
	return &item, err
}

func (r *Repository) UpdateMenuItemAvailability(id string, available bool) error {
	return r.db.Model(&models.MenuItem{}).Where("id = ?", id).
		Update("is_available", available).Error
}
