// Dynamically load HTML, JS, and CSS for each route
const loadRoute = async (route) => {
    const app = document.getElementById('app');

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
};

// Routing logic
const routes = {
    '/': 'mainMenu',
    '/stats': 'userStats',
    '/game': 'game',
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

// Listen to hash change and page load
window.addEventListener('hashchange', router);
window.addEventListener('load', router);