import {onloadInit} from "./utils/onload.js"


//Dynamically load HTML, JS, and CSS for each route
const loadRoute = async (route) => {
    const app = document.getElementById('app');
    const canvas = document.getElementById("gameCanvas")
    const overlay = document.querySelector('.overlay')

    // Load the HTML file
    const html = await fetch(`./routes/${route}/${route}.html`).then((res) => res.text());
    app.innerHTML = html;

    // Load the CSS file
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = `./routes/${route}/${route}.css`;
    document.head.appendChild(cssLink);

    // Load the JavaScript file
    import(`./routes/${route}/${route}.js`).then((module) => {
        if (module.init) {
            module.init();
        }
    });

    //array of routes with canvas visible
    const visibleCanvasRoutes = ["menu", "pong", "block"]

    if (visibleCanvasRoutes.includes(route)) {
        canvas.classList.remove("hidden")
    } else {
        canvas.classList.add("hidden")
    }

    overlay.innerHTML = ""
};

// Routing logic
const routes = {
    '/': 'menu',
    '/block': 'block',
    '/pong': 'pong',
    // '/stats': 'userStats',
    // '/game': 'game',
};

const router = () => {
    const hash = location.hash.slice(1) || '/';
    const route = routes[hash];
    if (route) {
        loadRoute(route);
    } else {
        document.getElementById('app').innerHTML = '<h1>404 - Page Not Found</h1>';
    }
};

window.addEventListener('hashchange', router);

window.addEventListener('load', () => {
    //all tasks to do at first load of the page
    onloadInit()

    //load initial route
    router()
});