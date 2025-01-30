import { fetchJSON, renderProjects } from './global.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projects = await fetchJSON('../lib/projects.json');
    if (projects) {
        const latestProjects = projects.slice(0, 3);
        console.log('Latest projects:', latestProjects);

        const projectsContainer=document.querySelector('.projects');

        if(projectsContainer){
            renderProjects(latestProjects, projectsContainer, 'h2');
            console.log('Projects rendered successfully:', projectsContainer);
        } else {
            console.error('Container element not found');
        }
    } else {
        console.error('No data fetched');
    }

});