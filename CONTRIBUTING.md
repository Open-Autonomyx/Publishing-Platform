# Contributing to Universal Creative Platform

Thank you for considering contributing to the Universal Creative Platform! We welcome contributions from the community to help us build the best creative platform for agents and creators.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Go 1.21 or later
- Docker and Docker Compose
- PostgreSQL 15+ (for local development)
- Git

### Setup Local Development

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/creative-platform.git
   cd creative-platform
   ```

2. **Create a development branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start local services**
   ```bash
   docker-compose up -d
   ```

5. **Verify API is running**
   ```bash
   curl http://localhost:3001/health
   ```

## Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/description
   ```

2. **Make your changes**
   - Write code following Go conventions
   - Add or update tests
   - Update documentation if needed

3. **Run tests and lint**
   ```bash
   cd src/api
   go test -v ./...
   go test -v -coverprofile=coverage.out ./...
   go tool cover -html=coverage.out
   golangci-lint run ./...
   ```

4. **Format your code**
   ```bash
   go fmt ./...
   ```

### Branch Naming Convention

- `feature/description` — New features
- `bugfix/description` — Bug fixes
- `docs/description` — Documentation updates
- `refactor/description` — Code refactoring
- `chore/description` — Maintenance tasks
- `test/description` — Test improvements

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` — A new feature
- `fix` — A bug fix
- `docs` — Documentation only changes
- `style` — Changes that do not affect code meaning (formatting, etc.)
- `refactor` — A code change that neither fixes a bug nor adds a feature
- `perf` — A code change that improves performance
- `test` — Adding missing tests or correcting existing tests
- `chore` — Changes to the build process, dependencies, or tools

**Example:**
```
feat(api): add approval workflow routing

- Implement conditional approval routing
- Add stage execution tracking  
- Add audit logging for decisions

Closes #123
```

## Testing Requirements

- All new features **must** include unit tests
- Test coverage should be **≥ 80%**
- Integration tests required for API endpoints
- Run full test suite before pushing

```bash
cd src/api
go test -v -race -coverprofile=coverage.out ./...
```

## Documentation

- Update API documentation for endpoint changes
- Add comments for complex logic
- Update README if adding new features
- Update IMPLEMENTATION-SUMMARY.md with progress

## Submitting a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature
   ```

2. **Create a Pull Request** on GitHub
   - Use a clear, descriptive title
   - Reference any related issues
   - Provide a detailed description of changes
   - Ensure all CI checks pass

3. **Code Review**
   - Respond to review comments
   - Make requested changes
   - Re-request review after updates

4. **Merge**
   - Once approved, your PR will be merged to `main`
   - Squash and merge preferred for cleaner history

## Reporting Issues

### Bug Reports

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Go version, Docker version)
- Relevant logs or error messages

### Feature Requests

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md). Include:
- Problem statement
- Proposed solution
- Use cases and value
- Acceptance criteria

## Architecture & Design

Before starting major work, please:
1. Check existing issues for related discussions
2. Create an issue to discuss your approach
3. Link the discussion to your PR

Key architectural concepts:
- Multi-tenant isolation via row-level security
- Approval workflow state machine
- Agent-first API design
- ACID compliance for financial data

See [CLAUDE-CODE-HANDOFF.md](CLAUDE-CODE-HANDOFF.md) for architecture overview.

## Performance & Optimization

- Keep API latency (P95) under 200ms
- Maintain error rate below 0.1%
- Database queries should complete in < 50ms
- Use indexes for frequently queried columns

## Security

- Never commit secrets (use `.env.example`)
- Implement proper input validation
- Follow OWASP Top 10 guidelines
- Report security issues to: security@example.com (not via GitHub issues)

## Development Tips

### Running the API locally

```bash
cd src/api
go run . 
# API runs on http://localhost:3001
```

### Database operations

```bash
# Connect to database
psql $DATABASE_URL

# View logs
docker logs creative-platform-db

# Reset database
docker-compose down -v
docker-compose up -d
```

### Testing with curl

```bash
# Health check
curl http://localhost:3001/health

# Get agents
curl http://localhost:3001/agents

# Create workflow
curl -X POST http://localhost:3001/workflows \
  -H "Content-Type: application/json" \
  -d @payload.json
```

## Questions?

- Check existing [issues](../../issues)
- Review [API documentation](src/api/API-SERVER-README.md)
- See [architecture guide](CLAUDE-CODE-HANDOFF.md)

## License

By contributing to this project, you agree that your contributions will be licensed under the Apache 2.0 License.

---

**Thank you for contributing!** 🚀
