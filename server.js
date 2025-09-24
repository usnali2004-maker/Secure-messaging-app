let ws;
let myName = null;

function connect() {
  ws = new WebSocket("ws://localhost:9010");

  ws.onopen = () => log("✅ Connected to server");
  ws.onclose = () => log("❌ Disconnected from server");
  ws.onerror = err => {
    log("❌ WebSocket error: " + err.message);
    fireEvent("errorEvt");
  };

  ws.onmessage = evt => {
    const msg = JSON.parse(evt.data);
    handleMessage(msg);
  };
}

function handleMessage(msg) {
  switch (msg.type) {
    case "user-registered":
      log(`👤 Registered as ${msg.username}`);
      document.getElementById("status").textContent = `Logged in as ${msg.username}`;
      myName = msg.username;
      break;

    case "user-list":
      log("📋 Online users: " + msg.users.join(", "));
      break;

    case "message":
      log(`[${msg.from} → me] ${msg.text}`);
      fireEvent("messageSent");
      break;

    case "error":
      log(`⚠️ Error: ${msg.message}`);
      fireEvent("errorEvt");
      break;

    default:
      log("❓ Unknown message: " + JSON.stringify(msg));
  }
}

document.getElementById("btnRegister").onclick = () => {
  const username = document.getElementById("username").value;
  if (!username) return alert("Enter a username");
  ws.send(JSON.stringify({ type: "register", username }));
};

document.getElementById("btnList").onclick = () => {
  ws.send(JSON.stringify({ type: "list-users" }));
};

document.getElementById("btnSend").onclick = () => {
  const to = document.getElementById("recipient").value;
  const text = document.getElementById("message").value;
  if (!to || !text) return alert("Enter recipient and message");
  ws.send(JSON.stringify({ type: "message", to, text }));
  log(`[me → ${to}] ${text}`);
  fireEvent("messageSent");
};

function log(msg) {
  const logBox = document.getElementById("log");
  logBox.textContent += msg + "\n";
  logBox.scrollTop = logBox.scrollHeight;
}

function fireEvent(name) {
  window.dispatchEvent(new Event(name));
}

connect();
