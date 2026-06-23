package printer

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

func (r *Repository) FindAll() ([]models.Printer, error) {
	var printers []models.Printer
	err := r.db.Preload("Categories").Order("name ASC").Find(&printers).Error
	return printers, err
}

func (r *Repository) FindByID(id string) (*models.Printer, error) {
	var p models.Printer
	err := r.db.Preload("Categories").Where("id = ?", id).First(&p).Error
	return &p, err
}

func (r *Repository) FindActiveKitchenPrinters() ([]models.Printer, error) {
	var printers []models.Printer
	err := r.db.Where("type = ? AND active = ?", models.PrinterKitchen, true).Find(&printers).Error
	return printers, err
}

func (r *Repository) Create(printer *models.Printer) error {
	return r.db.Create(printer).Error
}

func (r *Repository) Update(printer *models.Printer) error {
	return r.db.Save(printer).Error
}

func (r *Repository) Delete(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.Printer{}).Error
}

func (r *Repository) FindPrinterCategories(printerID string) ([]models.PrinterCategory, error) {
	var mappings []models.PrinterCategory
	err := r.db.Preload("Category").Where("printer_id = ?", printerID).Find(&mappings).Error
	return mappings, err
}

func (r *Repository) CreatePrinterCategory(mapping *models.PrinterCategory) error {
	return r.db.Create(mapping).Error
}

func (r *Repository) DeletePrinterCategory(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.PrinterCategory{}).Error
}

func (r *Repository) FindPrintersByCategory(categoryID string) ([]models.Printer, error) {
	var printers []models.Printer
	err := r.db.Joins("JOIN printer_categories ON printer_categories.printer_id = printers.id").
		Where("printer_categories.category_id = ? AND printers.active = ?", categoryID, true).
		Find(&printers).Error
	return printers, err
}
