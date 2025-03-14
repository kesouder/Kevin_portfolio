console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}


// Step 3
let pages = [
    { url: 'index.html', title: 'Home' },
    { url: 'projects/index.html', title: 'Projects' },
    { url: 'contact/index.html', title: 'Contact'},
    { url: 'resume/index.html', title: 'Resume Page'},
    { url: 'meta/index.html', title: 'Meta Page'},
    { url: 'https://github.com/kesouder', title: 'GitHub Profile'}
  ];

let nav = document.createElement('nav');
document.body.prepend(nav);

const ARE_WE_HOME = document.documentElement.classList.contains('home');
const IS_RESUME_PAGE = document.documentElement.classList.contains('resume');

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    // TODO create link and add it to nav
    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
      }

    // nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
    // becomes
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
      }

    if (a.host !== location.host){
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
}

if (IS_RESUME_PAGE) {
    let a = document.createElement('a');
    a.href = "https://www.linkedin.com/in/kevin-souder-2084a426b/";
    a.textContent = "LinkedIn";
    nav.append(a);
    a.target = "_blank";
    a.rel = "noopener noreferrer";
}

//Step 4
document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select id="theme-selector">
        <option value="light dark"> Automatic </option>
        <option value="light"> Light </option>
        <option value="dark"> Dark </option>
      </select>
    </label>`
  );

  const select = document.querySelector('#theme-selector');

  // check localStorage
  document.addEventListener('DOMContentLoaded', () => {
    if ("colorScheme" in localStorage) {
      document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
      select.value = localStorage.colorScheme;
      console.log('Loaded saved color scheme:', localStorage.colorScheme);
    }
  });
  
  //save color sheme preference if changed on website
  select.addEventListener('input', function (event) {
    document.documentElement.style.setProperty('color-scheme', event.target.value);
    localStorage.colorScheme = event.target.value; // save preference
    console.log('Color scheme changed to:', event.target.value);
  });

// Step 5
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form?.addEventListener('submit', function(event) {
      event.preventDefault();
      const data = new FormData(form);
      let url = form.action + "?";
      for (let [name, value] of data) {
        // Use encodeURIComponent to escape values
        url += `${encodeURIComponent(name)}=${encodeURIComponent(value)}&`;
      }
      url = url.slice(0, -1);
  
      console.log(url);
      location.href = url;
    });
  });

  // Lab 4

  export async function fetchJSON(url) {
    try {
        // Fetch the JSON file from the given URL
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      console.log('Repsonse', response)
      const data = await response.json();
      console.log('Data:', data);
      return data; 

    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';

    project.forEach(project => {
        const article = document.createElement('article');

        const heading = document.createElement(headingLevel);
        heading.textContent = project.title;

        const image = document.createElement('img');
        image.src = project.image;
        image.alt = project.title;

        const description = document.createElement('p');
        description.textContent = project.description;

        const year = document.createElement('p');
        year.textContent = project.year;
        year.classList.add('project-year');

        const descriptionYearContainer = document.createElement('div');
        descriptionYearContainer.appendChild(description);
        descriptionYearContainer.appendChild(year);

        article.appendChild(heading);
        article.appendChild(image);
        article.appendChild(descriptionYearContainer);

        containerElement.appendChild(article);
    });
}

// Lab 4: Part 3
export async function fetchGitHubData(username) {
  if (username){
    return fetchJSON(`https://api.github.com/users/${username}`);
  } else {
    console.error('No username provided');
  }
}