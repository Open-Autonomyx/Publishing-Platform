package main

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// ============================================================================
// Organization Service
// ============================================================================

type OrganizationService struct {
	db *sql.DB
}

func (s *OrganizationService) Create(ctx context.Context, req CreateOrganizationRequest) (*Organization, error) {
	org := &Organization{
		ID:          uuid.New(),
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
		Tier:        req.Tier,
		Status:      "active",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	query := `
		INSERT INTO organizations (id, name, slug, description, tier, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at
	`

	err := s.db.QueryRowContext(ctx, query,
		org.ID, org.Name, org.Slug, org.Description,
		org.Tier, org.Status, org.CreatedAt, org.UpdatedAt,
	).Scan(&org.ID, &org.CreatedAt, &org.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create organization: %w", err)
	}

	return org, nil
}

func (s *OrganizationService) GetByID(ctx context.Context, id uuid.UUID) (*Organization, error) {
	org := &Organization{}

	query := `
		SELECT id, name, slug, description, tier, status, created_at, updated_at, created_by, deleted_at
		FROM organizations WHERE id = $1 AND deleted_at IS NULL
	`

	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&org.ID, &org.Name, &org.Slug, &org.Description, &org.Tier,
		&org.Status, &org.CreatedAt, &org.UpdatedAt, &org.CreatedBy, &org.DeletedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("organization not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get organization: %w", err)
	}

	return org, nil
}

func (s *OrganizationService) List(ctx context.Context, limit, offset int) ([]*Organization, error) {
	query := `
		SELECT id, name, slug, description, tier, status, created_at, updated_at, created_by, deleted_at
		FROM organizations WHERE deleted_at IS NULL
		ORDER BY created_at DESC LIMIT $1 OFFSET $2
	`

	rows, err := s.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list organizations: %w", err)
	}
	defer rows.Close()

	var orgs []*Organization
	for rows.Next() {
		org := &Organization{}
		if err := rows.Scan(
			&org.ID, &org.Name, &org.Slug, &org.Description, &org.Tier,
			&org.Status, &org.CreatedAt, &org.UpdatedAt, &org.CreatedBy, &org.DeletedAt,
		); err != nil {
			return nil, err
		}
		orgs = append(orgs, org)
	}

	return orgs, rows.Err()
}

// ============================================================================
// User Service
// ============================================================================

type UserService struct {
	db *sql.DB
}

