package auth

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Username and password are required",
		})
		return
	}

	clientIP := c.GetString("client_ip")
	if clientIP == "" {
		clientIP = c.ClientIP()
	}

	resp, err := h.service.Login(req, clientIP)
	if err != nil {
		switch {
		case errors.Is(err, ErrInvalidCredentials):
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": "Invalid username or password",
			})
		case errors.Is(err, ErrAccountDisabled):
			c.JSON(http.StatusForbidden, gin.H{
				"status":  "error",
				"message": "Account has been disabled",
			})
		case errors.Is(err, ErrRateLimited):
			c.JSON(http.StatusTooManyRequests, gin.H{
				"status":  "error",
				"message": "Too many login attempts. Account blocked for 15 minutes.",
			})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "An error occurred during login",
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   resp,
	})
}

func (h *Handler) Me(c *gin.Context) {
	userID, _ := c.Get("user_id")
	user, err := h.service.GetProfile(userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "User not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"id":        user.ID,
			"username":  user.Username,
			"role":      user.Role,
			"full_name": user.FullName,
		},
	})
}
