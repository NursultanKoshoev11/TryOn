package repository

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/tryon-ai/api/internal/models"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *models.User) error {
	user.ID = uuid.New().String()
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	query := `
		INSERT INTO users (id, email, password_hash, full_name, role, email_verified, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.Exec(query, user.ID, user.Email, user.PasswordHash, user.FullName, user.Role, user.EmailVerified, user.CreatedAt, user.UpdatedAt)
	return err
}

func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	var user models.User
	query := `SELECT id, email, password_hash, full_name, role, email_verified, created_at, updated_at FROM users WHERE email = $1 AND deleted_at IS NULL`
	err := r.db.QueryRow(query, email).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.FullName, &user.Role, &user.EmailVerified, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetByID(id string) (*models.User, error) {
	var user models.User
	query := `SELECT id, email, password_hash, full_name, role, email_verified, created_at, updated_at FROM users WHERE id = $1 AND deleted_at IS NULL`
	err := r.db.QueryRow(query, id).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.FullName, &user.Role, &user.EmailVerified, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) Update(user *models.User) error {
	user.UpdatedAt = time.Now()
	query := `UPDATE users SET full_name = $1, email_verified = $2, updated_at = $3 WHERE id = $4`
	_, err := r.db.Exec(query, user.FullName, user.EmailVerified, user.UpdatedAt, user.ID)
	return err
}

func (r *UserRepository) EmailExists(email string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 AND deleted_at IS NULL)`
	err := r.db.QueryRow(query, email).Scan(&exists)
	return exists, err
}
