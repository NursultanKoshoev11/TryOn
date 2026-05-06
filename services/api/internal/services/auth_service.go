package services

import (
	"errors"

	"github.com/tryon-ai/api/internal/models"
	"github.com/tryon-ai/api/internal/repository"
	"github.com/tryon-ai/api/pkg/hash"
	"github.com/tryon-ai/api/pkg/jwt"
)

type AuthService struct {
	userRepo         *repository.UserRepository
	accessSecret     string
	refreshSecret    string
	accessExpHours   int
	refreshExpDays   int
}

func NewAuthService(userRepo *repository.UserRepository, accessSecret, refreshSecret string, accessExpHours, refreshExpDays int) *AuthService {
	return &AuthService{
		userRepo:       userRepo,
		accessSecret:   accessSecret,
		refreshSecret:  refreshSecret,
		accessExpHours: accessExpHours,
		refreshExpDays: refreshExpDays,
	}
}

func (s *AuthService) Register(req *models.RegisterRequest) (*models.User, error) {
	// Check if email exists
	exists, err := s.userRepo.EmailExists(req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("email already exists")
	}

	// Hash password
	passwordHash, err := hash.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &models.User{
		Email:         req.Email,
		PasswordHash:  passwordHash,
		FullName:      req.FullName,
		Role:          models.RoleMerchantOwner,
		EmailVerified: false,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) Login(req *models.LoginRequest) (*models.LoginResponse, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Check password
	if !hash.CheckPassword(req.Password, user.PasswordHash) {
		return nil, errors.New("invalid credentials")
	}

	// Generate tokens
	tokens, err := jwt.GenerateTokenPair(user.ID, user.Email, string(user.Role), s.accessSecret, s.refreshSecret, s.accessExpHours, s.refreshExpDays)
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		ExpiresIn:    tokens.ExpiresIn,
		User:         user,
	}, nil
}

func (s *AuthService) RefreshToken(req *models.RefreshTokenRequest) (*models.LoginResponse, error) {
	// Validate refresh token
	claims, err := jwt.ValidateToken(req.RefreshToken, s.refreshSecret)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	// Get user
	user, err := s.userRepo.GetByID(claims.UserID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	// Generate new tokens
	tokens, err := jwt.GenerateTokenPair(user.ID, user.Email, string(user.Role), s.accessSecret, s.refreshSecret, s.accessExpHours, s.refreshExpDays)
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		ExpiresIn:    tokens.ExpiresIn,
		User:         user,
	}, nil
}

func (s *AuthService) ValidateAccessToken(token string) (*jwt.Claims, error) {
	return jwt.ValidateToken(token, s.accessSecret)
}
