import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const chars = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "h",
  "i",
  "j",
  "k",
  "l",
];

let roomName = "";

for (let i = 0; i < 8; i++) {
  roomName += chars[Math.round(Math.random() * 18)];
}

new QRCode(document.getElementById("qrcode"), roomName);

const socket = io("wss://qrmess-api.glitch.me/", {
  query: {
    id: roomName,
    temp: true,
  },
});

socket.on("message", (message) => {
  if (message.type == "info" && message.body == "user_joined") {
    window.location.href = "./chat.html?id=" + roomName;
  }
});
