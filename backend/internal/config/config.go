package config

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"fmt"
	"os"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	ServerPort string
	GinMode    string

	JWTPrivateKey *rsa.PrivateKey
	JWTPublicKey  *rsa.PublicKey

	FrontendURL string
}

func Load() (*Config, error) {
	cfg := &Config{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "bistroflow"),
		DBPassword: getEnv("DB_PASSWORD", "bistroflow_dev"),
		DBName:     getEnv("DB_NAME", "bistroflow"),
		ServerPort: getEnv("SERVER_PORT", "8080"),
		GinMode:    getEnv("GIN_MODE", "debug"),
		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:3000"),
	}

	if err := cfg.loadJWTKeys(); err != nil {
		return nil, fmt.Errorf("loading JWT keys: %w", err)
	}

	return cfg, nil
}

func (c *Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=Asia/Jakarta",
		c.DBHost, c.DBPort, c.DBUser, c.DBPassword, c.DBName,
	)
}

func (c *Config) loadJWTKeys() error {
	privKeyB64 := os.Getenv("JWT_PRIVATE_KEY")
	pubKeyB64 := os.Getenv("JWT_PUBLIC_KEY")

	if privKeyB64 != "" && pubKeyB64 != "" {
		var err error
		c.JWTPrivateKey, err = decodePrivateKey(privKeyB64)
		if err != nil {
			return fmt.Errorf("decoding JWT private key: %w", err)
		}
		c.JWTPublicKey, err = decodePublicKey(pubKeyB64)
		if err != nil {
			return fmt.Errorf("decoding JWT public key: %w", err)
		}
		return nil
	}

	// Auto-generate RSA 2048 key pair
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return fmt.Errorf("generating RSA key: %w", err)
	}

	c.JWTPrivateKey = key
	c.JWTPublicKey = &key.PublicKey

	fmt.Println("WARNING: JWT keys auto-generated. Provide JWT_PRIVATE_KEY and JWT_PUBLIC_KEY env vars for production.")
	return nil
}

func decodePrivateKey(b64 string) (*rsa.PrivateKey, error) {
	data, err := base64.StdEncoding.DecodeString(b64)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(data)
	if block == nil {
		return nil, fmt.Errorf("failed to decode PEM block")
	}
	key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		key, err = x509.ParsePKCS1PrivateKey(block.Bytes)
		if err != nil {
			return nil, err
		}
	}
	rsaKey, ok := key.(*rsa.PrivateKey)
	if !ok {
		return nil, fmt.Errorf("not an RSA private key")
	}
	return rsaKey, nil
}

func decodePublicKey(b64 string) (*rsa.PublicKey, error) {
	data, err := base64.StdEncoding.DecodeString(b64)
	if err != nil {
		return nil, err
	}
	block, _ := pem.Decode(data)
	if block == nil {
		return nil, fmt.Errorf("failed to decode PEM block")
	}
	key, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	rsaKey, ok := key.(*rsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("not an RSA public key")
	}
	return rsaKey, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
