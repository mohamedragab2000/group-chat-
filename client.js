const websocket = new WebSocket("ws://localhost:8080");
let userInput;


window.onload = function() {
    userInput = prompt("Enter your name:");
    if (!userInput ) {
        userInput = "Guest_" + Math.floor(Math.random() * 1000);
    }

    document.title = `Chat - ${userInput}`;
};


websocket.onopen = function() {
    console.log("Connected to server");
    websocket.send(JSON.stringify({
        userInput: userInput,
        type: "join"
    }));
};


websocket.onmessage = function(event) {
    let messageData;

    if (event.data instanceof Blob) {
        event.data.text().then((text) => {
            try {
                messageData = JSON.parse(text);
                handleMessage(messageData);
            } catch (error) {
                console.error("Failed to parse message:", error);
            }
        }).catch((error) => {
            console.error("Failed to read blob as text:", error);
        });
    } else {
        try {
            messageData = JSON.parse(event.data);
            handleMessage(messageData);
        } catch (error) {
            console.error("Failed to parse message:", error);
        }
    }
};

function handleMessage(messageData) {
    console.log("Received message:", messageData);

    if (messageData.connected_users) {
        updateConnectedUsers(messageData.connected_users);
    }


    if (messageData.type === "join") {
        show_message("System", `📢 ${messageData.userInput} joined the chat`, 'system');
    } else if (messageData.type === "leave") {
        show_message("System", `👋 ${messageData.userInput} left the chat`, 'system');
    } else {
        const isSelf = messageData.messageCreator === userInput;
        const messageType = isSelf ? 'user' : 'server';
        show_message(messageData.messageCreator, messageData.message, messageType);
    }
}


function updateConnectedUsers(users) {
    const connectedUsersDropdown = document.getElementById("connected-users");
    connectedUsersDropdown.innerHTML = '';

    const header = document.createElement("li");
    header.innerHTML = `<div class="dropdown-header">Online Users (${users.length})</div>`;
    connectedUsersDropdown.appendChild(header);

    users.forEach(user => {
        const userItem = document.createElement("li");
        const userLink = document.createElement("a");
        userLink.className = "dropdown-item";
        userLink.href = "#";

        if (user === userInput) {
            userLink.innerHTML = `<strong>${user}</strong> (you)`;
        } else {
            userLink.textContent = user;
        }

        userItem.appendChild(userLink);
        connectedUsersDropdown.appendChild(userItem);
    });
}

websocket.onclose = function() {
    console.log("Connection closed");
    show_message("System", "Disconnected from server. Please refresh to reconnect.", 'system');
};


const messInput = document.getElementById("mess");
messInput.addEventListener("input", update_textField);

function update_textField() {
    const sendButton = document.getElementById("send");
    if (messInput.value.trim() === "") {
        sendButton.disabled = true;
        sendButton.classList.remove("btn-primary");
        sendButton.classList.add("btn-secondary");
    } else {
        sendButton.disabled = false;
        sendButton.classList.remove("btn-secondary");
        sendButton.classList.add("btn-primary");
    }
}


function send_message() {
    const messInput = document.getElementById("mess");
    const message = messInput.value.trim();

    if (message !== "") {
        const fullMessage = {
            messageCreator: userInput,
            message: message,
            type: "message"
        };

        websocket.send(JSON.stringify(fullMessage));
        messInput.value = "";
        update_textField();
    }
}


function show_message(messageCreator, message, type_mess) {
    const messBody = document.getElementById("mess-body");


    if (messageCreator === "System" && type_mess === "system") {
        const systemMsg = document.createElement("div");
        systemMsg.textContent = message;
        systemMsg.classList.add("system-message");
        messBody.appendChild(systemMsg);
        messBody.scrollTop = messBody.scrollHeight;
        return;
    }


    const newMessage = document.createElement("div");
    newMessage.classList.add(type_mess + "-message");

    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message-wrapper");

    const avatarPart = document.createElement("div");
    avatarPart.classList.add("avatar-part");
    const avatar = document.createElement("i");
    avatar.classList.add("fa", "fa-user", "avatar-style");
    avatarPart.appendChild(avatar);

    const messageContent = document.createElement("div");
    messageContent.classList.add("message-content");

    const messagePart = document.createElement("div");
    messagePart.classList.add("message-part");

    const username = document.createElement("div");
    username.classList.add("message-username");
    username.textContent = messageCreator;

    const messageText = document.createElement("div");
    messageText.classList.add("message-text");
    messageText.textContent = message;

    messagePart.appendChild(username);
    messagePart.appendChild(messageText);

    messageContent.appendChild(messagePart);

    messageWrapper.appendChild(avatarPart);
    messageWrapper.appendChild(messageContent);
    newMessage.appendChild(messageWrapper);

    messBody.appendChild(newMessage);
    messBody.scrollTop = messBody.scrollHeight;
}
