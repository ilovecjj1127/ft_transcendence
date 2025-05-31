import { io } from "socket.io-client";
import { getUserToken } from "./userData.js";
import { populateInRequest, populateOutRequest } from "../social/init_friends_data.js";

let socket;

export function initSocket() {
    const token = getUserToken().access;
    if (!token) return;

    socket = io(`http://${window.location.host}`, {
        auth: { token },
    });

    socket.on("connect", () => {
        console.log("✅ WebSocket connected");
    });

    socket.on("disconnect", () => {
        console.warn("⚠️ WebSocket disconnected");
    });

    // Update incoming requests when a new one arrives
    socket.on("new_friend_request", (data) => {
        populateInRequest("incoming-requests", data);
    });

    socket.on("new_outgoing_request", (data) => {
        populateOutRequest("outgoing-requests", data);
    });

    socket.on("notification", (data) => {
        console.log("🔔 New notification", data);
        // Optionally update badge or list
    });
}
