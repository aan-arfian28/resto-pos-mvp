package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Opex struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Description string    `gorm:"type:text;not null" json:"description"`
	Amount      float64   `gorm:"type:decimal(12,2);not null;check:amount > 0" json:"amount"`
	Category    string    `gorm:"type:varchar(100)" json:"category,omitempty"`
	Date        string    `gorm:"type:date;not null;default:CURRENT_DATE" json:"date"`
	UserID      uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	CreatedAt   time.Time `gorm:"not null;default:now()" json:"created_at"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (o *Opex) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return nil
}
