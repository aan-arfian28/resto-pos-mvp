package report

import (
	"bytes"
	"fmt"
	"strings"

	"github.com/jung-kurt/gofpdf"
)

func GeneratePDFReport(summary *Summary, topItems []TopItem, sales []DailySale, from, to string) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetAutoPageBreak(true, 20)
	pdf.AddPage()

	// Header
	pdf.SetFont("Helvetica", "B", 20)
	pdf.CellFormat(0, 12, "BistroFlow POS", "", 1, "C", false, 0, "")
	pdf.SetFont("Helvetica", "", 10)
	pdf.CellFormat(0, 6, "Laporan Keuangan", "", 1, "C", false, 0, "")
	pdf.CellFormat(0, 6, fmt.Sprintf("Periode: %s s/d %s", from[:10], to[:10]), "", 1, "C", false, 0, "")
	pdf.Ln(8)

	// Summary cards
	pdf.SetFont("Helvetica", "B", 12)
	pdf.CellFormat(0, 8, "Ringkasan", "", 1, "L", false, 0, "")
	pdf.Ln(2)

	pdf.SetFont("Helvetica", "", 10)
	rows := [][]string{
		{"Total Transaksi", fmt.Sprintf("%d", summary.TotalTransactions)},
		{"Pendapatan Kotor", formatRupiah(summary.GrossRevenue)},
		{"PPN Terkumpul", formatRupiah(summary.TotalTax)},
		{"Total Void", formatRupiah(summary.TotalVoid)},
		{"Total Opex", formatRupiah(summary.TotalOpex)},
		{"Gross Profit", formatRupiah(summary.GrossProfit)},
	}

	for _, row := range rows {
		pdf.SetFont("Helvetica", "B", 10)
		pdf.CellFormat(60, 7, row[0]+":", "", 0, "L", false, 0, "")
		pdf.SetFont("Helvetica", "", 10)
		pdf.CellFormat(0, 7, row[1], "", 1, "L", false, 0, "")
	}
	pdf.Ln(6)

	// Top Items table
	pdf.SetFont("Helvetica", "B", 12)
	pdf.CellFormat(0, 8, "Top 10 Item", "", 1, "L", false, 0, "")
	pdf.Ln(2)

	// Table header
	pdf.SetFont("Helvetica", "B", 9)
	pdf.SetFillColor(26, 93, 58)
	pdf.SetTextColor(255, 255, 255)
	pdf.CellFormat(10, 7, "#", "1", 0, "C", true, 0, "")
	pdf.CellFormat(80, 7, "Nama Item", "1", 0, "C", true, 0, "")
	pdf.CellFormat(30, 7, "Qty", "1", 0, "C", true, 0, "")
	pdf.CellFormat(40, 7, "Total Nilai", "1", 1, "C", true, 0, "")
	pdf.SetTextColor(0, 0, 0)

	for i, item := range topItems {
		pdf.SetFont("Helvetica", "", 9)
		itemName := item.ItemName
		if len(itemName) > 35 {
			itemName = itemName[:35] + "..."
		}
		pdf.CellFormat(10, 7, fmt.Sprintf("%d", i+1), "1", 0, "C", false, 0, "")
		pdf.CellFormat(80, 7, itemName, "1", 0, "L", false, 0, "")
		pdf.CellFormat(30, 7, fmt.Sprintf("%d", item.TotalQty), "1", 0, "C", false, 0, "")
		pdf.CellFormat(40, 7, formatRupiah(item.TotalValue), "1", 1, "R", false, 0, "")
	}

	pdf.Ln(6)

	// Daily Sales summary
	if len(sales) > 0 {
		pdf.SetFont("Helvetica", "B", 12)
		pdf.CellFormat(0, 8, "Penjualan Harian", "", 1, "L", false, 0, "")
		pdf.Ln(2)

		pdf.SetFont("Helvetica", "B", 9)
		pdf.SetFillColor(26, 93, 58)
		pdf.SetTextColor(255, 255, 255)
		pdf.CellFormat(50, 7, "Tanggal", "1", 0, "C", true, 0, "")
		pdf.CellFormat(50, 7, "Pendapatan", "1", 0, "C", true, 0, "")
		pdf.CellFormat(50, 7, "Jumlah Order", "1", 1, "C", true, 0, "")
		pdf.SetTextColor(0, 0, 0)

		for _, s := range sales {
			pdf.SetFont("Helvetica", "", 9)
			pdf.CellFormat(50, 7, s.Date, "1", 0, "C", false, 0, "")
			pdf.CellFormat(50, 7, formatRupiah(s.Revenue), "1", 0, "R", false, 0, "")
			pdf.CellFormat(50, 7, fmt.Sprintf("%d", s.Orders), "1", 1, "C", false, 0, "")
		}
	}

	// Footer
	pdf.Ln(10)
	pdf.SetFont("Helvetica", "I", 8)
	pdf.CellFormat(0, 5, fmt.Sprintf("Dihasilkan oleh BistroFlow POS pada %s", to[:10]), "", 1, "C", false, 0, "")

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, fmt.Errorf("generating PDF: %w", err)
	}
	return buf.Bytes(), nil
}

func formatRupiah(amount float64) string {
	s := fmt.Sprintf("%.0f", amount)
	n := len(s)
	if n <= 3 {
		return "Rp " + s
	}

	var parts []string
	for i := n; i > 0; i -= 3 {
		start := i - 3
		if start < 0 {
			start = 0
		}
		parts = append([]string{s[start:i]}, parts...)
	}
	return "Rp " + strings.Join(parts, ".")
}
