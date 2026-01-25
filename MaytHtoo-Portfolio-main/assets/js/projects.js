// GitHub Projects Loader
const GITHUB_USERNAME = 'MyatHtoo';
const MAX_PROJECTS = 9; // Number of projects to display
const README_MAX_LENGTH = 280;

async function fetchReadmePreview(repo) {
    const branch = repo.default_branch || 'main';
    const readmeUrl = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repo.name}/${branch}/README.md`;
    try {
        const response = await fetch(readmeUrl, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('README missing');
        }
        const markdown = await response.text();
        return createReadmeExcerpt(markdown);
    } catch (error) {
        console.warn(`README not available for ${repo.name}:`, error.message);
        return {
            preview: 'README not available for this project yet.',
            full: 'README not available for this project yet.'
        };
    }
}

function createReadmeExcerpt(markdown) {
    if (!markdown) {
        return {
            preview: 'README not available for this project yet.',
            full: 'README not available for this project yet.'
        };
    }
    const withoutCodeBlocks = markdown.replace(/```[\s\S]*?```/g, '');
    const withoutImages = withoutCodeBlocks.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
    const withoutLinks = withoutImages.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
    const plainText = withoutLinks
        .replace(/^#+\s/gm, '')
        .replace(/[*_>`~|-]/g, '')
        .replace(/\r?\n\s*\r?\n/g, '\n\n')
        .trim();
    const excerpt = plainText.split(/\n{2,}/).find((block) => block.trim().length > 0) || plainText.split('\n').find((line) => line.trim().length > 0) || plainText;
    if (!excerpt) {
        return {
            preview: 'README not available for this project yet.',
            full: 'README not available for this project yet.'
        };
    }
    const trimmed = excerpt.trim();
    const preview = trimmed.length > README_MAX_LENGTH ? `${trimmed.slice(0, README_MAX_LENGTH - 1).trim()}…` : trimmed;
    return {
        preview,
        full: trimmed
    };
}

async function fetchGitHubProjects() {
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch repositories');
        }
        
        const repos = await response.json();
        
        // Filter out only private repos, include forks
        const filteredRepos = repos
            .filter(repo => !repo.private)
            .sort((a, b) => {
                // First sort by stars
                if (b.stargazers_count !== a.stargazers_count) {
                    return b.stargazers_count - a.stargazers_count;
                }
                // Then by updated date
                return new Date(b.updated_at) - new Date(a.updated_at);
            })
            .slice(0, MAX_PROJECTS);

        const reposWithReadme = await Promise.all(
            filteredRepos.map(async (repo) => {
                const { preview, full } = await fetchReadmePreview(repo);
                return {
                    ...repo,
                    readmeExcerpt: preview,
                    readmeExcerptFull: full
                };
            })
        );
        
        return reposWithReadme;
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        return [];
    }
}

function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'Python': '#3572A5',
        'Java': '#b07219',
        'TypeScript': '#2b7489',
        'C++': '#f34b7d',
        'C': '#555555',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'PHP': '#4F5D95',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Kotlin': '#F18E33',
        'Swift': '#ffac45',
        'Shell': '#89e051',
        'Dart': '#00B4AB',
        'Vue': '#41b883',
        'Jupyter Notebook': '#DA5B0B',
        'Arduino': '#bd79d1'
    };
    return colors[language] || '#cccccc';
}

function createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const description = repo.readmeExcerpt || 'README not available for this project yet.';
    const tooltipText = repo.readmeExcerptFull || repo.readmeExcerpt || 'README not available for this project yet.';
    const language = repo.language || 'Unknown';
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    
    // Create topics/tags
    const topics = repo.topics || [];
    const tagsHTML = topics.slice(0, 3).map(topic => 
        `<span class="project-tag">${topic}</span>`
    ).join('');
    
    card.innerHTML = `
        <div class="project-header">
            <i class="fas fa-folder-open project-icon"></i>
            <div class="project-title">
                <h3>${repo.name}</h3>
            </div>
        </div>
        
        <p class="description" title="${tooltipText.replace(/"/g, '&quot;')}">${description}</p>
        
        ${topics.length > 0 ? `<div class="project-tags">${tagsHTML}</div>` : ''}
        
        <div class="project-stats">
            <div class="project-stat">
                <i class="fas fa-star"></i>
                <span>${stars}</span>
            </div>
            <div class="project-stat">
                <i class="fas fa-code-branch"></i>
                <span>${forks}</span>
            </div>
            <div class="project-stat">
                <i class="fas fa-circle" style="color: ${getLanguageColor(language)}"></i>
                <span>${language}</span>
            </div>
        </div>
        
        <div class="project-links">
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-link">
                <i class="fab fa-github"></i>
                <span>Code</span>
            </a>
            ${repo.homepage ? `
                <a href="${repo.homepage}" target="_blank" rel="noopener noreferrer" class="project-link">
                    <i class="fas fa-external-link-alt"></i>
                    <span>Demo</span>
                </a>
            ` : ''}
        </div>
    `;
    
    return card;
}

function displayProjects(projects) {
    const container = document.getElementById('projectsContainer');
    
    if (!container) return;
    
    // Clear loading message
    container.innerHTML = '';
    
    if (projects.length === 0) {
        container.innerHTML = `
            <div class="loading-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>No projects found. Please check back later!</p>
            </div>
        `;
        return;
    }
    
    // Create and append project cards
    projects.forEach(project => {
        const card = createProjectCard(project);
        container.appendChild(card);
    });
}

// Initialize projects when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const projects = await fetchGitHubProjects();
    displayProjects(projects);
});

// Also add scroll reveal animation if available
if (typeof srtop !== 'undefined') {
    window.addEventListener('load', () => {
        srtop.reveal('.work .heading', { delay: 200 });
        srtop.reveal('.project-card', { interval: 200 });
    });
}
