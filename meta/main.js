let data = [];
let commits = d3.groups(data, (d) => d.commit);

const width = 1000;
const height = 600;

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
  processCommits();
  displayData();
}

function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/vis-society/lab-7/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };
      Object.defineProperty(ret, 'lines', {
        value: lines,
        configurable: true,
        writable: false,
        enumerable: true,
      });
      return ret;
    });
}

function brushSelector() {
  const svg = d3.select('svg');

  svg.append('g')
    .attr('class', 'brush')
    .call(d3.brush().on('start brush end', brushed));

  svg.selectAll('.dots, .overlay ~ *').raise();
}

// function displayData() {
//   processCommits();
  
//   // Clear previous stats
//   d3.select('#stats').selectAll('#stats').remove();

//   // create dl element
//   const dl = d3.select('#stats').append('dl').attr('class', 'stats');

//   // add total LOC
//   dl.append('dt').html('Total Lines of Code');
//   dl.append('dd').text(data.length);

//   // add total commits
//   dl.append('dt').text('Total commits'); 
//   // dl.append('dd').text(commits.length);
//   dl.append('dd').text(commits.length);

//   // add more stats as needed
//   // calculates total num of files
//   const totalFiles = d3.group(data, (d) => d.file).size;
//   dl.append('dt').text('Total Number of Files');
//   dl.append('dd').text(totalFiles);

//   // time of day
//   const workByPeriod = d3.rollups(
//     data,
//     (v) => v.length,
//     (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
//   );
//   const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
//   dl.append('dt').text('Time of Day');
//   dl.append('dd').text(maxPeriod);
//   // number of days worked on site
//   const totalDays = d3.group(data, (d) => d.date.toDateString()).size;
//   dl.append('dt').text('Number of Days Worked');
//   dl.append('dd').text(totalDays);
// }

function displayData() {
  // Clear previous stats
  d3.select('#stats').selectAll('*').remove();

  // Create dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC
  const totalLOC = filteredCommits.reduce((sum, commit) => sum + commit.totalLines, 0);
  console.log('Total Lines of Code:', totalLOC);
  dl.append('dt').html('Total Lines of Code');
  dl.append('dd').text(totalLOC);

  // Add total commits
  console.log('Total commits:', filteredCommits.length);
  dl.append('dt').text('Total commits');
  dl.append('dd').text(filteredCommits.length);

  const allFiles = filteredCommits.flatMap(commit => commit.lines.map(line => line.file));
  const totalFiles = new Set(allFiles).size;
  console.log('Total Number of Files:', totalFiles);
  dl.append('dt').text('Total Number of Files');
  dl.append('dd').text(totalFiles);

  // Time of day
  const workByPeriod = d3.rollups(
    filteredCommits,
    (v) => v.length,
    (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
  );
  const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
  console.log('Time of Day:', maxPeriod);
  dl.append('dt').text('Time of Day');
  dl.append('dd').text(maxPeriod);

  // Number of days worked on site
  const totalDays = d3.group(filteredCommits, (d) => new Date(d.datetime).toDateString()).size;
  console.log('Number of Days Worked:', totalDays);
  dl.append('dt').text('Number of Days Worked');
  dl.append('dd').text(totalDays);
}


let xScale;
let yScale;

// function createScatterPlot() {
function updateScatterPlot(filteredCommits){

  d3.select('svg').remove(); 
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  xScale = d3
    .scaleTime()
    .domain(d3.extent(filteredCommits, (d) => d.datetime))
    .range([0, width])
    .nice();

  yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);

  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

    // create gridlines as an axis with no labels and full-width ticks
  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
  console.log('gridlines made');

  // create axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');
// add x axis
  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);
// add y axis
  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);

  const dots = svg.append('g').attr('class', 'dots');
  const [minLines, maxLines] = d3.extent(filteredCommits, (d) => d.totalLines);

  const rScale = d3
    .scaleLog()
    .domain([Math.max(1, minLines), maxLines])
    .range([3, 16]);

  // const sortedCommits = d3.sort(filteredCommits, (d) => -d.totalLines);

  dots.selectAll('circle').remove();

  const circles = dots
    .selectAll('circle')
    .data(filteredCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 0)
    // .attr('r', (d) => rScale(d.totalLines))
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).classed('selected', true);
      updateTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mousemove', (event) => {
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).classed('selected', false);
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipContent({});
      updateTooltipVisibility(false);
    });

    // Trigger the transition
    circles.transition()
    .duration(500)
    .attr('r', (d) => rScale(d.totalLines));

  brushSelector();
  // end of scatterPlot
}

