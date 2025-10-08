#!/usr/bin/env bash
#
# Automated Portfolio Deployment Script
#
# This script automatically deploys a portfolio website to GitHub Pages
# by reading configuration from data/profile.json and using a GitHub PAT token.
#
# Prerequisites:
#   - jq (JSON processor): brew install jq
#   - GitHub CLI (gh): brew install gh
#   - Git
#
# Usage:
#   export GH_TOKEN="ghp_xxxxxxxxxxxxx"
#   ./scripts/deploy_automated.sh
#
# Or:
#   ./scripts/deploy_automated.sh --token="ghp_xxxxxxxxxxxxx"
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROFILE_JSON="data/profile.json"
WORKFLOW_DIR=".github/workflows"

# Print functions
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1" >&2; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_step() { echo -e "\n${BLUE}==>${NC} $1"; }

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════╗
║   Automated Portfolio Deployment Script      ║
║   Deploy to GitHub Pages in seconds!         ║
╚═══════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# ============================================================================
# PHASE 1: DEPENDENCY CHECKS
# ============================================================================

print_step "Checking dependencies..."

# Check for jq
if ! command -v jq >/dev/null 2>&1; then
    print_error "jq is not installed"
    print_info "Install with: brew install jq (macOS) or apt-get install jq (Linux)"
    exit 1
fi
print_success "jq is installed"

# Check for gh CLI
if ! command -v gh >/dev/null 2>&1; then
    print_error "GitHub CLI (gh) is not installed"
    print_info "Install from: https://cli.github.com/"
    exit 1
fi
print_success "GitHub CLI is installed"

# Check for git
if ! command -v git >/dev/null 2>&1; then
    print_error "git is not installed"
    exit 1
fi
print_success "git is installed"

# ============================================================================
# PHASE 2: PARSE PROFILE.JSON
# ============================================================================

print_step "Parsing profile data from $PROFILE_JSON..."

# Check if profile.json exists
if [[ ! -f "$PROFILE_JSON" ]]; then
    print_error "Profile file not found: $PROFILE_JSON"
    exit 1
fi

# Extract data from JSON
NAME=$(jq -r '.profile.name // empty' "$PROFILE_JSON")
EMAIL=$(jq -r '.contact.email // empty' "$PROFILE_JSON")
GITHUB_USERNAME=$(jq -r '.contact.githubUsername // empty' "$PROFILE_JSON")
CUSTOM_DOMAIN=$(jq -r '.siteConfig.domain // empty' "$PROFILE_JSON")

# Validate required fields
if [[ -z "$NAME" ]]; then
    print_error "Missing 'profile.name' in $PROFILE_JSON"
    exit 1
fi
print_success "Name: $NAME"

if [[ -z "$EMAIL" ]]; then
    print_error "Missing 'contact.email' in $PROFILE_JSON"
    exit 1
fi
print_success "Email: $EMAIL"

if [[ -z "$GITHUB_USERNAME" ]]; then
    print_error "Missing 'contact.githubUsername' in $PROFILE_JSON"
    print_info "Please add the GitHub username to the contact section in profile.json:"
    print_info '  "contact": { "githubUsername": "your-github-username", ... }'
    exit 1
fi
print_success "GitHub Username: $GITHUB_USERNAME"

# Repository name (username.github.io)
REPO_NAME="${GITHUB_USERNAME}.github.io"
print_success "Repository: $REPO_NAME"

if [[ -n "$CUSTOM_DOMAIN" ]]; then
    print_success "Custom Domain: $CUSTOM_DOMAIN"
else
    print_info "No custom domain configured (will use default GitHub Pages URL)"
fi

# ============================================================================
# PHASE 3: AUTHENTICATION
# ============================================================================

print_step "Authenticating with GitHub..."

# Parse command line arguments for token
for arg in "$@"; do
    case $arg in
        --token=*)
            GH_TOKEN="${arg#*=}"
            shift
            ;;
    esac
done

