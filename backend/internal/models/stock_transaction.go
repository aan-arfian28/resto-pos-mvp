package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type StockTransactionType string

const (
	StockIn        StockTransactionType = "in"
	StockOut       StockTransactionType = "out"
	StockAdjustment StockTransactionType = "adjustment"
)

type StockTransaction struct {
	ID             uuid.UUID            `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	RawMaterialID  uuid.UUID            `gorm:"type:uuid;not null;index" json:"raw_material_id"`
	Type           StockTransactionType `gorm:"type:stock_transaction_type;not null" json:"type"`
	Quantity       float64              `gorm:"type:decimal(10,2);not null;check:quantity != 0" json:"quantity"`
	Reason         string               `gorm:"type:text" json:"reason,omitempty"`
	Reference      string               `gorm:"type:varchar(200)" json:"reference,omitempty"`
	UserID         uuid.UUID            `gorm:"type:uuid;not null" json:"user_id"`
	CreatedAt      time.Time            `gorm:"not null;default:now()" json:"created_at"`

	RawMaterial *RawMaterial `gorm:"foreignKey:RawMaterialID" json:"raw_material,omitempty"`
	User        *User        `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (st *StockTransaction) BeforeCreate(tx *gorm.DB) error {
	if st.ID == uuid.Nil {
		st.ID = uuid.New()
	}
	return nil
}
