package ratelimit

import (
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type LoginAttempt struct {
	Count        int
	FirstTry     time.Time
	BlockedUntil *time.Time
}

type RateLimiter struct {
	mu       sync.Mutex
	attempts map[string]*LoginAttempt
}

func NewRateLimiter() *RateLimiter {
	rl := &RateLimiter{
		attempts: make(map[string]*LoginAttempt),
	}
	go rl.cleanup()
	return rl
}

func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for key, attempt := range rl.attempts {
			if attempt.BlockedUntil != nil && now.After(*attempt.BlockedUntil) {
				delete(rl.attempts, key)
			} else if now.Sub(attempt.FirstTry) > 10*time.Minute {
				delete(rl.attempts, key)
			}
		}
		rl.mu.Unlock()
	}
}

func (rl *RateLimiter) RecordAttempt(clientIP string) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	attempt, exists := rl.attempts[clientIP]
	if !exists || time.Since(attempt.FirstTry) > 10*time.Minute {
		rl.attempts[clientIP] = &LoginAttempt{
			Count:    1,
			FirstTry: time.Now(),
		}
		return
	}

	attempt.Count++
	if attempt.Count >= 5 {
		blocked := time.Now().Add(15 * time.Minute)
		attempt.BlockedUntil = &blocked
	}
}

func (rl *RateLimiter) IsBlocked(clientIP string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	attempt, exists := rl.attempts[clientIP]
	if !exists {
		return false
	}

	if attempt.BlockedUntil != nil && time.Now().Before(*attempt.BlockedUntil) {
		return true
	}

	if attempt.BlockedUntil != nil {
		delete(rl.attempts, clientIP)
	}
	return false
}

func (rl *RateLimiter) ClearAttempts(clientIP string) {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	delete(rl.attempts, clientIP)
}

func LoginRateLimitMiddleware(rl *RateLimiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		if rl.IsBlocked(clientIP) {
			c.AbortWithStatusJSON(429, gin.H{
				"status":  "error",
				"message": "Too many login attempts. Account blocked for 15 minutes.",
			})
			return
		}
		c.Set("rate_limiter", rl)
		c.Set("client_ip", clientIP)
		c.Next()
	}
}
