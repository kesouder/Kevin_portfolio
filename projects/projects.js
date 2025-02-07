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

    // lab 5 D3
    const svg = d3.select("#projects-pie-plot");
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);


    let rolledData = d3.rollups(
      projects,
      (v) => v.length,
      (d) => d.year,
    );
    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });
    console.log("Porject year array: ", data);

    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let artData = sliceGenerator(data);
    let arcs = artData.map((d) => arcGenerator(d));

    arcs.forEach((arc, index) => {
        svg.append("path")
            .attr("d", arc)
            .attr("fill", colors(index)) // Fill in the attribute for fill color via indexing the colors variable 
    });

    let legend = d3.select(".legend");
    data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
          .attr('class', 'legend-item')
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
    });
    
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
    // render filtered projects
    renderProjects(filteredProjects, projectsContainer, 'h2');
    });

});

