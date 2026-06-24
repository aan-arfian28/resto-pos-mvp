package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	passwords := map[string]string{
		"admin123":   "owner",
		"cashier123": "cashier",
	}

	for pw, role := range passwords {
		hash, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
		if err != nil {
			fmt.Printf("Error: %v\n", err)
			return
		}
		fmt.Printf("%s (%s): %s\n", pw, role, string(hash))
	}
}
