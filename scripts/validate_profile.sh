#!/usr/bin/env bash
#
# Profile Validation Script
#
# Validates data/profile.json before deployment to catch errors early.
# Run this before deploying to ensure all required fields are present and valid.
#
# Usage:
#   ./scripts/validate_profile.sh
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

# Counters
ERRORS=0
WARNINGS=0
CHECKS=0

# Print functions
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_check() {
    echo -e "${BLUE}→${NC} $1"
    ((CHECKS++))
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════╗
║      Profile Validation Script                ║
║      Validate before deployment               ║
╚═══════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# ============================================================================
# DEPENDENCY CHECKS
# ============================================================================

echo -e "\n${BLUE}Checking dependencies...${NC}"

if ! command -v jq >/dev/null 2>&1; then
    print_error "jq is not installed (required for JSON parsing)"
    print_info "Install with: brew install jq (macOS) or apt-get install jq (Linux)"
    exit 1
fi
print_success "jq is installed"

# ============================================================================
# FILE CHECKS
# ============================================================================

echo -e "\n${BLUE}Checking files...${NC}"

# Check if profile.json exists
if [[ ! -f "$PROFILE_JSON" ]]; then
    print_error "Profile file not found: $PROFILE_JSON"
    exit 1
fi
print_success "Profile file exists: $PROFILE_JSON"

# Check if it's valid JSON
if ! jq empty "$PROFILE_JSON" 2>/dev/null; then
    print_error "Invalid JSON format in $PROFILE_JSON"
    print_info "Use a JSON validator to fix syntax errors: https://jsonlint.com/"
    exit 1
fi
print_success "Valid JSON format"

# ============================================================================
# REQUIRED FIELDS VALIDATION
# ============================================================================

echo -e "\n${BLUE}Validating required fields...${NC}"

# Helper function to check if field exists and is not empty
check_field() {
    local field_path=$1
    local field_name=$2
    local is_required=${3:-true}

    local value=$(jq -r "$field_path // empty" "$PROFILE_JSON")

    if [[ -z "$value" || "$value" == "null" ]]; then
        if [[ "$is_required" == true ]]; then
            print_error "Missing required field: $field_name ($field_path)"
            return 1
        else
            print_warning "Optional field not set: $field_name ($field_path)"
            return 0
        fi
    fi

    print_check "$field_name: $value"
    return 0
}

# Profile section
echo -e "\n  ${BLUE}Profile Section:${NC}"
check_field '.profile.name' 'Name'
check_field '.profile.title' 'Title'
check_field '.profile.organization' 'Organization'
check_field '.profile.profileImage' 'Profile Image'
check_field '.profile.cvPath' 'CV Path' false

# Contact section
echo -e "\n  ${BLUE}Contact Section:${NC}"
check_field '.contact.email' 'Email'

# Validate email format
EMAIL=$(jq -r '.contact.email // empty' "$PROFILE_JSON")
if [[ -n "$EMAIL" ]]; then
    if [[ ! "$EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        print_error "Invalid email format: $EMAIL"
    else
        print_success "Valid email format"
    fi
fi

check_field '.contact.phone' 'Phone' false
check_field '.contact.location' 'Location'
check_field '.contact.githubUsername' 'GitHub Username'

# Validate GitHub username format
GITHUB_USERNAME=$(jq -r '.contact.githubUsername // empty' "$PROFILE_JSON")
if [[ -n "$GITHUB_USERNAME" ]]; then
    # GitHub usernames can only contain alphanumeric characters and hyphens
    # Cannot start or end with hyphen, cannot have consecutive hyphens
    if [[ ! "$GITHUB_USERNAME" =~ ^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$ ]]; then
        print_error "Invalid GitHub username format: $GITHUB_USERNAME"
        print_info "GitHub usernames can only contain alphanumeric characters and hyphens"
    else
        print_success "Valid GitHub username format"
    fi

    # Check length (max 39 characters for GitHub)
    if [[ ${#GITHUB_USERNAME} -gt 39 ]]; then
        print_error "GitHub username too long (max 39 characters): $GITHUB_USERNAME"
    fi
fi

# Bio section
echo -e "\n  ${BLUE}Bio Section:${NC}"
check_field '.bio.introduction' 'Introduction'
check_field '.bio.background' 'Background'
check_field '.bio.researchFocus' 'Research Focus' false

# Site configuration
echo -e "\n  ${BLUE}Site Configuration:${NC}"
check_field '.siteConfig.siteTitle' 'Site Title'
check_field '.siteConfig.domain' 'Custom Domain' false

# Validate domain format if present
CUSTOM_DOMAIN=$(jq -r '.siteConfig.domain // empty' "$PROFILE_JSON")
if [[ -n "$CUSTOM_DOMAIN" && "$CUSTOM_DOMAIN" != "null" ]]; then
    # Basic domain validation
    if [[ ! "$CUSTOM_DOMAIN" =~ ^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$ ]]; then
        print_error "Invalid domain format: $CUSTOM_DOMAIN"
    else
        print_success "Valid domain format"
    fi
fi

# ============================================================================
# ARRAY VALIDATIONS
# ============================================================================

echo -e "\n${BLUE}Validating arrays...${NC}"

# Check publications array
PUB_COUNT=$(jq '.publications | length' "$PROFILE_JSON")
if [[ "$PUB_COUNT" -gt 0 ]]; then
    print_success "Publications: $PUB_COUNT entries"
else
    print_warning "No publications/experience entries found"
fi

# Check projects array
PROJ_COUNT=$(jq '.projects | length' "$PROFILE_JSON")
if [[ "$PROJ_COUNT" -gt 0 ]]; then
    print_success "Projects: $PROJ_COUNT entries"
else
    print_warning "No projects found"
fi

# Check education array
EDU_COUNT=$(jq '.education | length' "$PROFILE_JSON")
if [[ "$EDU_COUNT" -gt 0 ]]; then
    print_success "Education: $EDU_COUNT entries"
else
    print_warning "No education entries found"
fi

# Check navigation array
NAV_COUNT=$(jq '.navigation | length' "$PROFILE_JSON")
if [[ "$NAV_COUNT" -gt 0 ]]; then
    print_success "Navigation: $NAV_COUNT entries"
else
    print_error "No navigation entries found"
fi

# ============================================================================
# SKILLS VALIDATION
# ============================================================================

echo -e "\n${BLUE}Validating skills...${NC}"

# Check if skills object exists
if jq -e '.skills' "$PROFILE_JSON" >/dev/null 2>&1; then
    SKILLS_CATEGORIES=$(jq '.skills | keys | length' "$PROFILE_JSON")
    if [[ "$SKILLS_CATEGORIES" -gt 0 ]]; then
        print_success "Skills categories: $SKILLS_CATEGORIES"

        # List categories
        jq -r '.skills | keys[]' "$PROFILE_JSON" | while read category; do
            count=$(jq ".skills.${category} | length" "$PROFILE_JSON")
            print_check "  → $category: $count skills"
        done
    else
        print_warning "No skill categories found"
    fi
else
    print_warning "Skills section not found"
fi

# ============================================================================
# FILE EXISTENCE CHECKS
# ============================================================================

echo -e "\n${BLUE}Checking referenced files...${NC}"

# Check profile image
PROFILE_IMAGE=$(jq -r '.profile.profileImage // empty' "$PROFILE_JSON")
if [[ -n "$PROFILE_IMAGE" ]]; then
    if [[ -f "$PROFILE_IMAGE" ]]; then
        print_success "Profile image exists: $PROFILE_IMAGE"
    else
        print_error "Profile image not found: $PROFILE_IMAGE"
    fi
fi

# Check CV file
CV_PATH=$(jq -r '.profile.cvPath // empty' "$PROFILE_JSON")
if [[ -n "$CV_PATH" && "$CV_PATH" != "null" ]]; then
    if [[ -f "$CV_PATH" ]]; then
        print_success "CV file exists: $CV_PATH"
    else
        print_error "CV file not found: $CV_PATH"
    fi
fi

# Check publication/experience images
echo -e "\n  ${BLUE}Checking publication/experience images...${NC}"
jq -r '.publications[]?.image // empty' "$PROFILE_JSON" | while read img; do
    if [[ -f "$img" ]]; then
        print_check "✓ $img"
    else
        print_warning "Image not found: $img"
    fi
done

# Check project images
echo -e "\n  ${BLUE}Checking project media...${NC}"
jq -r '.projects[]?.media.src // empty' "$PROFILE_JSON" | while read media; do
    if [[ -f "$media" ]]; then
        print_check "✓ $media"
    else
        print_warning "Media not found: $media"
    fi
done

# Check education logos
echo -e "\n  ${BLUE}Checking education logos...${NC}"
jq -r '.education[]?.logo // empty' "$PROFILE_JSON" | while read logo; do
    if [[ -f "$logo" ]]; then
        print_check "✓ $logo"
    else
        print_warning "Logo not found: $logo"
    fi
done

# ============================================================================
# GITHUB ACTIONS WORKFLOW CHECK
# ============================================================================

echo -e "\n${BLUE}Checking GitHub Actions workflow...${NC}"

WORKFLOW_FILE=".github/workflows/deploy-pages.yml"
if [[ -f "$WORKFLOW_FILE" ]]; then
    print_success "GitHub Actions workflow exists: $WORKFLOW_FILE"
else
    print_error "GitHub Actions workflow not found: $WORKFLOW_FILE"
    print_info "This file is required for automatic deployment"
fi

# ============================================================================
# SUMMARY
# ============================================================================

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}Validation Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""
echo "  Checks performed: $CHECKS"
echo -e "  ${RED}Errors:${NC}          $ERRORS"
echo -e "  ${YELLOW}Warnings:${NC}        $WARNINGS"
echo ""

if [[ $ERRORS -eq 0 ]]; then
    echo -e "${GREEN}"
    cat << "EOF"
╔═══════════════════════════════════════════════╗
║        ✓ VALIDATION SUCCESSFUL! ✓            ║
╚═══════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    print_success "Your profile is ready for deployment!"
    echo ""
    print_info "Next step: Run ./scripts/deploy_automated.sh"
    echo ""

    if [[ $WARNINGS -gt 0 ]]; then
        print_warning "There are $WARNINGS warnings - review them above"
        print_info "Warnings won't prevent deployment but should be addressed"
    fi

    exit 0
else
    echo -e "${RED}"
    cat << "EOF"
╔═══════════════════════════════════════════════╗
║         ✗ VALIDATION FAILED ✗                ║
╚═══════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    print_error "Found $ERRORS error(s) that must be fixed before deployment"
    echo ""
    print_info "Fix the errors above and run this script again"
    echo ""
    exit 1
fi
