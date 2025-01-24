console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Step 2 
// let navLinks = $$("nav a");
// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
//   );
// if (currentLink) {
//     currentLink.classList.add('current');
//     console.log("Current link:", currentLink);
// } else {
//     console.log("No link found");
// }


// Step 3
let pages = [
    { url: 'index.html', title: 'Home' },
    { url: 'projects/index.html', title: 'Projects' },
    { url: 'contact/index.html', title: 'Contact'},
    { url: 'resume/index.html', title: 'Resume Page'},
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

  // Attach an input event listener
  select.addEventListener('input', function (event) {
    document.documentElement.style.setProperty('color-scheme', event.target.value);
    console.log('Color scheme changed to:', event.target.value);
  });