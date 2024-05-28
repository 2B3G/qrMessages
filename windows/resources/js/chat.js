import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

const textInput = document.querySelector("textarea");

const socket = io("wss://qrmess-api.glitch.me/", {
  query: {
    id: roomName,
  },
});

let files = [];

socket.on("message", (message) => {
  if (message.type == "message") showMessage(message.body, "stranger");
  else if (message.type == "info") {
    switch (message.body) {
      case "file_upload":
        showFile(message.name, message.url, "stranger");
        break;
      case "user_disconnect":
        deleteFiles();
    }
  }
});

document.querySelector("#send").onclick = sendMessage;
document.querySelector("textarea").onkeydown = (e) => {
  if (e.key == "Enter" && e.ctrlKey) sendMessage();
};

function sendMessage() {
  const text = textInput.value;

  if (text.replaceAll(" ", "").length == 0) return (e.target.value = "");

  socket.emit("message", {
    type: "message",
    body: text,
  });

  showMessage(text, "user");
  textInput.value = "";
}

document.querySelector("#file-add").onclick = chooseFile;

function showMessage(text, who) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.classList.add(who);

  messageDiv.innerHTML = `
        <p>${text}</p>
    `;

  document.querySelector("#messages").appendChild(messageDiv);
}

function chooseFile() {
  const inp = document.createElement("input");
  inp.type = "file";
  inp.multiple = true;

  inp.onchange = (e) => sendFiles(e.target.files);

  inp.click();
  inp.remove();
}

async function sendFiles(f) {
  // start loading animation
  const loader = document.createElement("div");
  const uploadButton = document.querySelector("#file-add");
  uploadButton.querySelector("img").style.display = "none";

  loader.id = "loader";
  uploadButton.classList.add("loading");

  uploadButton.appendChild(loader);

  for (let i = 0; i < f.length; i++) {
    const fd = new FormData();
    fd.append("file", f[i]);

    const resp = await fetch("https://qrmess-api.glitch.me/upload", {
      method: "POST",
      body: fd,
    });

    if (resp.status != 200) return console.err("File upload error");

    const data = await resp.json();

    socket.emit("message", {
      type: "info",
      body: "file_upload",
      url: data.url,
      name: data.name,
    });

    showFile(data.name, data.url, "user");
  }

  // stop loading animation
  loader.remove();
  uploadButton.classList.remove("loading");
  uploadButton.querySelector("img").style.display = "inherit";
}

async function showFile(name, url, who) {
  const fileDiv = document.createElement("div");
  fileDiv.classList.add("message", "file", who);

  if (who == "user") {
    fileDiv.innerHTML = `
    <a>${name}</a>
    `;
  } else {
    fileDiv.innerHTML = `
    <a>${name}</a>
    <img src="icons/download.png" />
  `;
  }

  fileDiv.onclick = async (e) => {
    if (
      e.target.classList.contains("user") ||
      e.target.getAttribute("downloaded") == "true"
    )
      return;

    const downloadsPath = await Neutralino.os.getPath("downloads");

    let command = "";
    if (NL_OS === "Windows") {
      command = `curl -o ${downloadsPath + "/" + name} ${url}`;
    } else {
      command = `wget -O ${downloadsPath + "/" + name} ${url}`;
    }

    Neutralino.os
      .execCommand(command)
      .then(() => {
        e.target.querySelector("img").src = "/icons/checked.png";
      })
      .catch((err) => {
        console.error("Error downloading file:", err);
      });

    e.target.setAttribute("downloaded", "true");
  };

  document.querySelector("#messages").appendChild(fileDiv);
  files.push(name);
}

function deleteFiles() {
  if (files.length === 0) return;

  fetch("https://qrmess-api.glitch.me/delete", {
    method: "DELETE",
    body: JSON.stringify(files),
    headers: { "Content-Type": "application/json" },
  });

  document.querySelector("#toolbar").innerHTML = `
  <h1 id="disconnect-info" class="element">Recpient disconnected</h1>
  `;

  document.querySelectorAll(".file").forEach((element) => {
    element.style.pointerEvents = "none";
  });

  socket.disconnect();
}
