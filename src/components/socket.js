// src/socket.js
import { io } from "socket.io-client";

// const socket = io("https://videoconferencingbackend-xkva.onrender.com"); // use Render URL here

const socket = io("ttps://videoconferencingbackend-xkva.onrender.com", {
    transports: ["websocket"],
    reconnection: true,
  });

export default socket;
