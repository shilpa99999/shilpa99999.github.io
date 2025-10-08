/**
 * Profile Loader - Dynamically loads and renders profile data from JSON
 * This script fetches profile data and populates the HTML template
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        dataPath: 'data/profile.json',
        selectors: {
            // Header & Navigation
            siteLogo: '#header-logo',
            navMenu: '#nav-menu',
            navLinks: '#nav-links',
            
            // Banner/Hero Section
            profileName: '#profile-name',
            profileTitle: '#profile-title',
            profileImage: '#profile-image',
            profileIntro: '#profile-intro',
            profileBackground: '#profile-background',
            profileResearch: '#profile-research',
            cvButton: '#cv-button',
            
            // Publications
            publicationsGrid: '#publications-grid',
            
            // Projects
            projectsGrid: '#projects-grid',
            
            // Contact
            contactEmail: '#contact-email',
            contactLinks: '#contact-links',
            
            // Page
            pageTitle: 'title'
        }
    };

    /**
     * Main initialization function
     */
    async function init() {
        try {
            const data = await fetchProfileData();
            if (data) {
                renderProfile(data);
                console.log('Profile loaded successfully');
            }
        } catch (error) {
            console.error('Error initializing profile:', error);
            showError('Failed to load profile data');
        }
    }

    /**
     * Fetch profile data from JSON file
     */
    async function fetchProfileData() {
        try {
            const response = await fetch(CONFIG.dataPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching profile data:', error);
            return null;
        }
    }

    /**
     * Main render function that delegates to section renderers
     */
    function renderProfile(data) {
        renderPageMeta(data);
        renderHeader(data);
        renderBanner(data);
        renderPublications(data.publications);
        renderProjects(data.projects);
        renderSkills(data.skills);
        renderEducation(data);
        applyThemeColors(data.siteConfig);
    }

    /**
     * Render page metadata
     */
    function renderPageMeta(data) {
        if (data.profile && data.profile.name) {
            document.title = data.profile.name;
        }
    }

    /**
     * Render header section
     */
    function renderHeader(data) {
        // Logo/Name
        const logo = document.querySelector(CONFIG.selectors.siteLogo);
        if (logo && data.profile) {
            logo.innerHTML = `<strong>${data.profile.name}</strong>`;
        }

        // Navigation
        const navLinks = document.querySelector(CONFIG.selectors.navLinks);
        if (navLinks && data.navigation) {
            navLinks.innerHTML = '';
            data.navigation.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<a href="${item.href}">${item.label}</a>`;
                navLinks.appendChild(li);
            });
        }

        // Contact links in header
        if (data.contact) {
            const contactLinks = navLinks || document.querySelector(CONFIG.selectors.navLinks);
            if (contactLinks) {
                if (data.contact.email) {
                    const emailLi = document.createElement('li');
                    emailLi.innerHTML = `<a href="mailto:${data.contact.email}">${data.contact.email}</a>`;
                    contactLinks.appendChild(emailLi);
                }
                if (data.contact.linkedin) {
                    const linkedinLi = document.createElement('li');
                    linkedinLi.innerHTML = `<a href="${data.contact.linkedin}" target="_blank" rel="noopener">LinkedIn</a>`;
                    contactLinks.appendChild(linkedinLi);
                }
                if (data.contact.github) {
                    const githubLi = document.createElement('li');
                    githubLi.innerHTML = `<a href="${data.contact.github}" target="_blank" rel="noopener">GitHub</a>`;
                    contactLinks.appendChild(githubLi);
                }
                if (data.contact.googleScholar) {
                    const scholarLi = document.createElement('li');
                    scholarLi.innerHTML = `<a href="${data.contact.googleScholar}" target="_blank" rel="noopener">Google Scholar</a>`;
                    contactLinks.appendChild(scholarLi);
                }
            }
        }
    }

    /**
     * Render banner/hero section
     */
    function renderBanner(data) {
        if (!data.profile) return;

        // Name
        const nameEl = document.querySelector(CONFIG.selectors.profileName);
        if (nameEl) {
            nameEl.textContent = data.profile.name;
        }

        // Title
        const titleEl = document.querySelector(CONFIG.selectors.profileTitle);
        if (titleEl) {
            titleEl.textContent = `${data.profile.title} | ${data.profile.organization}`;
        }

        // Profile Image
        const imageEl = document.querySelector(CONFIG.selectors.profileImage);
        if (imageEl && data.profile.profileImage) {
            imageEl.src = data.profile.profileImage;
            imageEl.alt = data.profile.name;
            // Performance hint
            try { imageEl.decoding = 'async'; } catch(e) {}
        }

        // Bio sections
        if (data.bio) {
            const introEl = document.querySelector(CONFIG.selectors.profileIntro);
            if (introEl && data.bio.introduction) {
                introEl.innerHTML = data.bio.introduction;
            }

            const bgEl = document.querySelector(CONFIG.selectors.profileBackground);
            if (bgEl && data.bio.background) {
                bgEl.innerHTML = data.bio.background;
            }

            const researchEl = document.querySelector(CONFIG.selectors.profileResearch);
            if (researchEl && data.bio.researchFocus) {
                researchEl.innerHTML = data.bio.researchFocus;
            }
        }

        // Hero Metrics
        const metricsEl = document.querySelector('#hero-metrics');
        if (metricsEl && data.profile.metrics) {
            metricsEl.innerHTML = data.profile.metrics.map(metric => {
                const parts = metric.split(' ');
                const value = parts[0];
                const label = parts.slice(1).join(' ');
                return `
                    <div class="metric-item">
                        <div class="metric-value">${value}</div>
                        <div class="metric-label">${label}</div>
                    </div>
                `;
            }).join('');
        }

        // CV Button
        const cvBtn = document.querySelector(CONFIG.selectors.cvButton);
        if (cvBtn && data.profile.cvPath) {
            cvBtn.href = data.profile.cvPath;
        }
    }

    /**
     * Render publications section
     */
    function renderPublications(publications) {
        const container = document.querySelector(CONFIG.selectors.publicationsGrid);
        if (!container || !publications) return;

        container.innerHTML = '';
        
        publications.forEach(pub => {
            const article = createPublicationCard(pub);
            container.appendChild(article);
        });
    }

    /**
     * Create a publication card element
     */
    function createPublicationCard(pub) {
        const article = document.createElement('article');
        article.className = 'publication-card';
        
        let linksHtml = '';
        if (pub.links) {
            if (pub.links.paper) {
                linksHtml += `<li><a href="${pub.links.paper}" class="button">Read Paper</a></li>`;
            } else if (pub.links.status) {
                linksHtml += `<li><a href="#" class="button">Paper (${pub.links.status})</a></li>`;
            }
            if (pub.links.github) {
                linksHtml += `<li><a href="${pub.links.github}" class="button">View Project</a></li>`;
            }
        }

        article.innerHTML = `
            <div class="image">
                <img src="${pub.image || 'images/pic01.jpg'}" alt="${pub.title}" loading="lazy" decoding="async" />
            </div>
            <div class="content">
                <h3>${pub.title}</h3>
                ${pub.authors ? `<p class="authors">${pub.authors}${pub.venue ? ', ' + pub.venue : ''}</p>` : ''}
                ${pub.venue && !pub.authors ? `<p class="authors">${pub.venue}</p>` : ''}
                <p class="description">${pub.description}</p>
                ${linksHtml ? `<ul class="actions">${linksHtml}</ul>` : ''}
            </div>
        `;
        
        return article;
    }

    /**
     * Render projects section with category filtering
     */
    function renderProjects(projects) {
        const container = document.querySelector(CONFIG.selectors.projectsGrid);
        if (!container || !projects) return;

        // Add category filter buttons
        const categoriesHtml = createCategoryFilter(projects);
        const filterContainer = document.createElement('div');
        filterContainer.className = 'project-filter-container';
        filterContainer.innerHTML = categoriesHtml;
        
        // Insert filter before projects grid
        const projectsSection = container.closest('section');
        const existingFilter = projectsSection.querySelector('.project-filter-container');
        if (existingFilter) {
            existingFilter.remove();
        }
        projectsSection.insertBefore(filterContainer, container);

        // Render all projects initially
        renderProjectsByCategory(projects, 'all');
        
        // Add event listeners for category filtering
        attachCategoryFilterListeners(projects);
    }

    /**
     * Create category filter buttons
     */
    function createCategoryFilter(projects) {
        const categories = [...new Set(projects.map(p => p.category))].filter(Boolean);
        
        return `
            <div class="project-categories">
                <button class="category-btn active" data-category="all">All Projects</button>
                ${categories.map(category => `
                    <button class="category-btn" data-category="${category}">
                        ${category === 'academic' ? 'Academic' : category === 'github' ? 'Portfolio' : category}
                    </button>
                `).join('')}
            </div>
        `;
    }

    /**
     * Render projects by category
     */
    function renderProjectsByCategory(projects, selectedCategory) {
        const container = document.querySelector(CONFIG.selectors.projectsGrid);
        if (!container) return;

        const filteredProjects = selectedCategory === 'all' 
            ? projects 
            : projects.filter(p => p.category === selectedCategory);

        container.innerHTML = '';
        
        filteredProjects.forEach(project => {
            const article = createExpandableProjectCard(project);
            container.appendChild(article);
        });
    }

    /**
     * Attach event listeners for category filtering
     */
    function attachCategoryFilterListeners(projects) {
        const categoryButtons = document.querySelectorAll('.category-btn');
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Update active button
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filter and render projects
                const selectedCategory = this.dataset.category;
                renderProjectsByCategory(projects, selectedCategory);
            });
        });
    }

    /**
     * Create an expandable project card element
     */
    function createExpandableProjectCard(project) {
        const article = document.createElement('article');
        article.className = `project-card expandable-card ${project.category}-project`;
        article.dataset.projectId = project.id;
        // A11y: make card focusable and operable via keyboard
        article.setAttribute('tabindex', '0');
        article.setAttribute('role', 'button');
        article.setAttribute('aria-expanded', 'false');
        
        // Create collapsed view (default state)
        const collapsedView = createCollapsedProjectView(project);
        
        // Create expanded view (hidden by default)
        const expandedView = createExpandedProjectView(project);
        
        article.innerHTML = `
            <div class="card-content">
                ${collapsedView}
                ${expandedView}
            </div>
        `;
        
        // Make entire card clickable, but ignore clicks on interactive children (e.g., links)
        article.addEventListener('click', function(e) {
            const interactive = e.target.closest('a, button');
            if (interactive) return; // allow normal link/button behavior
            toggleProjectExpansion(article);
        });

        // Keyboard support: toggle on Enter/Space
        article.addEventListener('keydown', function(e) {
            const interactive = e.target.closest('a, button');
            if (interactive) return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleProjectExpansion(article);
            }
        });
        
        return article;
    }

    /**
     * Create collapsed project view - ultra minimal
     */
    function createCollapsedProjectView(project) {
        return `
            <div class="collapsed-content">
                <div class="project-header">
                    <h3 class="project-title">
                        ${project.title}
                        ${project.year ? `<span class="project-year">${project.year}</span>` : ''}
                        <span class="expand-indicator">•••</span>
                    </h3>
                </div>
                <p class="project-description">${project.shortDescription}</p>
            </div>
        `;
    }

    /**
     * Create expanded project view
     */
    function createExpandedProjectView(project) {
        // Complete metrics
        let fullMetricsHtml = '';
        if (project.metrics && project.metrics.length > 0) {
            fullMetricsHtml = `
                <div class="project-metrics expanded">
                    ${project.metrics.map(metric => `
                        <div class="metric-item" title="${metric.tooltip || ''}">
                            <div class="metric-value">${metric.value}</div>
                            <div class="metric-label">${metric.label}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Complete tech stack
        let fullTechStackHtml = '';
        if (project.techStack && project.techStack.length > 0) {
            fullTechStackHtml = `
                <div class="tech-stack-expanded">
                    <h4>Technologies Used:</h4>
                    <div class="tech-pills expanded">
                        ${project.techStack.map(tech => 
                            `<span class="tech-pill">${tech}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }

        // Project links
        let linksHtml = '';
        if (project.links) {
            const linkItems = [];
            if (project.links.github) {
                // Minimal inline GitHub icon (Octicons-style)
                linkItems.push(`
                <a href="${project.links.github}" target="_blank" rel="noopener" class="project-link github-link">
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.79 8.2 11.39.6.11.82-.26.82-.58 0-.29-.01-1.07-.02-2.09-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.1-.76.08-.74.08-.74 1.22.09 1.86 1.25 1.86 1.25 1.08 1.85 2.83 1.32 3.52 1.01.11-.78.42-1.32.76-1.62-2.67-.3-5.47-1.34-5.47-5.98 0-1.32.47-2.39 1.25-3.24-.13-.3-.54-1.53.12-3.18 0 0 1.02-.33 3.34 1.24.97-.27 2-.41 3.03-.41s2.06.14 3.03.41c2.32-1.57 3.34-1.24 3.34-1.24.66 1.65.24 2.88.12 3.18.78.85 1.25 1.92 1.25 3.24 0 4.65-2.81 5.68-5.49 5.98.43.37.82 1.1.82 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.21.7.83.58C20.56 21.79 24 17.3 24 12 24 5.37 18.63 0 12 0z"/>
                  </svg>
                  <span>GitHub</span>
                </a>`);
            }
            if (project.links.website) {
                linkItems.push(`<a href="${project.links.website}" target="_blank" rel="noopener" class="project-link demo-link">
                    <span class="link-text">Live Demo</span>
                </a>`);
            }
            if (project.documentPath) {
                // Minimal download icon (outline)
                linkItems.push(`
                <a href="${project.documentPath}" target="_blank" class="project-link document-link" download>
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 3v10"/>
                    <path d="M8 11l4 4 4-4"/>
                    <path d="M5 21h14a2 2 0 0 0 2-2v-3H3v3a2 2 0 0 0 2 2z"/>
                  </svg>
                  <span>View Document</span>
                </a>`);
            }
            
            if (linkItems.length > 0) {
                linksHtml = `
                    <div class="project-links">
                        ${linkItems.join('')}
                    </div>
                `;
            }
        }

        return `
            <div class="expanded-content" style="display: none;">
                ${fullMetricsHtml}
                <div class="project-detailed-description">
                    ${project.detailedDescription || project.shortDescription}
                </div>
                ${fullTechStackHtml}
                ${linksHtml}
            </div>
        `;
    }

    /**
     * Toggle project card expansion
     */
    function toggleProjectExpansion(article) {
        const collapsedContent = article.querySelector('.collapsed-content');
        const expandedContent = article.querySelector('.expanded-content');
        
        const isExpanded = article.classList.contains('expanded');
        
        if (isExpanded) {
            // Collapse
            article.classList.remove('expanded');
            collapsedContent.style.display = 'block';
            expandedContent.style.display = 'none';
            article.setAttribute('aria-expanded', 'false');
        } else {
            // Expand
            article.classList.add('expanded');
            collapsedContent.style.display = 'none';
            expandedContent.style.display = 'block';
            article.setAttribute('aria-expanded', 'true');
            
            // Scroll to the card if it's not fully visible
            setTimeout(() => {
                const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                article.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'nearest' });
            }, 300);
        }
    }

    /**
     * Apply theme colors from configuration
     */

    function renderEducation(data) {
        const educationGrid = document.querySelector('#education-grid');
        if (!educationGrid || !data.education) return;

        educationGrid.innerHTML = data.education.map(edu => {
            // Simplify degree names
            let degree = edu.degree
                .replace('Diploma in ', '')
                .replace("Bachelor's in ", '')
                .replace("Master's in ", "Master's ");
            
            // Create logo element if logo exists
            const logoHtml = edu.logo ? `
                <div class="education-logo">
                    <img src="${edu.logo}" alt="${edu.institution} logo" loading="lazy" decoding="async" />
                </div>
            ` : '';
            
            return `
                <div class="education-item">
                    ${logoHtml}
                    <div class="education-content">
                        <div class="edu-degree">${degree}</div>
                        <div class="edu-institution">${edu.institution}, ${edu.location}</div>
                        <div class="edu-year">${edu.year}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render skills section
     */
    function renderSkills(skills) {
        const container = document.querySelector('#skills-container');
        if (!container || !skills) return;

        const categories = getSkillsCategories();
        const VISIBLE_COUNT = 6; // reduce visible items per category

        container.innerHTML = categories.map(cat => {
            const list = skills[cat.key];
            if (!list || list.length === 0) return '';

            const visible = list.slice(0, VISIBLE_COUNT);

            return `
                <div class="skills-category" data-key="${cat.key}">
                    <div class="skills-header">
                        <div class="skills-header-left">
                            <div class="skills-icon" aria-hidden="true">${getCategoryIcon(cat.key)}</div>
                            <h4>${cat.label}</h4>
                        </div>
                    </div>
                    <div id="skills-${cat.key}" class="skills-list">
                        ${visible.map(skill => `<span class="skill-item">${skill}</span>`).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    function getSkillsCategories() {
        return [
            { key: 'programmingLanguages', label: 'Programming Languages' },
            { key: 'mlDeepLearning', label: 'Machine Learning & Deep Learning' },
            { key: 'genaiLLMs', label: 'Generative AI & LLMs' },
            { key: 'mlFrameworks', label: 'ML/DL Frameworks' },
            { key: 'computerVision', label: 'Computer Vision' },
            { key: 'nlpTechniques', label: 'Natural Language Processing' },
            { key: 'conversationalAI', label: 'Conversational AI & Chatbots' },
            { key: 'dataEngineering', label: 'Data Engineering' },
            { key: 'cloudMLOps', label: 'Cloud & MLOps' },
            { key: 'modelOptimization', label: 'Model Optimization & Production' },
            { key: 'healthcareCompliance', label: 'Healthcare & Compliance' },
            { key: 'modelDeployment', label: 'Model Deployment' },
            { key: 'databasesStorage', label: 'Databases & Storage' },
            { key: 'visualization', label: 'Data Visualization & BI' },
            { key: 'testingQA', label: 'Testing & Quality Assurance' },
            { key: 'researchDevelopment', label: 'Research & Development' },
            { key: 'collaborationTools', label: 'Collaboration Tools' },
            { key: 'softSkills', label: 'Professional Skills' }
        ];
    }

    function attachSkillsToggleListeners() {
        document.querySelectorAll('.skills-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const header = btn.closest('.skills-category');
                const list = header.querySelector('.skills-list');
                const hiddenItems = list.querySelectorAll('.skill-item.hidden');
                const collapsed = header.getAttribute('data-collapsed') === 'true';

                if (collapsed) {
                    hiddenItems.forEach(el => el.classList.remove('hidden'));
                    header.setAttribute('data-collapsed', 'false');
                    btn.textContent = 'Show less';
                    btn.setAttribute('aria-expanded', 'true');
                } else {
                    hiddenItems.forEach(el => el.classList.add('hidden'));
                    header.setAttribute('data-collapsed', 'true');
                    btn.textContent = 'Show more';
                    btn.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // Minimal, crisp inline SVG icons for each category
    function getCategoryIcon(key) {
        const svgProps = 'width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
        const icons = {
            programmingLanguages: `<svg ${svgProps}><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
            mlDeepLearning: `<svg ${svgProps}><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M1 12h6m6 0h6"/><circle cx="12" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>`,
            genaiLLMs: `<svg ${svgProps}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
            mlFrameworks: `<svg ${svgProps}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
            computerVision: `<svg ${svgProps}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
            nlpTechniques: `<svg ${svgProps}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="14" y2="13"/></svg>`,
            conversationalAI: `<svg ${svgProps}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
            dataEngineering: `<svg ${svgProps}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
            cloudMLOps: `<svg ${svgProps}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`,
            modelOptimization: `<svg ${svgProps}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
            healthcareCompliance: `<svg ${svgProps}><path d="M12 2l7 4v6c0 5-3 8-7 10-4-2-7-5-7-10V6l7-4z"/><path d="M12 8v4m0 4h.01"/></svg>`,
            modelDeployment: `<svg ${svgProps}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
            databasesStorage: `<svg ${svgProps}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
            visualization: `<svg ${svgProps}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
            testingQA: `<svg ${svgProps}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
            researchDevelopment: `<svg ${svgProps}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
            collaborationTools: `<svg ${svgProps}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
            softSkills: `<svg ${svgProps}><path d="M12 12a5 5 0 100-10 5 5 0 000 10z"/><path d="M20 21a8 8 0 10-16 0"/></svg>`
        };
        return icons[key] || `<svg ${svgProps}><circle cx="12" cy="12" r="9"/></svg>`;
    }

    function applyThemeColors(config) {
        if (!config || !config.themeColors) return;

        const root = document.documentElement;
        const colors = config.themeColors;

        // Preserve legacy variables (for any remaining references)
        if (colors.primaryRed) root.style.setProperty('--primary-red', colors.primaryRed);
        if (colors.lightRed) root.style.setProperty('--light-red', colors.lightRed);
        if (colors.darkRed) root.style.setProperty('--dark-red', colors.darkRed);
        if (colors.textDark) root.style.setProperty('--text-dark', colors.textDark);
        if (colors.textLight) root.style.setProperty('--text-light', colors.textLight);
        if (colors.bgLight) root.style.setProperty('--bg-light', colors.bgLight);
        if (colors.white) root.style.setProperty('--white', colors.white);

        // Map legacy theme to new minimal palette
        if (colors.textDark) root.style.setProperty('--text-primary', colors.textDark);
        if (colors.textLight) {
            root.style.setProperty('--text-secondary', colors.textLight);
            root.style.setProperty('--text-tertiary', colors.textLight);
        }
        if (colors.primaryRed) root.style.setProperty('--accent', colors.primaryRed);
        if (colors.white) root.style.setProperty('--bg-primary', colors.white);
        if (colors.bgLight) {
            root.style.setProperty('--bg-secondary', colors.bgLight);
            root.style.setProperty('--bg-tertiary', colors.bgLight);
        }
        // Border variables remain neutral defaults (defined in CSS)
    }

    /**
     * Show error message
     */
    function showError(message) {
        console.error(message);
        // Could implement a user-facing error display here
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
