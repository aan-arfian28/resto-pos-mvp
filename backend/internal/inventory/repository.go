package inventory

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

func (r *Repository) FindAllRawMaterials() ([]models.RawMaterial, error) {
	var materials []models.RawMaterial
	err := r.db.Order("name ASC").Find(&materials).Error
	return materials, err
}

func (r *Repository) FindRawMaterialByID(id string) (*models.RawMaterial, error) {
	var m models.RawMaterial
	err := r.db.Where("id = ?", id).First(&m).Error
	return &m, err
}

func (r *Repository) CreateRawMaterial(m *models.RawMaterial) error {
	return r.db.Create(m).Error
}

func (r *Repository) UpdateRawMaterial(m *models.RawMaterial) error {
	return r.db.Save(m).Error
}

func (r *Repository) DeleteRawMaterial(id string) error {
	return r.db.Where("id = ?", id).Delete(&models.RawMaterial{}).Error
}

func (r *Repository) FindLowStock() ([]models.RawMaterial, error) {
	var materials []models.RawMaterial
	err := r.db.Where("current_stock <= minimum_stock").Order("current_stock ASC").Limit(5).Find(&materials).Error
	return materials, err
}

func (r *Repository) CreateStockTransaction(tx *models.StockTransaction) error {
	return r.db.Create(tx).Error
}

func (r *Repository) FindStockHistory(materialID string, limit, offset int) ([]models.StockTransaction, int64, error) {
	var transactions []models.StockTransaction
	var total int64

	query := r.db.Model(&models.StockTransaction{}).Preload("User").Preload("RawMaterial")
	if materialID != "" {
		query = query.Where("raw_material_id = ?", materialID)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&transactions).Error
	return transactions, total, err
}

func (r *Repository) UpdateStock(materialID string, delta float64) error {
	return r.db.Model(&models.RawMaterial{}).
		Where("id = ?", materialID).
		Update("current_stock", gorm.Expr("current_stock + ?", delta)).Error
}

func (r *Repository) HasRecentTransactions(materialID string, days int) (bool, error) {
	var count int64
	err := r.db.Model(&models.StockTransaction{}).
		Where("raw_material_id = ? AND created_at > NOW() - INTERVAL '1 day' * ?", materialID, days).
		Count(&count).Error
	return count > 0, err
}
