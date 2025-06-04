import {onloadInit} from "@utils/onload.js"
import { DEBUGPRINTS } from "./config.js"
import { getUsername, getUserToken } from "./utils/userData.js";
import { showLoginModal } from "@utils/modals.js";
import { checkToken } from "@utils/token.js";

import "@social/open_close_chat.js";
import "@social/eventlistenersSocial.js";
import "@chat/chat_eventlisteners.js";
import "@chat/chatSocketState.js";

//Dynamically load HTML, JS, and CSS for each route
export const loadRoute = async (route) => {
    const app = document.getElementById('app');
    const gameContainer = document.getElementById('game-container')
    const canvas = document.getElementById("gameCanvas")
    const overlay = document.querySelector('.overlay')

    //baseRoute used for canvas visibility
    const baseRoute = route.split('/')[0]

    //gets the last part of route, to handle sub-route if present
    const routeName = route.split('/').pop()

    // Load the HTML file
    const res = await fetch(`./routes/${route}/${routeName}.html`)
    if (res.ok) {
        app.innerHTML = await res.text();
    }

    // fetch HEAD to check only if the file exist then load the CSS file 
    const cssPath = `./routes/${route}/${routeName}.css`
    fetch(cssPath, {method: 'HEAD' }).then((res) => {
        if (res.ok) {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = cssPath;
            document.head.appendChild(cssLink);
        }
    })

    // Load the JavaScript file
    import(`./routes/${route}/${routeName}.js`).then((module) => {
        if (module.init) {
            module.init();
        }
    });

    //array of routes with canvas visible
    const visibleCanvasRoutes = ["menu", "pong", "block"]

    if (visibleCanvasRoutes.includes(baseRoute)) {
        gameContainer.classList.remove("hidden")
    } else {
        gameContainer.classList.add("hidden")
    }

    overlay.innerHTML = ""
};

// Routing logic
const routes = {
    '/': 'menu',
    '/stats':'stats',
    '/settings':'settings',
    '/users' : 'users',
    '/block': 'block',
    '/pong': 'pong',
    '/pong/singleplayer': 'pong/singleplayer',
    '/pong/multiplayer': 'pong/multiplayer',
    '/pong/onlineplayer': 'pong/onlineplayer',
    '/pong/onlineplayer/onlinegame': 'pong/onlineplayer/onlinegame',
    '/pong/tournament': 'pong/tournament',
    '/leaderboard': 'leaderboard',
    '/pong/tournament/tournamentgame': 'pong/tournament/tournamentgame',
};

export const router = () => {
    if (DEBUGPRINTS) console.log("%c Hashchange happend!", "color: red;")
    if (DEBUGPRINTS) console.log("location.hash: ", location.hash)

    const hash = location.hash.slice(1) || '/';
    const route = routes[hash] || routes[hash.split('/')[0]]
    if (DEBUGPRINTS) console.log("route: ", route)
    if (route) {
        loadRoute(route);
    } else {
        document.getElementById('app').innerHTML = '<h1>404 - Page Not Found</h1>';
    }
};

window.addEventListener('hashchange', router);

window.addEventListener('load', async () => {

    //all tasks to do at first load of the page
    onloadInit()

    // startRandomTimerForMessage()

    //load initial route
    router()
});
