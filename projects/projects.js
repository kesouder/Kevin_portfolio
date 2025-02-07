import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

document.addEventListener('DOMContentLoaded', async () => {
    const projects = await fetchJSON('../lib/projects.json');
    if (projects) {
        console.log('Projects were fetched', projects);

        // to fix the photos on the main and projects page
        const adjustedProjects = projects.map(project => {
            if (window.location.pathname.includes('/projects/')) {
                project.image = project.image.replace('../images/', '../images/');
                console.log('ur on project tab: use ../images/');
            } else {
                project.image = project.image.replace('../images/', './images/');
                console.log('ur on main: use ./images/');
            }
            return project;
        });
        // if you delete ^ , change image source in projects.json

        const projectsContainer = document.querySelector('.projects');
        const projectsTitle = document.querySelector('.projects-title');
        if (projectsContainer) {
            // renderProjects(projects, projectsContainer, 'h2');
            renderProjects(adjustedProjects, projectsContainer, 'h2');
            console.log('Projects rendered successfully:', projectsContainer);

            if (projectsTitle) {
                projectsTitle.textContent = `${projects.length} Projects`;
                console.log('Projects-title worked');
            } else {
                console.error('Projects title element not found');
            }
        } else {
            console.error('Container element not found');
        }
    } else {
        console.error('No data fetched');
    }

    // Lab 5 Setp 4.4
    let selectedIndex = -1;
    function renderPieChart(projectsGiven) {
        let newRolledData = d3.rollups(
            projectsGiven,
            (v) => v.length,
            (d) => d.year,
        );
    
        let newData = newRolledData.map(([year, count]) => (
            {
            value: count,
            label: year
        }));
    
        console.log("Project year array: ", newData);
    
        let newSliceGenerator = d3.pie().value((d) => d.value);
        let newArcData = newSliceGenerator(newData);
        let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    
        const colors = d3.scaleOrdinal(d3.schemeTableau10);
    
        let svg = d3.select("#projects-pie-plot");
        svg.selectAll('path').remove();
        // update legend
        let legend = d3.select(".legend");

        legend.selectAll('li').remove();
    
        newArcData.forEach((arc, i) => {
            svg.append('path')
                .attr('d', arcGenerator(arc))
                .attr('fill', colors(i))
                .attr('class', 'wedge')
                .style('cursor', 'pointer')
                .on('click', () => {
                    selectedIndex = selectedIndex === i ? -1 : i;
    
                    svg.selectAll('path')
                        .attr('class', (_, idx) => 
                            (idx === selectedIndex ? 'selected' : ''));

                    legend.selectAll('li')
                        .attr('class', (_, idx) => 
                            (idx === selectedIndex ? 'legend-item selected' : 'legend-item'));
                });
        });

        newData.forEach((d, idx) => {
            legend.append('li')
                .attr('class', 'legend-item')
                .html(
                    `<span class="swatch" style="background-color:${colors(idx)};"></span> 
                    ${d.label} <em>(${d.value})</em>`);
        });
    }
    

    // Call this function on page load
    renderPieChart(projects);

    const projectsContainer = document.querySelector('.projects');

    let query = '';
    let searchInput = document.querySelector('.searchBar');

    searchInput.addEventListener('input', (event) => {
        // update query value
        query = event.target.value;
        console.log('Search query:', query);
        // filter projects
        let filteredProjects = projects.filter((project) => {
            let values = Object.values(project).join('\n').toLowerCase();
            return values.includes(query.toLowerCase());
        });
        // re-render legends and pie chart when event triggers
        renderProjects(filteredProjects, projectsContainer, 'h2');
        renderPieChart(filteredProjects);
    }); 


});

