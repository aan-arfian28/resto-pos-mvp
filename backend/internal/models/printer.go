package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PrinterType string

const (
	PrinterKitchen PrinterType = "kitchen"
	PrinterReceipt PrinterType = "receipt"
)

type Printer struct {
	ID        uuid.UUID   `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name      string      `gorm:"type:varchar(100);not null" json:"name"`
	Type      PrinterType `gorm:"type:printer_type;not null" json:"type"`
	IPAddress string      `gorm:"type:varchar(50)" json:"ip_address,omitempty"`
	Port      int         `gorm:"default:9100" json:"port"`
	Active    bool        `gorm:"not null;default:true" json:"active"`
	CreatedAt time.Time   `gorm:"not null;default:now()" json:"created_at"`

	Categories []PrinterCategory `gorm:"foreignKey:PrinterID" json:"categories,omitempty"`
}

func (p *Printer) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
