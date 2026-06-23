package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderItem struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OrderID    uuid.UUID `gorm:"type:uuid;not null;index" json:"order_id"`
	MenuItemID uuid.UUID `gorm:"type:uuid;not null" json:"menu_item_id"`
	Quantity   int       `gorm:"not null;check:quantity > 0" json:"quantity"`
	Price      float64   `gorm:"type:decimal(12,2);not null;check:price >= 0" json:"price"`
	Notes      string    `gorm:"type:text" json:"notes,omitempty"`
	IsVoid     bool      `gorm:"not null;default:false" json:"is_void"`
	VoidReason string    `gorm:"type:text" json:"void_reason,omitempty"`
	CreatedAt  time.Time `gorm:"not null;default:now()" json:"created_at"`

	Order    *Order    `gorm:"foreignKey:OrderID" json:"order,omitempty"`
	MenuItem *MenuItem `gorm:"foreignKey:MenuItemID" json:"menu_item,omitempty"`
}

func (oi *OrderItem) BeforeCreate(tx *gorm.DB) error {
	if oi.ID == uuid.Nil {
		oi.ID = uuid.New()
	}
	return nil
}
