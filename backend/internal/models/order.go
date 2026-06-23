package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OrderType string
type PaymentMethod string
type OrderStatus string

const (
	OrderTypeDineIn   OrderType = "dine_in"
	OrderTypeTakeaway OrderType = "takeaway"
	OrderTypeDelivery OrderType = "delivery"

	PaymentCash   PaymentMethod = "cash"
	PaymentDebit  PaymentMethod = "debit"
	PaymentCredit PaymentMethod = "credit"
	PaymentQRIS   PaymentMethod = "qris"
	PaymentOther  PaymentMethod = "other"

	OrderDraft     OrderStatus = "draft"
	OrderCompleted OrderStatus = "completed"
	OrderVoided    OrderStatus = "voided"
)

type Order struct {
	ID                uuid.UUID     `gorm:"type:uuid;primaryKey" json:"id"`
	ShiftID           *uuid.UUID    `gorm:"type:uuid;index" json:"shift_id,omitempty"`
	UserID            uuid.UUID     `gorm:"type:uuid;not null;index" json:"user_id"`
	Type              OrderType     `gorm:"type:order_type;not null" json:"type"`
	TableNumber       *string       `gorm:"type:varchar(20)" json:"table_number,omitempty"`
	TaxEnabled        bool          `gorm:"not null;default:false" json:"tax_enabled"`
	TaxRate           float64       `gorm:"type:decimal(5,2);check:tax_rate >= 0" json:"tax_rate"`
	TaxAmount         float64       `gorm:"type:decimal(12,2);default:0" json:"tax_amount"`
	Subtotal          float64       `gorm:"type:decimal(12,2);not null;check:subtotal >= 0" json:"subtotal"`
	GrandTotal        float64       `gorm:"type:decimal(12,2);not null;check:grand_total >= 0" json:"grand_total"`
	PaymentMethod     PaymentMethod `gorm:"type:payment_method;not null" json:"payment_method"`
	AmountReceived    *float64      `gorm:"type:decimal(12,2);check:amount_received >= 0" json:"amount_received,omitempty"`
	ChangeAmount      *float64      `gorm:"type:decimal(12,2);check:change_amount >= 0" json:"change_amount,omitempty"`
	Status            OrderStatus   `gorm:"type:order_status;not null;default:'completed'" json:"status"`
	IsSynced          bool          `gorm:"not null;default:true" json:"is_synced"`
	OriginalTimestamp *time.Time    `json:"original_timestamp,omitempty"`
	CreatedAt         time.Time     `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt         time.Time     `gorm:"not null;default:now()" json:"updated_at"`

	User  *User       `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Shift *Shift      `gorm:"foreignKey:ShiftID" json:"shift,omitempty"`
	Items []OrderItem `gorm:"foreignKey:OrderID;constraint:OnDelete:CASCADE" json:"items,omitempty"`
}

func (o *Order) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return nil
}
