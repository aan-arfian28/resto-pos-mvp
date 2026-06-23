package menu

import (
	"github.com/bistroflow/backend/internal/models"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

// Categories
func (r *Repository) FindAllCategories() ([]models.Category, error) {
	var categories []models.Category
	err := r.db.Preload("Children").Where("parent_id IS NULL").Order("name ASC").Find(&categories).Error
	return categories, err
}

func (r *Repository) FindCategoryByID(id string) (*models.Category, error) {
	var cat models.Category
	err := r.db.Preload("Children").Where("id = ?", id).First(&cat).Error
	return &cat, err
}

func (r *Repository) CreateCategory(cat *models.Category) error {
	return r.db.Create(cat).Error
}

func (r *Repository) UpdateCategory(cat *models.Category) error {
	return r.db.Save(cat).Error
}

func (r *Repository) DeleteCategory(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Category{}).Error
}

// Menu Items
func (r *Repository) FindAllMenuItems() ([]models.MenuItem, error) {
	var items []models.MenuItem
	err := r.db.Preload("Category").Order("name ASC").Find(&items).Error
	return items, err
}

func (r *Repository) FindMenuItemsByCategory(categoryID string) ([]models.MenuItem, error) {
	var items []models.MenuItem
	err := r.db.Preload("Category").Where("category_id = ?", categoryID).Order("name ASC").Find(&items).Error
	return items, err
}

func (r *Repository) FindMenuItemByID(id string) (*models.MenuItem, error) {
	var item models.MenuItem
	err := r.db.Preload("Category").Where("id = ?", id).First(&item).Error
	return &item, err
}

func (r *Repository) CreateMenuItem(item *models.MenuItem) error {
	return r.db.Create(item).Error
}

func (r *Repository) UpdateMenuItem(item *models.MenuItem) error {
	return r.db.Save(item).Error
}

func (r *Repository) DeleteMenuItem(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.MenuItem{}).Error
}

func (r *Repository) FindAvailableMenuItems() ([]models.MenuItem, error) {
	var items []models.MenuItem
	err := r.db.Preload("Category").Where("is_available = ?", true).Order("name ASC").Find(&items).Error
	return items, err
}
