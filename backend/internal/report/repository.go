package report

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

type Summary struct {
	TotalTransactions int64   `json:"total_transactions"`
	GrossRevenue      float64 `json:"gross_revenue"`
	TotalTax          float64 `json:"total_tax"`
	TotalVoid         float64 `json:"total_void"`
	TotalOpex         float64 `json:"total_opex"`
	GrossProfit       float64 `json:"gross_profit"`
}

type TopItem struct {
	MenuItemID string  `json:"menu_item_id"`
	ItemName   string  `json:"item_name"`
	TotalQty   int64   `json:"total_qty"`
	TotalValue float64 `json:"total_value"`
}

type DailySale struct {
	Date    string  `json:"date"`
	Revenue float64 `json:"revenue"`
	Orders  int64   `json:"orders"`
}

func (r *Repository) GetSummary(from, to string) (*Summary, error) {
	var summary Summary

	// Total completed transactions
	r.db.Model(&models.Order{}).
		Where("created_at >= ? AND created_at <= ? AND status = ? AND is_synced = ?",
			from, to, models.OrderCompleted, true).
		Count(&summary.TotalTransactions)

	// Gross revenue
	r.db.Model(&models.Order{}).
		Where("created_at >= ? AND created_at <= ? AND status = ? AND is_synced = ?",
			from, to, models.OrderCompleted, true).
		Select("COALESCE(SUM(subtotal), 0)").
		Scan(&summary.GrossRevenue)

	// Total tax
	r.db.Model(&models.Order{}).
		Where("created_at >= ? AND created_at <= ? AND status = ? AND is_synced = ? AND tax_enabled = ?",
			from, to, models.OrderCompleted, true, true).
		Select("COALESCE(SUM(tax_amount), 0)").
		Scan(&summary.TotalTax)

	// Total void
	r.db.Model(&models.Order{}).
		Where("created_at >= ? AND created_at <= ? AND status = ? AND is_synced = ?",
			from, to, models.OrderVoided, true).
		Select("COALESCE(SUM(grand_total), 0)").
		Scan(&summary.TotalVoid)

	// Total opex
	r.db.Model(&models.Opex{}).
		Where("date >= ? AND date <= ?", from, to).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&summary.TotalOpex)

	summary.GrossProfit = summary.GrossRevenue - summary.TotalTax - summary.TotalVoid - summary.TotalOpex

	return &summary, nil
}

func (r *Repository) GetTopItems(from, to string, limit int) ([]TopItem, error) {
	var items []TopItem
	err := r.db.Model(&models.OrderItem{}).
		Select("menu_item_id, menu_items.name as item_name, SUM(quantity) as total_qty, SUM(order_items.price * order_items.quantity) as total_value").
		Joins("JOIN menu_items ON menu_items.id = order_items.menu_item_id").
		Joins("JOIN orders ON orders.id = order_items.order_id").
		Where("orders.created_at >= ? AND orders.created_at <= ? AND orders.status = ? AND orders.is_synced = ?",
			from, to, models.OrderCompleted, true).
		Group("menu_item_id, menu_items.name").
		Order("total_qty DESC").
		Limit(limit).
		Scan(&items).Error
	return items, err
}

func (r *Repository) GetDailySales(from, to string) ([]DailySale, error) {
	var sales []DailySale
	err := r.db.Model(&models.Order{}).
		Select("DATE(created_at) as date, COALESCE(SUM(subtotal), 0) as revenue, COUNT(*) as orders").
		Where("created_at >= ? AND created_at <= ? AND status = ? AND is_synced = ?",
			from, to, models.OrderCompleted, true).
		Group("DATE(created_at)").
		Order("date ASC").
		Scan(&sales).Error
	return sales, err
}

func (r *Repository) GetOrdersForExport(from, to string) ([]models.Order, error) {
	var orders []models.Order
	err := r.db.Preload("Items").Preload("Items.MenuItem").
		Where("created_at >= ? AND created_at <= ? AND is_synced = ?",
			from, to, true).
		Order("created_at ASC").
		Find(&orders).Error
	return orders, err
}
