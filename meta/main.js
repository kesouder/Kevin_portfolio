let data = [];
let commits = d3.groups(data, (d) => d.commit);

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));

    // processCommits();
    // console.log(commits);
    displayData();
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

document.addEventListener('DOMContentLoaded', async () => {
await loadData();
});