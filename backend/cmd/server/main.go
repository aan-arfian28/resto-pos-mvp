package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/bistroflow/backend/internal/activitylog"
	"github.com/bistroflow/backend/internal/auth"
	"github.com/bistroflow/backend/internal/config"
	"github.com/bistroflow/backend/internal/employee"
	"github.com/bistroflow/backend/internal/inventory"
	"github.com/bistroflow/backend/internal/menu"
	"github.com/bistroflow/backend/internal/middleware"
	"github.com/bistroflow/backend/internal/opex"
	"github.com/bistroflow/backend/internal/pos"
	"github.com/bistroflow/backend/internal/report"
	"github.com/bistroflow/backend/internal/settings"
	"github.com/bistroflow/backend/internal/shift"
	ws "github.com/bistroflow/backend/internal/websocket"
	"github.com/bistroflow/backend/pkg/database"
	"github.com/bistroflow/backend/pkg/ratelimit"
	"github.com/bistroflow/backend/pkg/response"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	gin.SetMode(cfg.GinMode)

	db, err := database.Connect(cfg.DSN(), cfg.GinMode)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err := registerEnumTypes(db); err != nil {
		log.Printf("Warning: could not register enum types: %v", err)
	}

	if err := database.RunMigrations(fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)); err != nil {
		log.Printf("Warning: migration issue: %v", err)
	}

	// Initialize shared services
	rateLimiter := ratelimit.NewRateLimiter()
	jwtService := auth.NewJWTService(cfg.JWTPrivateKey, cfg.JWTPublicKey)
	wsHub := ws.NewHub()

	// Initialize repositories
	authRepo := auth.NewRepository(db)
	employeeRepo := employee.NewRepository(db)
	menuRepo := menu.NewRepository(db)
	shiftRepo := shift.NewRepository(db)
	posRepo := pos.NewRepository(db)
	settingsRepo := settings.NewRepository(db)
	inventoryRepo := inventory.NewRepository(db)
	opexRepo := opex.NewRepository(db)
	reportRepo := report.NewRepository(db)
	activityLogRepo := activitylog.NewRepository(db)

	// Initialize services
	authService := auth.NewService(authRepo, jwtService, rateLimiter)
	employeeService := employee.NewService(employeeRepo)
	menuService := menu.NewService(menuRepo)
	shiftService := shift.NewService(shiftRepo)
	posService := pos.NewService(posRepo, settingsRepo)
	settingsService := settings.NewService(settingsRepo)
	inventoryService := inventory.NewService(inventoryRepo)
	opexService := opex.NewService(opexRepo)
	reportService := report.NewService(reportRepo)
	activityLogService := activitylog.NewService(activityLogRepo)

	// Initialize handlers
	authHandler := auth.NewHandler(authService)
	employeeHandler := employee.NewHandler(employeeService)
	menuHandler := menu.NewHandler(menuService)
	shiftHandler := shift.NewHandler(shiftService)
	posHandler := pos.NewHandler(posService)
	settingsHandler := settings.NewHandler(settingsService)
	inventoryHandler := inventory.NewHandler(inventoryService)
	opexHandler := opex.NewHandler(opexService)
	reportHandler := report.NewHandler(reportService)
	activityLogHandler := activitylog.NewHandler(activityLogService)

	// Setup router
	router := gin.New()
	router.Use(middleware.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.CORS(cfg.FrontendURL))

	// Health check
	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy"})
	})

	// WebSocket endpoint (authenticated via query param)
	router.GET("/api/v1/ws", func(c *gin.Context) {
		ws.ServeWS(wsHub, jwtService)(c.Writer, c.Request)
	})

	// API routes
	api := router.Group("/api/v1")
	{
		// Public routes
		api.POST("/auth/login", ratelimit.LoginRateLimitMiddleware(rateLimiter), authHandler.Login)

		// Public settings (cached)
		api.GET("/settings/active", settingsHandler.GetActive)

		// Protected routes (any authenticated role)
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware(jwtService))
		{
			protected.GET("/auth/me", authHandler.Me)

			// Owner-only routes
			owner := protected.Group("")
			owner.Use(middleware.OwnerOnly())
			{
				// Dashboard
				owner.GET("/dashboard", func(c *gin.Context) {
					response.Success(c, http.StatusOK, gin.H{"message": "Owner dashboard"})
				})

				// Employees
				owner.GET("/employees", employeeHandler.List)
				owner.GET("/employees/:id", employeeHandler.GetByID)
				owner.POST("/employees", employeeHandler.Create)
				owner.PUT("/employees/:id", employeeHandler.Update)
				owner.DELETE("/employees/:id", employeeHandler.Delete)

				// Categories
				owner.GET("/categories", menuHandler.ListCategories)
				owner.GET("/categories/:id", menuHandler.GetCategory)
				owner.POST("/categories", menuHandler.CreateCategory)
				owner.PUT("/categories/:id", menuHandler.UpdateCategory)
				owner.DELETE("/categories/:id", menuHandler.DeleteCategory)

				// Menu items (owner management)
				owner.GET("/menu", menuHandler.ListMenuItems)
				owner.GET("/menu/:id", menuHandler.GetMenuItem)
				owner.POST("/menu", menuHandler.CreateMenuItem)
				owner.PUT("/menu/:id", menuHandler.UpdateMenuItem)
				owner.DELETE("/menu/:id", menuHandler.DeleteMenuItem)

				// Inventory
				owner.GET("/inventory/raw-materials", inventoryHandler.ListRawMaterials)
				owner.POST("/inventory/raw-materials", inventoryHandler.CreateRawMaterial)
				owner.PUT("/inventory/raw-materials/:id", inventoryHandler.UpdateRawMaterial)
				owner.DELETE("/inventory/raw-materials/:id", inventoryHandler.DeleteRawMaterial)
				owner.POST("/inventory/stock-in", inventoryHandler.StockIn)
				owner.POST("/inventory/stock-out", inventoryHandler.StockOut)
				owner.GET("/inventory/low-stock", inventoryHandler.GetLowStock)
				owner.GET("/inventory/history", inventoryHandler.GetHistory)

				// Opex
				owner.GET("/opex", opexHandler.List)
				owner.POST("/opex", opexHandler.Create)
				owner.PUT("/opex/:id", opexHandler.Update)
				owner.DELETE("/opex/:id", opexHandler.Delete)

				// Reports
				owner.GET("/reports/summary", reportHandler.GetSummary)
				owner.GET("/reports/top-items", reportHandler.GetTopItems)
				owner.GET("/reports/sales-chart", reportHandler.GetSalesChart)
				owner.GET("/reports/export/csv", reportHandler.ExportCSV)
				owner.GET("/reports/export/pdf", reportHandler.ExportPDF)

				// Settings
				owner.GET("/settings", settingsHandler.List)
				owner.PUT("/settings", settingsHandler.Update)

				// Activity Log
				owner.GET("/activity-log", activityLogHandler.List)

				// Shift History
				owner.GET("/shifts/history", shiftHandler.GetHistory)
			}

			// Cashier-only routes
			cashier := protected.Group("")
			cashier.Use(middleware.CashierOnly())
			{
				// Menu (read for cashier)
				cashier.GET("/menu", menuHandler.ListAvailableMenu)

				// Shift
				cashier.GET("/shift/active", shiftHandler.GetActiveShift)
				cashier.POST("/shift/open", shiftHandler.OpenShift)
				cashier.POST("/shift/end", shiftHandler.EndShift)

				// Orders
				cashier.POST("/orders", posHandler.CreateOrder)
				cashier.POST("/orders/batch", posHandler.BatchSync)
			}
		}
	}

	addr := fmt.Sprintf(":%s", cfg.ServerPort)
	log.Printf("Server starting on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func registerEnumTypes(db *gorm.DB) error {
	enums := []string{
		`DO $$ BEGIN CREATE TYPE user_role AS ENUM ('owner','cashier'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
		`DO $$ BEGIN CREATE TYPE shift_status AS ENUM ('open','closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
		`DO $$ BEGIN CREATE TYPE order_type AS ENUM ('dine_in','takeaway','delivery'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
		`DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('cash','debit','credit','qris','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
		`DO $$ BEGIN CREATE TYPE order_status AS ENUM ('draft','completed','voided'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
		`DO $$ BEGIN CREATE TYPE stock_transaction_type AS ENUM ('in','out','adjustment'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
		`DO $$ BEGIN CREATE TYPE printer_type AS ENUM ('kitchen','receipt'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,
	}

	for _, enum := range enums {
		if err := db.Exec(enum).Error; err != nil {
			return err
		}
	}
	return nil
}
