package pos

import (
	"fmt"
	"time"

	"github.com/bistroflow/backend/internal/models"
	"github.com/bistroflow/backend/internal/settings"
	"github.com/google/uuid"
)

type Service struct {
	repo         *Repository
	settingsRepo *settings.Repository
}

func NewService(repo *Repository, settingsRepo *settings.Repository) *Service {
	return &Service{
		repo:         repo,
		settingsRepo: settingsRepo,
	}
}

type OrderItemRequest struct {
	MenuItemID string  `json:"menu_item_id"`
	Quantity   int     `json:"quantity"`
	Price      float64 `json:"price"`
	Notes      string  `json:"notes,omitempty"`
}

type CreateOrderRequest struct {
	ShiftID           *string              `json:"shift_id,omitempty"`
	Type              models.OrderType     `json:"type"`
	TableNumber       *string              `json:"table_number,omitempty"`
	Items             []OrderItemRequest   `json:"items"`
	PaymentMethod     models.PaymentMethod `json:"payment_method"`
	AmountReceived    *float64             `json:"amount_received,omitempty"`
	OriginalTimestamp *time.Time           `json:"original_timestamp,omitempty"`
}

type CreateOrderResponse struct {
	OrderID      string   `json:"order_id"`
	Subtotal     float64  `json:"subtotal"`
	TaxAmount    float64  `json:"tax_amount"`
	GrandTotal   float64  `json:"grand_total"`
	ChangeAmount *float64 `json:"change_amount,omitempty"`
}

func (s *Service) CreateOrder(userID string, req CreateOrderRequest) (*CreateOrderResponse, error) {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID")
	}

	if len(req.Items) == 0 {
		return nil, fmt.Errorf("order must have at least one item")
	}

	// Get settings
	taxEnabled := false
	taxRate := 0.0
	settingsMap, _ := s.settingsRepo.GetAll()
	if v, ok := settingsMap["tax_enabled"]; ok && v == "true" {
		taxEnabled = true
	}
	if v, ok := settingsMap["tax_rate"]; ok {
		fmt.Sscanf(v, "%f", &taxRate)
	}

	// Calculate subtotal
	var subtotal float64
	orderItems := make([]models.OrderItem, 0, len(req.Items))

	for _, item := range req.Items {
		menuItem, err := s.repo.FindMenuItem(item.MenuItemID)
		if err != nil {
			return nil, fmt.Errorf("menu item %s not found", item.MenuItemID)
		}

		if !menuItem.IsAvailable {
			return nil, fmt.Errorf("menu item '%s' is not available", menuItem.Name)
		}

		price := menuItem.BasePrice
		if req.Type == models.OrderTypeDelivery {
			price = price + (price * menuItem.DeliveryMarkupPercent / 100)
		}

		if item.Price > 0 {
			price = item.Price // Use client-side calculated price
		}

		if item.Quantity < 1 {
			item.Quantity = 1
		}

		lineTotal := price * float64(item.Quantity)
		subtotal += lineTotal

		menuItemID, _ := uuid.Parse(item.MenuItemID)
		orderItems = append(orderItems, models.OrderItem{
			ID:         uuid.New(),
			MenuItemID: menuItemID,
			Quantity:   item.Quantity,
			Price:      price,
			Notes:      item.Notes,
		})
	}

	// Calculate tax
	var taxAmount float64
	if taxEnabled {
		taxAmount = subtotal * taxRate / 100
	}

	grandTotal := subtotal + taxAmount

	// Calculate change
	var changeAmount *float64
	if req.PaymentMethod == models.PaymentCash && req.AmountReceived != nil {
		change := *req.AmountReceived - grandTotal
		if change < 0 {
			return nil, fmt.Errorf("insufficient payment: received %.2f, total %.2f", *req.AmountReceived, grandTotal)
		}
		changeAmount = &change
	}

	orderID := uuid.New()
	var shiftID *uuid.UUID
	if req.ShiftID != nil {
		sid, err := uuid.Parse(*req.ShiftID)
		if err == nil {
			shiftID = &sid
		}
	}

	order := &models.Order{
		ID:                orderID,
		ShiftID:           shiftID,
		UserID:            uid,
		Type:              req.Type,
		TableNumber:       req.TableNumber,
		TaxEnabled:        taxEnabled,
		TaxRate:           taxRate,
		TaxAmount:         taxAmount,
		Subtotal:          subtotal,
		GrandTotal:        grandTotal,
		PaymentMethod:     req.PaymentMethod,
		AmountReceived:    req.AmountReceived,
		ChangeAmount:      changeAmount,
		Status:            models.OrderCompleted,
		IsSynced:          true,
		OriginalTimestamp: req.OriginalTimestamp,
		Items:             orderItems,
	}

	if err := s.repo.ProcessBatchOrder(order); err != nil {
		return nil, fmt.Errorf("saving order: %w", err)
	}

	return &CreateOrderResponse{
		OrderID:      orderID.String(),
		Subtotal:     subtotal,
		TaxAmount:    taxAmount,
		GrandTotal:   grandTotal,
		ChangeAmount: changeAmount,
	}, nil
}

func (s *Service) ProcessBatchOrders(reqs []CreateOrderRequestWithUser) ([]BatchResult, error) {
	results := make([]BatchResult, 0, len(reqs))

	for _, r := range reqs {
		resp, err := s.CreateOrder(r.UserID, r.Request)
		result := BatchResult{
			Success: err == nil,
		}
		if err != nil {
			result.Error = err.Error()
		} else {
			result.OrderID = resp.OrderID
		}
		results = append(results, result)
	}

	return results, nil
}

type CreateOrderRequestWithUser struct {
	UserID  string
	Request CreateOrderRequest
}

type BatchResult struct {
	Success bool   `json:"success"`
	OrderID string `json:"order_id"`
	Error   string `json:"error,omitempty"`
}
