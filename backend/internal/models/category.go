package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Category struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name      string     `gorm:"type:varchar(100);not null" json:"name"`
	ParentID  *uuid.UUID `gorm:"type:uuid;index" json:"parent_id,omitempty"`
	CreatedAt time.Time  `gorm:"not null;default:now()" json:"created_at"`

	Parent   *Category   `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children []Category  `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	Items    []MenuItem  `gorm:"foreignKey:CategoryID" json:"items,omitempty"`
}

func (c *Category) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}
