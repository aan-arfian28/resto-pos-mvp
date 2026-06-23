package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RawMaterial struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name         string    `gorm:"type:varchar(200);not null" json:"name"`
	Unit         string    `gorm:"type:varchar(20);not null" json:"unit"`
	CurrentStock float64   `gorm:"type:decimal(10,2);not null;default:0;check:current_stock >= 0" json:"current_stock"`
	MinimumStock float64   `gorm:"type:decimal(10,2);not null;default:0;check:minimum_stock >= 0" json:"minimum_stock"`
	CreatedAt    time.Time `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt    time.Time `gorm:"not null;default:now()" json:"updated_at"`

	Transactions []StockTransaction `gorm:"foreignKey:RawMaterialID" json:"transactions,omitempty"`
}

func (rm *RawMaterial) BeforeCreate(tx *gorm.DB) error {
	if rm.ID == uuid.Nil {
		rm.ID = uuid.New()
	}
	return nil
}

func (rm *RawMaterial) IsLowStock() bool {
	return rm.CurrentStock <= rm.MinimumStock
}
