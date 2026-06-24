package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserActivityLog struct {
	ID          uuid.UUID       `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID       `gorm:"type:uuid;not null;index" json:"user_id"`
	ActionType  string          `gorm:"type:varchar(50);not null;index" json:"action_type"`
	Description string          `gorm:"type:text" json:"description"`
	Metadata    json.RawMessage `gorm:"type:jsonb" json:"metadata,omitempty"`
	CreatedAt   time.Time       `gorm:"not null;default:now();index" json:"created_at"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (UserActivityLog) TableName() string { return "user_activity_log" }

func (l *UserActivityLog) BeforeCreate(tx *gorm.DB) error {
	if l.ID == uuid.Nil {
		l.ID = uuid.New()
	}
	return nil
}
