package validator

import (
	"regexp"
	"strings"
)

var (
	usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]{3,50}$`)
)

func ValidateUsername(username string) string {
	username = strings.TrimSpace(username)
	if len(username) < 3 || len(username) > 50 {
		return "Username must be between 3 and 50 characters"
	}
	if !usernameRegex.MatchString(username) {
		return "Username can only contain letters, numbers, and underscores"
	}
	return ""
}

func ValidatePassword(password string) string {
	if len(password) < 8 {
		return "Password must be at least 8 characters"
	}
	return ""
}

func ValidateRequired(field, name string) string {
	if strings.TrimSpace(field) == "" {
		return name + " is required"
	}
	return ""
}

func SanitizeString(s string) string {
	return strings.TrimSpace(s)
}
