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

    // Refactor all plotting into one function
    function renderPieChart(projectsGiven) {
        // re-calculate rolled data
        let newRolledData = d3.rollups(
            projectsGiven,
            (v) => v.length,
            (d) => d.year,
        );
        // re-calculate data
        let newData = newRolledData.map(([year, count]) => {
            return { value: count, label: year };
        });
        console.log("Project year array: ", newData);

        // re-calculate slice generator, arc data, arc, etc.
        let newSliceGenerator = d3.pie().value((d) => d.value);
        let newArcData = newSliceGenerator(newData);
        let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
        let newArcs = newArcData.map((d) => arcGenerator(d));

        // Clear up paths and legends
        let svg = d3.select("#projects-pie-plot");
        svg.selectAll('path').remove();
        let legend = d3.select(".legend");
        legend.selectAll('li').remove();
        let colors = d3.scaleOrdinal(d3.schemeTableau10);

        let selectedIndex = -1;
        newArcs.forEach((arc, i) => {
            svg
                .append('path')
                .attr('d', arc)
                .attr('fill', colors(i))
                .on('click', () => {
                    selectedIndex = selectedIndex === i ? -1 : i;
                    svg
                        .selectAll('path')
                        .attr('class', (_, idx) => (
                            idx === selectedIndex ? 'selected' : ''
                        ));
                    legend
                        .selectAll('li')
                        .attr('class', (_, idx) => (
                            idx === selectedIndex ? 'selected' : ''
                        ));
                });
        });

        newData.forEach((d, idx) => {
            legend.append('li')
                .attr('style', `--color:${colors(idx)}`)
                .attr('class', 'legend-item')
                .html(`<span class="swatch" style="background-color:${colors(idx)};"></span> ${d.label} <em>(${d.value})</em>`)
                .on('click', () => {
                    selectedIndex = selectedIndex === idx ? -1 : idx;
                    svg
                        .selectAll('path')
                        .attr('class', (_, i) => (
                            i === selectedIndex ? 'selected' : ''
                        ));
                    legend
                        .selectAll('li')
                        .attr('class', (_, i) => (
                            i === selectedIndex ? 'selected' : ''
                        ));
                });
        });
        // // Update paths and legends
        // newArcs.forEach((arc, index) => {
        //     svg.append("path")
        //         .attr("d", arc)
        //         .attr("fill", colors(index));
        // });
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

