package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PrinterCategory struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	PrinterID  uuid.UUID `gorm:"type:uuid;not null;index" json:"printer_id"`
	CategoryID uuid.UUID `gorm:"type:uuid;not null;index" json:"category_id"`
	CreatedAt  time.Time `gorm:"not null;default:now()" json:"created_at"`

	Printer  *Printer  `gorm:"foreignKey:PrinterID" json:"printer,omitempty"`
	Category *Category `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

func (pc *PrinterCategory) BeforeCreate(tx *gorm.DB) error {
	if pc.ID == uuid.Nil {
		pc.ID = uuid.New()
	}
	return nil
}