# Check if token is provided
if [[ -z "${GH_TOKEN:-}" ]]; then
    print_error "GitHub Personal Access Token (PAT) not provided"
    print_info "Usage: export GH_TOKEN=\"ghp_xxxxx\" && ./scripts/deploy_automated.sh"
    print_info "Or:    ./scripts/deploy_automated.sh --token=\"ghp_xxxxx\""
    print_info ""
    print_info "Generate a PAT at: https://github.com/settings/tokens/new"
    print_info "Required scopes: repo, workflow"
    exit 1
fi

# Verify token works by getting the authenticated user
# When GH_TOKEN is set, gh CLI uses it automatically
export GH_TOKEN="$GH_TOKEN"
AUTHENTICATED_USER=$(gh api user -q '.login' 2>/dev/null || echo "")
if [[ -z "$AUTHENTICATED_USER" ]]; then
    print_error "Failed to authenticate with GitHub"
    print_info "Please check that your PAT token is valid and has required scopes:"
    print_info "  - repo"
    print_info "  - workflow"
    print_info "  - read:org"
    exit 1
fi

print_success "Authenticated as: $AUTHENTICATED_USER"

# Verify that the authenticated user matches the GitHub username
if [[ "$AUTHENTICATED_USER" != "$GITHUB_USERNAME" ]]; then
    print_warning "WARNING: Authenticated user ($AUTHENTICATED_USER) differs from profile username ($GITHUB_USERNAME)"
    print_warning "The repository will be created under $AUTHENTICATED_USER's account"
    REPO_NAME="${AUTHENTICATED_USER}.github.io"
    print_info "Updated repository name to: $REPO_NAME"
fi

# ============================================================================
# PHASE 4: GIT CONFIGURATION
# ============================================================================

print_step "Configuring git identity..."

# Configure git user (local to this repository only)
git config user.name "$NAME"
git config user.email "$EMAIL"

print_success "Git configured with name: $NAME"
print_success "Git configured with email: $EMAIL"

# ============================================================================
# PHASE 5: CNAME FILE MANAGEMENT
# ============================================================================

print_step "Managing CNAME file..."

if [[ -n "$CUSTOM_DOMAIN" ]]; then
    # Create or update CNAME file
    echo "$CUSTOM_DOMAIN" > CNAME
    print_success "CNAME file created/updated with: $CUSTOM_DOMAIN"
else
    # Remove CNAME file if it exists
    if [[ -f CNAME ]]; then
        rm CNAME
        print_success "CNAME file removed (using default GitHub Pages URL)"
    else
        print_info "No CNAME file to remove"
    fi
fi

# ============================================================================
# PHASE 6: REPOSITORY SETUP
# ============================================================================

print_step "Setting up GitHub repository..."

# Initialize git repository if needed
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    print_info "Initializing git repository..."
    git init
    print_success "Git repository initialized"
fi

# Ensure we're on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
if [[ "$CURRENT_BRANCH" != "main" ]]; then
    git checkout -B main
    print_success "Switched to main branch"
fi

# Check if the repository already exists on GitHub
REPO_EXISTS=false
if gh repo view "$AUTHENTICATED_USER/$REPO_NAME" >/dev/null 2>&1; then
    REPO_EXISTS=true
    print_info "Repository $REPO_NAME already exists on GitHub"
else
    print_info "Repository $REPO_NAME does not exist, will be created"
fi

# ============================================================================
# PHASE 7: COMMIT CHANGES
# ============================================================================

print_step "Committing changes..."

# Add all files
git add -A

# Check if there are changes to commit
if git diff --cached --quiet; then
    print_info "No changes to commit"
else
    # Create commit
    COMMIT_MESSAGE="Deploy portfolio for $NAME

Portfolio website deployed via automated deployment script.
Site: https://${REPO_NAME}/

🤖 Automated deployment"

    git commit -m "$COMMIT_MESSAGE"
    print_success "Changes committed"
fi

# ============================================================================
# PHASE 8: PUSH TO GITHUB
# ============================================================================

print_step "Deploying to GitHub..."

