package report

import (
	"fmt"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) GetSummary(from, to string) (*Summary, error) {
	return s.repo.GetSummary(from, to)
}

func (s *Service) GetTopItems(from, to string, limit int) ([]TopItem, error) {
	if limit <= 0 {
		limit = 10
	}
	return s.repo.GetTopItems(from, to, limit)
}

func (s *Service) GetDailySales(from, to string) ([]DailySale, error) {
	return s.repo.GetDailySales(from, to)
}

func (s *Service) GetCSVData(from, to string) ([]byte, error) {
	orders, err := s.repo.GetOrdersForExport(from, to)
	if err != nil {
		return nil, fmt.Errorf("fetching orders: %w", err)
	}

	csv := "Tanggal,No Order,Item,Qty,Harga Satuan,Subtotal,PPN,Grand Total,Metode Bayar\n"
	for _, order := range orders {
		for _, item := range order.Items {
			itemName := ""
			if item.MenuItem != nil {
				itemName = item.MenuItem.Name
			}
			csv += fmt.Sprintf("%s,%s,%s,%d,%.2f,%.2f,%.2f,%.2f,%s\n",
				order.CreatedAt.Format("2006-01-02 15:04:05"),
				order.ID.String(),
				itemName,
				item.Quantity,
				item.Price,
				float64(item.Quantity)*item.Price,
				order.TaxAmount,
				order.GrandTotal,
				order.PaymentMethod,
			)
		}
	}

	return []byte(csv), nil
}
