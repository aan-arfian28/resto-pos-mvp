package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ShiftStatus string

const (
	ShiftOpen   ShiftStatus = "open"
	ShiftClosed ShiftStatus = "closed"
)

type Shift struct {
	ID          uuid.UUID   `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID   `gorm:"type:uuid;not null;index" json:"user_id"`
	StartTime   time.Time   `gorm:"not null;default:now()" json:"start_time"`
	EndTime     *time.Time  `json:"end_time,omitempty"`
	ModalAwal   float64     `gorm:"type:decimal(12,2);not null;check:modal_awal >= 0" json:"modal_awal"`
	TotalTunai  float64     `gorm:"type:decimal(12,2);default:0" json:"total_tunai"`
	TotalVoid   float64     `gorm:"type:decimal(12,2);default:0" json:"total_void"`
	SaldoAkhir  *float64    `gorm:"type:decimal(12,2)" json:"saldo_akhir,omitempty"`
	SaldoAktual *float64    `gorm:"type:decimal(12,2)" json:"saldo_aktual,omitempty"`
	Status      ShiftStatus `gorm:"type:shift_status;not null;default:'open'" json:"status"`
	CreatedAt   time.Time   `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt   time.Time   `gorm:"not null;default:now()" json:"updated_at"`

	User   *User   `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Orders []Order `gorm:"foreignKey:ShiftID" json:"orders,omitempty"`
}

func (s *Shift) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