func (s *UserService) Create(ctx context.Context, orgID uuid.UUID, req CreateUserRequest) (*User, error) {
	user := &User{
		ID:        uuid.New(),
		OrgID:     orgID,
		Email:     req.Email,
		Name:      req.Name,
		Role:      req.Role,
		Status:    "active",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// TODO: Hash password before storing (Week 2)
	user.PasswordHash = req.Password

	query := `
		INSERT INTO users (id, org_id, email, name, password_hash, role, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`

	err := s.db.QueryRowContext(ctx, query,
		user.ID, user.OrgID, user.Email, user.Name, user.PasswordHash,
		user.Role, user.Status, user.CreatedAt, user.UpdatedAt,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

func (s *UserService) GetByID(ctx context.Context, id uuid.UUID) (*User, error) {
	user := &User{}

	query := `
		SELECT id, org_id, email, name, avatar_url, role, status, last_login_at, created_at, updated_at, deleted_at
		FROM users WHERE id = $1 AND deleted_at IS NULL
	`

	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID, &user.OrgID, &user.Email, &user.Name, &user.AvatarURL,
		&user.Role, &user.Status, &user.LastLoginAt, &user.CreatedAt, &user.UpdatedAt, &user.DeletedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

// ============================================================================
// Content Service
// ============================================================================

type ContentService struct {
	db *sql.DB
}

func (s *ContentService) Create(ctx context.Context, orgID uuid.UUID, userID uuid.UUID, req CreateContentRequest) (*Content, error) {
	content := &Content{
		ID:          uuid.New(),
		OrgID:       orgID,
		WorkflowID:  req.WorkflowID,
		Title:       req.Title,
		Description: req.Description,
		ContentType: req.ContentType,
		Status:      "draft",
		CreatedBy:   userID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	query := `
		INSERT INTO content (id, org_id, workflow_id, title, description, content_type, status, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, created_at, updated_at
	`

	err := s.db.QueryRowContext(ctx, query,
		content.ID, content.OrgID, content.WorkflowID, content.Title, content.Description,
		content.ContentType, content.Status, content.CreatedBy, content.CreatedAt, content.UpdatedAt,
	).Scan(&content.ID, &content.CreatedAt, &content.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create content: %w", err)
	}

	return content, nil
}

func (s *ContentService) GetByID(ctx context.Context, id uuid.UUID) (*Content, error) {
	content := &Content{}

	query := `
		SELECT id, org_id, workflow_id, title, description, content_type, status, created_by, created_at, updated_at, published_at, deleted_at
		FROM content WHERE id = $1 AND deleted_at IS NULL
	`

	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&content.ID, &content.OrgID, &content.WorkflowID, &content.Title, &content.Description,
		&content.ContentType, &content.Status, &content.CreatedBy, &content.CreatedAt, &content.UpdatedAt,
		&content.PublishedAt, &content.DeletedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("content not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get content: %w", err)
	}

	return content, nil
}

// ============================================================================
// Workflow Service
// ============================================================================

type WorkflowService struct {
	db *sql.DB
}

func (s *WorkflowService) Create(ctx context.Context, orgID uuid.UUID, userID uuid.UUID, req CreateWorkflowRequest) (*Workflow, error) {
	workflow := &Workflow{
		ID:           uuid.New(),
		OrgID:        orgID,
		Name:         req.Name,
		Description:  req.Description,
		WorkflowType: req.WorkflowType,
		Status:       "active",
		CreatedBy:    userID,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	query := `
		INSERT INTO workflows (id, org_id, name, description, workflow_type, status, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`

	err := s.db.QueryRowContext(ctx, query,
		workflow.ID, workflow.OrgID, workflow.Name, workflow.Description,
		workflow.WorkflowType, workflow.Status, workflow.CreatedBy,
		workflow.CreatedAt, workflow.UpdatedAt,
	).Scan(&workflow.ID, &workflow.CreatedAt, &workflow.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create workflow: %w", err)
	}

	return workflow, nil
}

// ============================================================================
// Agent Service
// ============================================================================

type AgentService struct {
	db *sql.DB
}

func (s *AgentService) Create(ctx context.Context, orgID uuid.UUID, userID uuid.UUID, req CreateAgentRequest) (*Agent, error) {
	agent := &Agent{
		ID:          uuid.New(),
		OrgID:       orgID,
		Name:        req.Name,
		AgentType:   req.AgentType,
		Description: req.Description,
		Status:      "active",
		CreatedBy:   userID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	query := `
		INSERT INTO agents (id, org_id, name, agent_type, description, status, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`

	err := s.db.QueryRowContext(ctx, query,
		agent.ID, agent.OrgID, agent.Name, agent.AgentType,
		agent.Description, agent.Status, agent.CreatedBy,
		agent.CreatedAt, agent.UpdatedAt,
	).Scan(&agent.ID, &agent.CreatedAt, &agent.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create agent: %w", err)
	}

	return agent, nil
}

func (s *AgentService) Run(ctx context.Context, agentID uuid.UUID, input interface{}) (*AgentRun, error) {
	run := &AgentRun{
		ID:        uuid.New(),
		AgentID:   agentID,
		Status:    "running",
		StartedAt: time.Now(),
	}

	query := `
		INSERT INTO agent_runs (id, agent_id, status, started_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`

	err := s.db.QueryRowContext(ctx, query,
		run.ID, run.AgentID, run.Status, run.StartedAt,
	).Scan(&run.ID)

	if err != nil {
		return nil, fmt.Errorf("failed to create agent run: %w", err)
	}

	return run, nil
}

// ============================================================================
// Approval Service
// ============================================================================

type ApprovalService struct {
	db *sql.DB
}

func (s *ApprovalService) Create(ctx context.Context, req CreateApprovalRequest, approverID uuid.UUID) (*Approval, error) {
	approval := &Approval{
		ID:         uuid.New(),
		ContentID:  req.ContentID,
		StageID:    req.StageID,
		ApproverID: approverID,
		Decision:   req.Decision,
		Comment:    req.Comment,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	query := `
		INSERT INTO approvals (id, content_id, stage_id, approver_id, decision, comment, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at
	`

	err := s.db.QueryRowContext(ctx, query,
		approval.ID, approval.ContentID, approval.StageID, approval.ApproverID,
		approval.Decision, approval.Comment, approval.CreatedAt, approval.UpdatedAt,
	).Scan(&approval.ID, &approval.CreatedAt, &approval.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create approval: %w", err)
	}

	return approval, nil
}
