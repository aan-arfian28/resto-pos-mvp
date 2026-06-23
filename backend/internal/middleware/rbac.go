package middleware

import (
	"github.com/bistroflow/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role := GetRole(c)
		for _, r := range roles {
			if role == r {
				c.Next()
				return
			}
		}
		response.Error(c, 403, "Insufficient permissions — required role: "+roles[0])
	}
}

func OwnerOnly() gin.HandlerFunc {
	return RequireRole("owner")
}

func CashierOnly() gin.HandlerFunc {
	return RequireRole("cashier")
}
