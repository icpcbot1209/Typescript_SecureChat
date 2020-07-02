document.addEventListener('DOMContentLoaded', function (_event) {
    var element = document.getElementById("chat-input");
    element.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) {
            var text = element.value;
            sendMsg(text);
            element.value = "";
        }
    });
    var element2 = document.getElementById("chat-send");
    element2.addEventListener('click', function (event) {
        var text = element.value;
        sendMsg(text);
        element.value = "";
    });
    initAppData();
});
var STATUS_FIRST = 0;
var STATUS_CREATE = 1;
var STATUS_JOIN = 2;
var STATUS_CHAT = 3;
var data = {
    sender: "A",
    roomId: "",
    apubkey: "",
    aprikey: "",
    bpubkey: "",
    bprikey: "",
    strCreate: ""
};
var appStatus;
var arrChat = [];
var initAppData = function () {
    chatService.leaveRoom(data.roomId);
    appStatus = STATUS_FIRST;
    arrChat = [];
    data = {
        sender: "A",
        roomId: "",
        apubkey: "",
        aprikey: "",
        bpubkey: "",
        bprikey: "",
        strCreate: ""
    };
};
var handleCreate = function () {
    var _a = cryptoService.generateKeyPair(), pubkey = _a.pubkey, prikey = _a.prikey;
    var roomId = chatService.generateRoomId().roomId;
    data.roomId = roomId;
    data.sender = "A";
    data.apubkey = pubkey;
    data.aprikey = prikey;
    data.strCreate = JSON.stringify({ roomId: roomId, pubkey: pubkey });
    appStatus = STATUS_CREATE;
    chatService.enterRoom(data.roomId, onReceiveMsg);
    showIt('create-modal');
    var element = document.getElementById("strCreate");
    element.innerHTML = data.strCreate;
};
var showIt = function (id) {
    var element = document.getElementById(id);
    element.style.display = "block";
};
var hideIt = function (id) {
    var element = document.getElementById(id);
    element.style.display = "none";
};
var handleCopy = function () {
    navigator.clipboard.writeText(data.strCreate);
};
var handleCreateCancel = function () {
    hideIt('create-modal');
    initAppData();
};
var handleJoin = function () {
    appStatus = STATUS_JOIN;
    showIt("join-modal");
};
var handleJoinConfirm = function () {
    var strCreate = document.getElementById("paste-panel").value;
    strCreate = strCreate.trim();
    if (strCreate === "")
        return;
    data.strCreate = strCreate;
    var json = JSON.parse(strCreate);
    var pair = cryptoService.generateKeyPair();
    data.sender = "B";
    data.roomId = json.roomId;
    data.apubkey = json.pubkey;
    data.bpubkey = pair.pubkey;
    data.bprikey = pair.prikey;
    chatService.enterRoom(data.roomId, onReceiveMsg);
    chatService.sendMsg(data.roomId, {
        sender: data.sender,
        msgContent: data.bpubkey
    });
};
var handleJoinCancel = function () {
    hideIt('join-modal');
    document.getElementById('paste-panel').value = '';
    initAppData();
};
var onReceiveMsg = function (msg) {
    if (data.sender === "A" && msg.sender === "B") {
        if (!data.bpubkey) {
            data.bpubkey = msg.msgContent;
            console.log("A received bpubkey from B: ", data.bpubkey);
            sendMsg("Hello");
            startChat();
        }
        else {
            var plain = cryptoService.decrypt(msg.msgContent, data.aprikey);
            if (!plain)
                return;
            addToChatList({ sender: msg.sender, plain: plain });
        }
    }
    else if (data.sender === "B" && msg.sender === "A") {
        var plain = cryptoService.decrypt(msg.msgContent, data.bprikey);
        if (!plain)
            return;
        if (arrChat.length === 0) {
            document.getElementById("paste-panel").value = "";
            startChat();
        }
        addToChatList({ sender: msg.sender, plain: plain });
    }
};
var startChat = function () {
    appStatus = STATUS_CHAT;
    hideIt("create-modal");
    hideIt("join-modal");
    showIt("chat-page");
    document.getElementById("chat-input").focus();
};
var endChat = function () {
    hideIt('chat-page');
    var list_element = document.getElementById('chat-list');
    list_element.innerHTML = "";
    initAppData();
};
var addToChatList = function (chat) {
    if (chat.plain.trim() === "")
        return;
    arrChat.push(chat);
    var list_element = document.getElementById('chat-list');
    var node = document.createElement("DIV");
    var badge = document.createElement("DIV");
    var textnode = document.createTextNode(chat.sender + ": " + chat.plain);
    badge.appendChild(textnode);
    node.appendChild(badge);
    list_element.appendChild(node);
    node.className = (chat.sender === 'A') ? "chat-item-left" : "chat-item-right";
    badge.className = (chat.sender === 'A') ? "dont-break-out badge-left" : "dont-break-out badge-right";
    list_element.scrollTop = list_element.scrollHeight;
};
var sendMsg = function (plain) {
    addToChatList({ sender: data.sender, plain: plain });
    var pubkey = data.sender === "A" ? data.bpubkey : data.apubkey;
    var msgContent = cryptoService.encrypt(plain, pubkey);
    chatService.sendMsg(data.roomId, { sender: data.sender, msgContent: msgContent });
    // this.chatInput.setValue("");
};
var cryptoService;
(function (cryptoService) {
    var crypt = null;
    function generateKeyPair() {
        var keySize = 1024;
        crypt = new JSEncrypt({ default_key_size: keySize });
        crypt.getKey();
        var prikey = crypt.getPrivateKey();
        var pubkey = crypt.getPublicKey();
        return { prikey: prikey, pubkey: pubkey };
    }
    cryptoService.generateKeyPair = generateKeyPair;
    function encrypt(text, pubkey) {
        if (text.length > 117) {
            text = text.substr(0, 117);
        }
        crypt.setPublicKey(pubkey);
        var cypherText = crypt.encrypt(text);
        return cypherText;
    }
    cryptoService.encrypt = encrypt;
    function decrypt(cypherText, prikey) {
        crypt.setPrivateKey(prikey);
        var text = crypt.decrypt(cypherText);
        if (text === null) {
            console.log("Decrypt failed");
            return null;
        }
        return text;
    }
    cryptoService.decrypt = decrypt;
})(cryptoService || (cryptoService = {}));
var chatService;
(function (chatService) {
    var options = {
        protocol: "wss"
    };
    var client = mqtt.connect("wss://test.mosquitto.org:8081", options);
    function generateRoomId() {
        var roomId = "" + Math.round((Math.random() + 1) * 100000);
        return { roomId: roomId };
    }
    chatService.generateRoomId = generateRoomId;
    function enterRoom(roomId, onReceiveMsg) {
        client.on("message", function (topic, payload) {
            var msg = JSON.parse(payload.toString());
            onReceiveMsg(msg);
        });
        // MQTT topic
        client.subscribe(roomId);
        console.log(roomId);
    }
    chatService.enterRoom = enterRoom;
    function sendMsg(roomId, msg) {
        //use unsafe publish for non-ssl websockets
        client.publish(roomId, JSON.stringify(msg));
    }
    chatService.sendMsg = sendMsg;
    function leaveRoom(roomId) {
        client.unsubscribe(roomId);
        client = null;
        client = mqtt.connect("mqtts://test.mosquitto.org:8081", options);
    }
    chatService.leaveRoom = leaveRoom;
})(chatService || (chatService = {}));