let commitProgress = 100;
let timeScale;
let commitMaxTime;

let brushSelection = null;
let selectedCommits = [];

function brushed(evt) {
  brushSelection = evt.selection;
  selectedCommits = !brushSelection
    ? []
    : filteredCommits.filter((commit) => {
        let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
        let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
        let x = xScale(commit.date);
        let y = yScale(commit.hourFrac);

        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
      });
  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}

function isCommitSelected(commit) {
  return selectedCommits.includes(commit);
}

function updateSelection() {
  // Update visual state of dots based on selection
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
  const selectedCommits = brushSelection
    ? filteredCommits.filter(isCommitSelected)
    : [];

  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function updateLanguageBreakdown() {
  const selectedCommits = brushSelection
    ? filteredCommits.filter(isCommitSelected)
    : [];
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : filteredCommits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );
  // Update DOM with breakdown
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
      <dt>${language}</dt>
      <dd>${count} lines (${formatted})</dd>
    `;
  }

  return breakdown;
}

function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const linesEdited = document.getElementById('commit-lines-edited');

  if (!link || !date || !time || !author || !linesEdited) {
    console.error('One or more elements not found');
    return;
  }
  if (Object.keys(commit).length === 0) return;
  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
  time.textContent = commit.datetime?.toLocaleString('en', {
    timeStyle: 'short',
  });
  author.textContent = commit.author;
  linesEdited.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.display = isVisible ? 'block' : 'none';
}

function updateTooltipPosition(event) {

  const tooltip = document.getElementById('commit-tooltip');
  const tooltipHeight = tooltip.offsetHeight;
  const offset = 10;
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY - tooltipHeight - offset}px`;
}

// Step 2
function updateFileDetails(){
  let lines = filteredCommits.flatMap((d) => d.lines);
  let files = [];
  files = d3
    .groups(lines, (d) => d.file)
    .map(([name, lines]) => {
      return { name, lines };
    });

  files = d3.sort(files, (d) => -d.lines.length);
  console.log('files:', files);
  
  // Display the file details
  const fileDetailsContainer = d3.select('.files');
  fileDetailsContainer.selectAll('div').remove(); // Clear previous details

  let filesContainer = fileDetailsContainer.selectAll('div')
    .data(files)
    .enter()
    .append('div');

  filesContainer.append('dt').append('code').text(d => d.name);
  // filesContainer.append('dd').text(d => `${d.lines.length} lines`);
  let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
  // TODO, append divs and set each's class attribute
  filesContainer.append('dd')
  .selectAll('div')
  .data(d => d.lines)
  .enter()
  .append('div')
  .attr('class', 'line')
  .style('background', d => fileTypeColors(d.type)); // TODO, apply the color scale based on line type
  
}


let filteredCommits = [];
function updateTimeDisplay() {
  const timeSlider = document.getElementById('commit-slider');
  commitProgress = Number(timeSlider.value);
  commitMaxTime = timeScale.invert(commitProgress);
  document.getElementById('selectedTime').textContent = commitMaxTime.toLocaleString('en', { dateStyle: "long", timeStyle: "short" });

  // filter commits based on commitMaxTime
  filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
  console.log('filtered Commits: ', filteredCommits);

    // Update scatter plot with filteredCommits
  updateScatterPlot(filteredCommits);

  displayData();

  updateFileDetails();
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  // createScatterPlot();
  updateScatterPlot(commits);

  // Initialize timeScale after commits are populated
  timeScale = d3.scaleTime([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)], [0, 100]);
  commitMaxTime = timeScale.invert(commitProgress);

  updateTimeDisplay();

  const timeSlider = document.getElementById('commit-slider');
  timeSlider.addEventListener('input', updateTimeDisplay);
});
