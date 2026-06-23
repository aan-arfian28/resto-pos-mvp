package printer

import (
	"fmt"
	"net"
	"time"

	"github.com/bistroflow/backend/internal/models"
	"github.com/bistroflow/backend/internal/websocket"
	"github.com/google/uuid"
)

type Service struct {
	repo   *Repository
	wsHub  *websocket.Hub
}

func NewService(repo *Repository, wsHub *websocket.Hub) *Service {
	return &Service{repo: repo, wsHub: wsHub}
}

type CreatePrinterRequest struct {
	Name      string             `json:"name"`
	Type      models.PrinterType `json:"type"`
	IPAddress string             `json:"ip_address,omitempty"`
	Port      int                `json:"port"`
}

func (s *Service) List() ([]models.Printer, error) {
	return s.repo.FindAll()
}

func (s *Service) GetByID(id string) (*models.Printer, error) {
	return s.repo.FindByID(id)
}

func (s *Service) Create(req CreatePrinterRequest) (*models.Printer, error) {
	if req.Port == 0 {
		req.Port = 9100
	}

	p := &models.Printer{
		ID:        uuid.New(),
		Name:      req.Name,
		Type:      req.Type,
		IPAddress: req.IPAddress,
		Port:      req.Port,
		Active:    true,
	}

	if err := s.repo.Create(p); err != nil {
		return nil, fmt.Errorf("creating printer: %w", err)
	}
	return p, nil
}

func (s *Service) Update(id string, req CreatePrinterRequest) (*models.Printer, error) {
	p, err := s.repo.FindByID(id)
	if err != nil {
		return nil, fmt.Errorf("printer not found")
	}

	p.Name = req.Name
	p.Type = req.Type
	p.IPAddress = req.IPAddress
	if req.Port > 0 {
		p.Port = req.Port
	}

	if err := s.repo.Update(p); err != nil {
		return nil, fmt.Errorf("updating printer: %w", err)
	}
	return p, nil
}

func (s *Service) Delete(id string) error {
	return s.repo.Delete(id)
}

func (s *Service) TestPrint(id string) error {
	p, err := s.repo.FindByID(id)
	if err != nil {
		return fmt.Errorf("printer not found")
	}

	if p.IPAddress == "" {
		return fmt.Errorf("printer has no IP address configured")
	}

	return sendESCOS(p.IPAddress, p.Port, []byte("\x1B\x40\x1B\x21\x00"))
}

func (s *Service) DispatchKitchenTicket(orderID, tableNumber string, items []websocket.PrintItem) {
	job := websocket.PrintJob{
		OrderID:     orderID,
		TableNumber: tableNumber,
		Items:       items,
		Timestamp:   time.Now(),
	}
	s.wsHub.BroadcastPrintJob("dapur", job)
}

func (s *Service) MapCategory(printerID, categoryID string) error {
	pid, err := uuid.Parse(printerID)
	if err != nil {
		return fmt.Errorf("invalid printer_id")
	}
	cid, err := uuid.Parse(categoryID)
	if err != nil {
		return fmt.Errorf("invalid category_id")
	}

	mapping := &models.PrinterCategory{
		ID:         uuid.New(),
		PrinterID:  pid,
		CategoryID: cid,
	}
	return s.repo.CreatePrinterCategory(mapping)
}

func (s *Service) UnmapCategory(mappingID string) error {
	return s.repo.DeletePrinterCategory(mappingID)
}

func sendESCOS(ip string, port int, data []byte) error {
	addr := fmt.Sprintf("%s:%d", ip, port)
	conn, err := net.DialTimeout("tcp", addr, 5*time.Second)
	if err != nil {
		return fmt.Errorf("connecting to printer: %w", err)
	}
	defer conn.Close()

	conn.SetWriteDeadline(time.Now().Add(5 * time.Second))
	_, err = conn.Write(data)
	if err != nil {
		return fmt.Errorf("sending to printer: %w", err)
	}

	return nil
}
