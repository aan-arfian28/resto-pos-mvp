package middleware

import (
	"strings"

	"github.com/bistroflow/backend/internal/auth"
	"github.com/bistroflow/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtService *auth.JWTService) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr := extractBearerToken(c.GetHeader("Authorization"))
		if tokenStr == "" {
			response.Error(c, 401, "Authorization header required")
			return
		}

		claims, err := jwtService.ValidateToken(tokenStr)
		if err != nil {
			response.Error(c, 401, "Invalid or expired token")
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("role", string(claims.Role))
		c.Set("username", claims.Username)
		c.Next()
	}
}

func OptionalAuthMiddleware(jwtService *auth.JWTService) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr := extractBearerToken(c.GetHeader("Authorization"))
		if tokenStr == "" {
			c.Next()
			return
		}

		claims, err := jwtService.ValidateToken(tokenStr)
		if err != nil {
			c.Next()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("role", string(claims.Role))
		c.Set("username", claims.Username)
		c.Next()
	}
}

func extractBearerToken(header string) string {
	if header == "" {
		return ""
	}
	parts := strings.SplitN(header, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return ""
	}
	return parts[1]
}

func GetUserID(c *gin.Context) string {
	id, _ := c.Get("user_id")
	if id == nil {
		return ""
	}
	return id.(string)
}

func GetRole(c *gin.Context) string {
	role, _ := c.Get("role")
	if role == nil {
		return ""
	}
	return role.(string)
}

func GetUsername(c *gin.Context) string {
	username, _ := c.Get("username")
	if username == nil {
		return ""
	}
	return username.(string)
}