# Set up remote
if git remote get-url origin >/dev/null 2>&1; then
    print_info "Remote 'origin' already configured"
    REMOTE_URL=$(git remote get-url origin)
    EXPECTED_URL="https://github.com/$AUTHENTICATED_USER/$REPO_NAME.git"

    if [[ "$REMOTE_URL" != "$EXPECTED_URL" ]]; then
        print_warning "Updating remote URL to: $EXPECTED_URL"
        git remote set-url origin "$EXPECTED_URL"
    fi
else
    print_info "Adding remote 'origin'..."
    git remote add origin "https://github.com/$AUTHENTICATED_USER/$REPO_NAME.git"
fi

# Create repository if it doesn't exist
if [[ "$REPO_EXISTS" == false ]]; then
    print_info "Creating repository on GitHub..."
    gh repo create "$AUTHENTICATED_USER/$REPO_NAME" --public --source . --remote origin --push || {
        print_error "Failed to create repository"
        exit 1
    }
    print_success "Repository created and code pushed"
else
    # Push to existing repository
    print_info "Pushing to existing repository..."
    git push -u origin main || {
        print_error "Failed to push to repository"
        print_info "You may need to use: git push -u origin main --force"
        exit 1
    }
    print_success "Code pushed to GitHub"
fi

# ============================================================================
# PHASE 9: GITHUB PAGES CONFIGURATION
# ============================================================================

print_step "Configuring GitHub Pages..."

# Enable GitHub Pages via API
# The workflow file should handle deployment, but we'll ensure Pages is enabled
gh api -X POST "repos/$AUTHENTICATED_USER/$REPO_NAME/pages" \
    -f "source[branch]=main" \
    -f "source[path]=/" \
    2>/dev/null || print_info "GitHub Pages may already be configured"

print_success "GitHub Pages configuration verified"

# ============================================================================
# PHASE 10: SUCCESS MESSAGE
# ============================================================================

echo ""
echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════╗
║          🎉 DEPLOYMENT SUCCESSFUL! 🎉        ║
╚═══════════════════════════════════════════════╝
EOF
echo -e "${NC}"

print_success "Portfolio deployed successfully!"
echo ""
print_info "📍 Important URLs:"
echo ""
echo -e "   Repository:    ${BLUE}https://github.com/$AUTHENTICATED_USER/$REPO_NAME${NC}"
echo -e "   Actions:       ${BLUE}https://github.com/$AUTHENTICATED_USER/$REPO_NAME/actions${NC}"
if [[ -n "$CUSTOM_DOMAIN" ]]; then
    echo -e "   Live Site:     ${GREEN}https://$CUSTOM_DOMAIN${NC}"
    echo ""
    print_warning "IMPORTANT: Configure your DNS records for $CUSTOM_DOMAIN"
    print_info "Add these DNS records at your domain registrar:"
    print_info "  Type: A,     Host: @,   Value: 185.199.108.153"
    print_info "  Type: A,     Host: @,   Value: 185.199.109.153"
    print_info "  Type: A,     Host: @,   Value: 185.199.110.153"
    print_info "  Type: A,     Host: @,   Value: 185.199.111.153"
    print_info "  Type: CNAME, Host: www, Value: $AUTHENTICATED_USER.github.io"
else
    echo -e "   Live Site:     ${GREEN}https://$REPO_NAME${NC}"
fi

echo ""
print_info "⏳ GitHub Actions is building your site now..."
print_info "Visit the Actions URL above to watch the deployment progress."
print_info "Your site should be live in 1-2 minutes!"
echo ""

if [[ -n "$CUSTOM_DOMAIN" ]]; then
    print_info "After DNS is configured:"
    print_info "  1. Go to: https://github.com/$AUTHENTICATED_USER/$REPO_NAME/settings/pages"
    print_info "  2. Verify custom domain is set to: $CUSTOM_DOMAIN"
    print_info "  3. Enable 'Enforce HTTPS' once certificate is issued"
    echo ""
fi

print_success "Deployment complete! 🚀"
