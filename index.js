import { fetchJSON, renderProjects } from './global.js';

document.addEventListener('DOMContentLoaded', async () => {

    const projects = await fetchJSON('./lib/projects.json');
    if (projects) {
        const latestProjects = projects.slice(0, 3);
        console.log('Latest projects:', latestProjects);
        const projectsContainer = document.querySelector('.projects');

        if (projectsContainer) {
            renderProjects(latestProjects, projectsContainer, 'h2');
            console.log('Latest projects rendered successfully:', projectsContainer);
        } else {
            console.error('Projects container element not found');
        }
    } else {
        console.error('No data fetched');
    }

    // API GitHub
    const githubData = await fetchGitHubData('giorgianicolaou');
    if (githubData) {
        console.log('GitHub data fetched:', githubData);

        // Select the profile stats container
        const profileStats = document.querySelector('#profile-stats');
        if (profileStats) {
            // Update the profile stats container with the fetched GitHub data
            profileStats.innerHTML = `
                <dl>
                    <dt>Followers:</dt><dd>${githubData.followers}</dd>
                    <dt>Following:</dt><dd>${githubData.following}</dd>
                    <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
                </dl>
            `;
            console.log('Profile stats updated successfully');
        } else {
            console.error('Profile stats container element not found');
        }
    } else {
        console.error('No GitHub data fetched');
    }
});