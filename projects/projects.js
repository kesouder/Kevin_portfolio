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

    // let arc = arcGenerator({
    //     startAngle: 0,
    //     endAngle: 2 * Math.PI,
    //   });

    // d3.select('svg').append("path")
    //     .attr("d", arc)
    //     .attr("fill", "red");

    // 1.4 
    let data = [1, 2];
    let total = 0;

    for (let d of data) {
        total += d;
    }
    let angle = 0;
    let arcData = [];

    for (let d of data) {
        let endAngle = angle + (d / total) * 2 * Math.PI;
        arcData.push({ startAngle: angle, endAngle });
        angle = endAngle;
    }
    let arcs = arcData.map((d) => arcGenerator(d));

    arcs.forEach(arc => {
        // TODO, fill in step for appending path to svg using D3
        svg.append("path")
            .attr("d", arc)
            .attr("fill", index=== 0? "red" : "blue");   
      });

});