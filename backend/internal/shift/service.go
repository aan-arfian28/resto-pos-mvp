package shift

import (
	"fmt"
	"time"

	"github.com/bistroflow/backend/internal/models"
	"github.com/google/uuid"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

type OpenShiftRequest struct {
	ModalAwal float64 `json:"modal_awal"`
}

type EndShiftRequest struct {
	SaldoAktual *float64 `json:"saldo_aktual,omitempty"`
}

type ZReport struct {
	ShiftID     string  `json:"shift_id"`
	UserName    string  `json:"user_name"`
	StartTime   string  `json:"start_time"`
	EndTime     string  `json:"end_time"`
	ModalAwal   float64 `json:"modal_awal"`
	TotalTunai  float64 `json:"total_tunai"`
	TotalVoid   float64 `json:"total_void"`
	SaldoAkhir  float64 `json:"saldo_akhir"`
	SaldoAktual *float64 `json:"saldo_aktual,omitempty"`
	Selisih     *float64 `json:"selisih,omitempty"`
}

func (s *Service) GetActiveShift(userID string) (*models.Shift, error) {
	return s.repo.FindActiveByUserID(userID)
}

func (s *Service) OpenShift(userID string, req OpenShiftRequest) (*models.Shift, error) {
	if req.ModalAwal < 0 {
		return nil, fmt.Errorf("modal awal must be >= 0")
	}

	// Check for existing open shift
	existing, _ := s.repo.FindActiveByUserID(userID)
	if existing != nil {
		return nil, fmt.Errorf("an open shift already exists")
	}

	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID")
	}

	shift := &models.Shift{
		ID:        uuid.New(),
		UserID:    uid,
		ModalAwal: req.ModalAwal,
		Status:    models.ShiftOpen,
		StartTime: time.Now(),
	}

	if err := s.repo.Create(shift); err != nil {
		return nil, fmt.Errorf("creating shift: %w", err)
	}

	return shift, nil
}

func (s *Service) EndShift(userID string, req EndShiftRequest) (*ZReport, error) {
	shift, err := s.repo.FindActiveByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("no active shift found")
	}

	// Check for pending orders
	hasPending, err := s.repo.HasPendingOrders(shift.ID)
	if err != nil {
		return nil, fmt.Errorf("checking pending orders: %w", err)
	}
	if hasPending {
		return nil, fmt.Errorf("cannot end shift: there are pending offline orders waiting to sync")
	}

	// Calculate totals
	totalTunai, err := s.repo.GetTotalTunaiForShift(shift.ID)
	if err != nil {
		return nil, fmt.Errorf("calculating cash total: %w", err)
	}

	totalVoid, err := s.repo.GetTotalVoidForShift(shift.ID)
	if err != nil {
		return nil, fmt.Errorf("calculating void total: %w", err)
	}

	now := time.Now()
	saldoAkhir := shift.ModalAwal + totalTunai - totalVoid

	shift.EndTime = &now
	shift.TotalTunai = totalTunai
	shift.TotalVoid = totalVoid
	shift.SaldoAkhir = &saldoAkhir
	shift.Status = models.ShiftClosed

	if req.SaldoAktual != nil {
		shift.SaldoAktual = req.SaldoAktual
	}

	if err := s.repo.Update(shift); err != nil {
		return nil, fmt.Errorf("closing shift: %w", err)
	}

	report := &ZReport{
		ShiftID:    shift.ID.String(),
		StartTime:  shift.StartTime.Format(time.RFC3339),
		EndTime:    now.Format(time.RFC3339),
		ModalAwal:  shift.ModalAwal,
		TotalTunai: totalTunai,
		TotalVoid:  totalVoid,
		SaldoAkhir: saldoAkhir,
	}

	if shift.User != nil {
		report.UserName = shift.User.FullName
	}

	if req.SaldoAktual != nil {
		report.SaldoAktual = req.SaldoAktual
		selisih := *req.SaldoAktual - saldoAkhir
		report.Selisih = &selisih
	}

	return report, nil
}

func (s *Service) GetHistory(userID string, limit int) ([]models.Shift, error) {
	return s.repo.FindHistory(userID, limit)
}
