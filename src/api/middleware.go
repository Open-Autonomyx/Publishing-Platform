package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
)

// ============================================================================
// Middleware Chain
// ============================================================================

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		log.Printf("[%s] %s %s", r.Method, r.RequestURI, r.RemoteAddr)
		next.ServeHTTP(w, r)
		log.Printf("Response time: %v", time.Since(start))
	})
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID")
		w.Header().Set("Access-Control-Max-Age", "3600")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func requestIDMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := r.Header.Get("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}

		w.Header().Set("X-Request-ID", requestID)
		ctx := context.WithValue(r.Context(), "request_id", requestID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func recoveryMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("PANIC: %v", err)
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				response := APIResponse{
					Success: false,
					Error:   "Internal server error",
				}
				encodeJSON(w, response)
			}
		}()
		next.ServeHTTP(w, r)
	})
}

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			response := APIResponse{
				Success: false,
				Error:   "Missing authorization header",
			}
			encodeJSON(w, response)
			return
		}

		// Extract token from "Bearer {token}"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			response := APIResponse{
				Success: false,
				Error:   "Invalid authorization format",
			}
			encodeJSON(w, response)
			return
		}

		token := parts[1]

		// Parse and validate JWT (basic implementation - Week 2 will enhance)
		claims, err := validateJWT(token)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			response := APIResponse{
				Success: false,
				Error:   fmt.Sprintf("Invalid token: %v", err),
			}
			encodeJSON(w, response)
			return
		}

		// Extract claims and add to context
		ctx := context.WithValue(r.Context(), ContextKeyOrgID, claims.OrgID)
		ctx = context.WithValue(ctx, ContextKeyUserID, claims.UserID)
		ctx = context.WithValue(ctx, ContextKeyUserRole, claims.Role)

		// Set org_id in PostgreSQL session for RLS
		if err := setPostgreSQLOrgID(ctx, claims.OrgID.String()); err != nil {
			log.Printf("Failed to set PostgreSQL org_id: %v", err)
		}

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// ============================================================================
// Helpers
// ============================================================================

type JWTClaims struct {
	OrgID  uuid.UUID `json:"org_id"`
	UserID uuid.UUID `json:"user_id"`
	Role   string    `json:"role"`
	Exp    int64     `json:"exp"`
}

func validateJWT(token string) (*JWTClaims, error) {
	// PLACEHOLDER: Week 2 will implement proper JWT validation using golang-jwt/jwt
	// For now, return dummy claims for testing

	if token == "" {
		return nil, fmt.Errorf("empty token")
	}

	// Mock validation - always succeeds in MVP
	claims := &JWTClaims{
		OrgID:  uuid.New(),
		UserID: uuid.New(),
		Role:   "admin",
		Exp:    time.Now().Add(24 * time.Hour).Unix(),
	}

	return claims, nil
}

func setPostgreSQLOrgID(ctx context.Context, orgID string) error {
	// PLACEHOLDER: Week 2 will implement proper session variable setting
	// This enables row-level security in PostgreSQL
	return nil
}

// ============================================================================
// Rate Limiting (to be implemented in Week 2)
// ============================================================================

func rateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// PLACEHOLDER: Week 2 will implement proper rate limiting
		next.ServeHTTP(w, r)
	})
}

// ============================================================================
// Request/Response Interceptors
// ============================================================================

type responseWriter struct {
	http.ResponseWriter
	statusCode int
	body       []byte
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func (rw *responseWriter) Write(b []byte) (int, error) {
	rw.body = append(rw.body, b...)
	return rw.ResponseWriter.Write(b)
}
