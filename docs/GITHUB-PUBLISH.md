# Publishing to GitHub

Complete guide to push the universal creative platform to GitHub.

## Prerequisites

- GitHub account
- Git installed locally
- SSH key configured (or use HTTPS)

## Steps

### 1. Create Repository on GitHub

Visit https://github.com/new and create a new repository:

- **Owner:** Your GitHub username
- **Repository name:** `creative-platform` (or your preferred name)
- **Description:** "Universal creative platform for agents to create, publish, and distribute any creative work globally"
- **Visibility:** Public (or Private)
- **Initialize:** Leave unchecked (we'll push existing code)

Copy the repository URL (e.g., `git@github.com:yourname/creative-platform.git`)

### 2. Initialize Local Repository

From the project root directory:

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: universal creative platform

- Database schema (PostgreSQL multi-tenant)
- Go API server with handlers, services, middleware
- TypeScript Agent SDK
- Docker Compose local dev environment
- OpenTofu infrastructure-as-code
- Agent-capable with support for autonomous systems"

# Add remote
git remote add origin git@github.com:yourname/creative-platform.git

# Push to main branch
git branch -M main
git push -u origin main
```

### 3. Verify Push

```bash
git log --oneline
git remote -v
git branch -a
```

## Repository Structure

After push, your repository will have:

```
creative-platform/
├── .github/
│   └── workflows/          # CI/CD pipelines
├── infra/
│   ├── terraform/          # OpenTofu infrastructure
│   └── helm/              # Kubernetes Helm charts
├── src/
│   ├── api/
│   │   ├── api-main.go
│   │   ├── api-handlers.go
│   │   ├── api-services.go
│   │   ├── api-middleware-types.go
│   │   ├── go.mod
│   │   ├── Dockerfile.api
│   │   └── API-SERVER-README.md
│   ├── agents/
│   │   ├── content-creator/
│   │   ├── approver/
│   │   └── publisher/
│   └── web/                # React dashboard
├── db/
│   ├── schema.sql          # Database schema
│   └── migrations/         # Database migrations
├── k8s/
│   ├── base/              # Kubernetes base manifests
│   └── overlays/          # Environment overlays
├── monitoring/            # Prometheus, Grafana configs
├── scripts/              # Utility scripts
├── .gitignore
├── .env.example
├── LICENSE               # Apache 2.0
├── README.md            # Main documentation
├── CONTRIBUTING.md      # Contribution guidelines
├── docker-compose.yml   # Local development
├── go.mod              # Go dependencies
└── 05-main.tf          # Terraform main
```

## GitHub Features to Enable

### 1. Branch Protection

Settings → Branches → Add rule

- Branch: `main`
- ✅ Require pull request reviews (minimum 1)
- ✅ Require status checks to pass
- ✅ Dismiss stale reviews
- ✅ Require code reviews from code owners

### 2. CI/CD (GitHub Actions)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: dev
          POSTGRES_PASSWORD: dev
          POSTGRES_DB: creative_platform
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'

      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: ~/go/pkg/mod
          key: ${{ runner.os }}-go-${{ hashFiles('**/go.sum') }}
          restore-keys: |
            ${{ runner.os }}-go-

      - name: Download dependencies
        run: go mod download

      - name: Run tests
        env:
          DATABASE_URL: postgresql://dev:dev@localhost:5432/creative_platform
        run: go test -v ./...

      - name: Build
        run: go build -o api .

      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: api-binary
          path: api

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'

      - name: golangci-lint
        uses: golangci/golangci-lint-action@v3

  docker:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile.api
          push: false
          tags: creative-platform-api:latest
```

### 3. Semantic Versioning

Create `.github/workflows/release.yml` for automated releases:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
```

### 4. Code Owners

Create `.github/CODEOWNERS`:

```
# Global owners
* @yourname

# API owners
/src/api/ @yourname

# Infra owners
/infra/ @yourname

# Database
/db/ @yourname
```

## Collaboration Setup

### Create Development Branch

```bash
git checkout -b develop
git push -u origin develop
```

### Branch Naming Convention

- `feature/description` — New features
- `bugfix/description` — Bug fixes
- `docs/description` — Documentation
- `refactor/description` — Code refactoring
- `chore/description` — Maintenance tasks

### Commit Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat(api): add approval workflow routing

- Implement conditional approval routing
- Add stage execution tracking
- Add audit logging for decisions

Closes #123
```

## Continuous Delivery

### Docker Registry

Push images to Docker Hub or GitHub Container Registry:

```bash
# GitHub Container Registry
docker build -f Dockerfile.api -t ghcr.io/yourname/creative-platform-api:latest .
docker push ghcr.io/yourname/creative-platform-api:latest
```

### Kubernetes Deployment

Deploy from GitHub:

```bash
kubectl set image deployment/api api=ghcr.io/yourname/creative-platform-api:latest
```

## Documentation

### README

Ensure `README.md` covers:

- What is this project?
- Quick start (local dev + Docker)
- Architecture overview
- API documentation
- Contribution guidelines
- License

### CONTRIBUTING.md

Guide contributors:

```markdown
# Contributing

Thank you for contributing to the Creative Platform!

## Getting Started

1. Fork the repository
2. Create a branch: `git checkout -b feature/description`
3. Make changes
4. Run tests: `go test ./...`
5. Commit: `git commit -am "description"`
6. Push: `git push origin feature/description`
7. Open Pull Request

## Code Style

- Run `go fmt`
- Follow golangci-lint rules
- Write tests for new features

## Reporting Issues

Use GitHub Issues for bug reports and feature requests.
Include:
- Description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, Go version, etc.)

## Security

Do NOT commit secrets. Use `.env.example` as template.
Report security issues to: security@example.com
```

## GitHub Pages (Optional)

Enable GitHub Pages for documentation:

Settings → Pages → Source: `main` → `/docs` folder

Create `docs/index.md` for landing page.

## Project Management

### Create Issues

Templates in `.github/ISSUE_TEMPLATE/`:

- `bug_report.md` — Bug reports
- `feature_request.md` — Feature requests
- `documentation.md` — Documentation improvements

### Create Discussions

Enable Discussions in repository settings for:
- Q&A
- Ideas
- General discussion
- Show and tell

### Milestones

Create milestones for phases:

- `v0.1.0-MVP` — Phase 1 (Weeks 1-8)
- `v0.2.0-Types` — Phase 2 (Weeks 9-16)
- `v0.3.0-Distribution` — Phase 3
- `v1.0.0-Production` — Final release

## Verification

After push, verify:

```bash
# Clone fresh copy
git clone git@github.com:yourname/creative-platform.git
cd creative-platform

# Verify structure
ls -la
git log --oneline | head -5
git remote -v

# Run locally
docker-compose up -d
# Test API: curl http://localhost:3001/health
```

## Next Steps

1. **Add collaborators** — Settings → Collaborators
2. **Setup branch protection** — Settings → Branches
3. **Configure CI/CD** — Push `.github/workflows/`
4. **Enable discussions** — Settings → Discussions
5. **Create milestone** — Projects → New milestone
6. **Add issue templates** — `.github/ISSUE_TEMPLATE/`
7. **Setup docs** — Enable GitHub Pages
8. **Announce** — Share on social media, dev communities

## Resources

- [GitHub Docs](https://docs.github.com)
- [Git Guide](https://git-scm.com/doc)
- [GitHub Actions](https://docs.github.com/actions)
- [Semantic Versioning](https://semver.org)
- [Conventional Commits](https://www.conventionalcommits.org)

---

**Your repository is now live!** Share the link and start collaborating.
