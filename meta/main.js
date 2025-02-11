let data = [];
let commits = d3.groups(data, (d) => d.commit);

const width = 1000;
const height = 600;

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

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
          // What other options do we need to set?
          // Hint: look up configurable, writable, and enumerable
          configurable: true,
          writable: false,
          enumerable: true
      });
  
      return ret;
      });
  }

  function displayData() {
    // processCommits();
    processCommits();

    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    // Add total LOC
    dl.append('dt').html('Total Lines of Code');
    dl.append('dd').text(data.length);

    // Add total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);

  // Add more stats as needed...

    // Calculates total num of files
    const totalFiles = d3.group(data, (d) => d.file).size;
    dl.append('dt').text('Total Number of Files');
    dl.append('dd').text(totalFiles);

    // Time of day
    const workByPeriod = d3.rollups(
        data,
        (v) => v.length,
        (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
        );
    const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
    dl.append('dt').text('Time of Day');
    dl.append('dd').text(maxPeriod);

    // Number of Days worked on site
    const totalDays = d3.group(data, (d) => d.date.toDateString()).size;
    dl.append('dt').text('Number of Days Worked');
    dl.append('dd').text(totalDays);
    
}

function createScatterPlot() {
  const svg = d3
  .select('#chart')
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .style('overflow', 'visible');

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

  const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  const dots = svg.append('g').attr('class', 'dots');

  dots
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue');
}



document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  createScatterPlot();
  });
