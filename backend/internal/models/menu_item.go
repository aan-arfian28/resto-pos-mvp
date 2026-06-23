package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MenuItem struct {
	ID                    uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CategoryID            *uuid.UUID `gorm:"type:uuid;index" json:"category_id,omitempty"`
	Name                  string    `gorm:"type:varchar(200);not null" json:"name"`
	Description           string    `gorm:"type:text" json:"description,omitempty"`
	BasePrice             float64   `gorm:"type:decimal(12,2);not null;check:base_price >= 0" json:"base_price"`
	ImageURL              string    `gorm:"type:varchar(500)" json:"image_url,omitempty"`
	DeliveryMarkupPercent float64   `gorm:"type:decimal(5,2);not null;default:0;check:delivery_markup_percent >= 0" json:"delivery_markup_percent"`
	IsAvailable           bool      `gorm:"not null;default:true" json:"is_available"`
	CreatedAt             time.Time `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt             time.Time `gorm:"not null;default:now()" json:"updated_at"`

	Category   *Category    `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	OrderItems []OrderItem  `gorm:"foreignKey:MenuItemID" json:"order_items,omitempty"`
}

func (m *MenuItem) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}
