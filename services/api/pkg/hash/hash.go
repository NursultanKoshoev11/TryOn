package hash

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword hashes password using bcrypt
func HashPassword(password string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashed), nil
}

// CheckPassword compares password with hash
func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateAPIKey generates a random API key
func GenerateAPIKey(prefix string) (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return fmt.Sprintf("%s_%s", prefix, hex.EncodeToString(bytes)), nil
}

// HashAPIKey hashes API key using SHA-256
func HashAPIKey(apiKey, secret string) string {
	h := sha256.New()
	h.Write([]byte(apiKey + secret))
	return hex.EncodeToString(h.Sum(nil))
}

// GetAPIKeyPrefix extracts prefix from full API key
func GetAPIKeyPrefix(apiKey string) string {
	if len(apiKey) < 12 {
		return apiKey
	}
	return apiKey[:12]
}
