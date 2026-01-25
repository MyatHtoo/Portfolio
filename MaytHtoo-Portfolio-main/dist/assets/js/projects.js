// GitHub Projects Loader
const GITHUB_USERNAME = 'MyatHtoo';
const MAX_PROJECTS = 9; // Number of projects to display

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
            });
        
        // Return all projects, not limited
        return filteredRepos;
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
    
    const description = repo.description || 'No description available';
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
        
        <p class="description">${description}</p>
        
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
