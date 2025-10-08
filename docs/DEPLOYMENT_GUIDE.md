# Portfolio Deployment Guide

This guide will help you deploy your portfolio website to GitHub Pages using the automated deployment script.

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ A GitHub account
- ✅ Your portfolio content ready in `data/profile.json`
- ✅ A GitHub Personal Access Token (PAT)

---

## 🚀 Quick Start (3 Steps)

### Step 1: Create a GitHub Account

1. Go to [github.com](https://github.com)
2. Click **Sign up**
3. Choose a username (e.g., `sumitmadhav`, `janedoe`)
   - ⚠️ This username will be part of your portfolio URL: `https://username.github.io`
   - Choose something professional and memorable
4. Complete the signup process

### Step 2: Generate a Personal Access Token (PAT)

A PAT is like a password that allows the deployment script to create and update your repository.

#### 2.1 Generate Token

1. **Log in to GitHub** and go to: [github.com/settings/tokens/new](https://github.com/settings/tokens/new)
2. **Configure token settings:**
   - **Note**: `Portfolio Deployment` (or any name you prefer)
   - **Expiration**: Choose duration (e.g., 90 days, 1 year, or no expiration)
   - **Select scopes** (permissions):
     - ✅ `repo` - Full control of private repositories
     - ✅ `workflow` - Update GitHub Action workflows

   ![PAT Scopes](https://docs.github.com/assets/cb-10108/mw-1440/images/help/settings/token_scopes.webp)

3. **Click** "Generate token" at the bottom
4. **Copy the token** immediately (you won't be able to see it again!)
   - Token format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - ⚠️ **Keep this token secure** - treat it like a password

#### 2.2 Save Token Securely

Store your token in a password manager or secure note. You'll need it for deployment.

### Step 3: Update Your Profile

Edit `data/profile.json` and add your GitHub username to the contact section:

```json
"contact": {
  "email": "your.email@example.com",
  "phone": "+1 (xxx) xxx-xxxx",
  "location": "Your City, State",
  "githubUsername": "your-github-username",  // ← ADD THIS
  "linkedin": "https://www.linkedin.com/in/your-profile/",
  ...
}
```

**Important:** The `githubUsername` must match your GitHub account username exactly.

---

## 🎯 Deployment

### Option 1: Using Environment Variable (Recommended)

```bash
# Set the token as an environment variable
export GH_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Run the deployment script
./scripts/deploy_automated.sh
```

### Option 2: Using Command Line Argument

```bash
./scripts/deploy_automated.sh --token="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### What Happens During Deployment?

The script will automatically:
1. ✅ Validate dependencies (jq, gh, git)
2. ✅ Extract your information from `profile.json`
3. ✅ Authenticate with GitHub using your PAT
4. ✅ Configure git with your name and email
5. ✅ Create repository `username.github.io` on your GitHub
6. ✅ Push all portfolio files
7. ✅ Trigger GitHub Actions to build and deploy your site

**Expected output:**

```
╔═══════════════════════════════════════════════╗
║   Automated Portfolio Deployment Script      ║
║   Deploy to GitHub Pages in seconds!         ║
╚═══════════════════════════════════════════════╝

==> Checking dependencies...
✓ jq is installed
✓ GitHub CLI is installed
✓ git is installed

==> Parsing profile data from data/profile.json...
✓ Name: Your Name
✓ Email: your.email@example.com
✓ GitHub Username: yourusername
✓ Repository: yourusername.github.io

==> Authenticating with GitHub...
✓ Authenticated as: yourusername

==> Deploying to GitHub...
✓ Code pushed to GitHub

╔═══════════════════════════════════════════════╗
║          🎉 DEPLOYMENT SUCCESSFUL! 🎉        ║
╚═══════════════════════════════════════════════╝

📍 Important URLs:

   Repository:    https://github.com/yourusername/yourusername.github.io
   Actions:       https://github.com/yourusername/yourusername.github.io/actions
   Live Site:     https://yourusername.github.io

⏳ GitHub Actions is building your site now...
Your site should be live in 1-2 minutes!
```

---

## 🌐 Viewing Your Live Site

### Standard GitHub Pages URL

After deployment, your portfolio will be available at:
```
https://your-github-username.github.io
```

Example: If your username is `sumitmadhav`, your site will be:
```
https://sumitmadhav.github.io
```

### Check Deployment Status

1. Go to the **Actions** URL shown in the deployment output
2. Watch the "Deploy to GitHub Pages" workflow
3. Wait for the green checkmark ✓
4. Your site is live!

---

## 🔧 Custom Domain (Optional)

Want to use your own domain like `yourname.com` instead of `username.github.io`?

### Step 1: Update profile.json

```json
"siteConfig": {
  "domain": "yourname.com",  // ← Your custom domain
  ...
}
```

### Step 2: Configure DNS Records

At your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.), add these DNS records:

| Type  | Host | Value                |
|-------|------|----------------------|
| A     | @    | 185.199.108.153     |
| A     | @    | 185.199.109.153     |
| A     | @    | 185.199.110.153     |
| A     | @    | 185.199.111.153     |
| CNAME | www  | username.github.io  |

Replace `username` with your actual GitHub username.

### Step 3: Enable HTTPS

1. Go to: `https://github.com/username/username.github.io/settings/pages`
2. Verify your custom domain is shown
3. Wait for DNS check to pass (may take a few minutes to 24 hours)
4. Enable **"Enforce HTTPS"**

---

## 🛠️ Troubleshooting

### Error: "jq is not installed"

**Solution:**
```bash
# macOS
brew install jq

# Linux (Ubuntu/Debian)
sudo apt-get install jq

# Linux (CentOS/RHEL)
sudo yum install jq
```

### Error: "GitHub CLI (gh) is not installed"

**Solution:**
```bash
# macOS
brew install gh

# Linux/Windows
# See: https://cli.github.com/manual/installation
```

### Error: "Missing 'contact.githubUsername' in profile.json"

**Solution:** Add your GitHub username to `data/profile.json`:
```json
"contact": {
  "githubUsername": "your-github-username",
  ...
}
```

### Error: "Failed to authenticate with GitHub"

**Possible causes:**
1. ❌ Invalid PAT token
2. ❌ Token expired
3. ❌ Token doesn't have required scopes

**Solution:**
- Generate a new token with `repo` and `workflow` scopes
- Make sure you copied the entire token (starts with `ghp_`)

### Error: "Repository already exists"

**Solution:** This is usually fine. The script will push to the existing repository. If you want to start fresh:
```bash
# Delete the repository on GitHub first
gh repo delete username/username.github.io

# Then run deployment again
./scripts/deploy_automated.sh
```

### Site not loading after deployment

**Checklist:**
1. ✅ Check GitHub Actions completed successfully
2. ✅ Go to Settings → Pages and verify source is set to `main` branch
3. ✅ Wait 1-2 minutes for DNS propagation
4. ✅ Try accessing in incognito/private browsing mode

---

## 🔄 Updating Your Portfolio

To update your portfolio after initial deployment:

1. **Make changes** to your `data/profile.json` or other files
2. **Run deployment script** again:
   ```bash
   export GH_TOKEN="your-token"
   ./scripts/deploy_automated.sh
   ```
3. **Wait for GitHub Actions** to rebuild (1-2 minutes)
4. **Refresh your site** to see changes

---

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Custom Domain Setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Markdown Guide](https://www.markdownguide.org/) - For editing this README

---

## 🆘 Getting Help

If you encounter issues:

1. **Check the error message** - it usually tells you what's wrong
2. **Review the troubleshooting section** above
3. **Verify your profile.json** is valid JSON (use a JSON validator)
4. **Run the validation script**: `./scripts/validate_profile.sh` (if available)
5. **Contact your portfolio administrator** for assistance

---

## ✅ Deployment Checklist

Use this checklist to ensure smooth deployment:

- [ ] GitHub account created
- [ ] GitHub username chosen (professional and memorable)
- [ ] Personal Access Token (PAT) generated with `repo` and `workflow` scopes
- [ ] PAT token saved securely
- [ ] `data/profile.json` updated with all your information
- [ ] `contact.githubUsername` added to profile.json
- [ ] Dependencies installed (jq, gh, git)
- [ ] Deployment script executed successfully
- [ ] GitHub Actions completed successfully
- [ ] Site accessible at `https://username.github.io`
- [ ] (Optional) Custom domain configured
- [ ] (Optional) HTTPS enforced

---

**Congratulations on deploying your portfolio! 🎉**

Your professional portfolio is now live and accessible to the world. Share your URL on LinkedIn, resume, and with potential employers!
