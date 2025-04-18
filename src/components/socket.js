// src/socket.js
import { io } from "socket.io-client";

const socket = io("https://videoconferencingbackend-xkva.onrender.com"); // use Render URL here

export default socket;
