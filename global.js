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
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact'},
    { url: 'resume/', title: 'Resume Page'},
    { url: 'https://github.com/kesouder', title: 'GitHub Profile', external: true }
  ];

let nav = document.createElement('nav');
document.body.prepend(nav);

const ARE_WE_HOME = document.documentElement.classList.contains('home');

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    // TODO create link and add it to nav
    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
      }
    if (p.external) {
        nav.insertAdjacentHTML(
          'beforeend',
          `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`
        );
      } else {
        nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
      }
    }
