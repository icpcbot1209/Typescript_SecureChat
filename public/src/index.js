document.addEventListener('DOMContentLoaded', function (_event) {
    setEventListeners();
    initAppData();
});
var showAlert = function (txt, t) {
    var eleAlert = document.getElementById('alert');
    eleAlert.innerHTML = txt;
    setTimeout(function () { eleAlert.innerHTML = ""; }, t);
};
var setEventListeners = function () {
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
    var eleMyKey = document.getElementById("offline-my-key"), eleOtherKey = document.getElementById('offline-other-key'), eleMyPlain = document.getElementById('offline-my-plain'), eleMyEncrypted = document.getElementById('offline-my-encrypted'), eleOtherPlain = document.getElementById('offline-other-plain'), eleOtherEncrypted = document.getElementById('offline-other-encrypted');
    var eleOfflineButton = document.getElementById("offline-mode-button");
    eleOfflineButton === null || eleOfflineButton === void 0 ? void 0 : eleOfflineButton.addEventListener('click', function (event) {
        startOfflineMode();
        var _a = cryptoService.generateKeyPair(), pubkey = _a.pubkey, prikey = _a.prikey;
        data.apubkey = pubkey;
        data.aprikey = prikey;
    });
    var eleOfflineEndButton = document.getElementById("offline-end-button");
    eleOfflineEndButton === null || eleOfflineEndButton === void 0 ? void 0 : eleOfflineEndButton.addEventListener('click', function (event) {
        endOfflineMode();
        eleOtherKey.getElementsByTagName('span')[0].innerHTML = "&#10068;";
        eleMyPlain.getElementsByTagName('div')[0].innerHTML = "";
        eleMyEncrypted.getElementsByTagName('div')[0].innerHTML = "";
        eleOtherPlain.getElementsByTagName('div')[0].innerHTML = "";
        eleOtherEncrypted.getElementsByTagName('div')[0].innerHTML = "";
    });
    eleMyKey.addEventListener('click', function (event) {
        navigator.clipboard.writeText(data.apubkey);
        showAlert("copied my key", 1000);
    });
    eleOtherKey.addEventListener('click', function (event) {
        var txt = prompt("Public key from other.", data.bpubkey);
        if (txt && txt !== "") {
            data.bpubkey = txt;
            eleOtherKey.getElementsByTagName('span')[0].innerHTML = "&#10004;";
        }
    });
    eleMyPlain.addEventListener('click', function (event) {
        if (data.bpubkey === "") {
            alert("Other's key required.");
            return;
        }
        var txtBefore = eleMyPlain.getElementsByTagName('div')[0].innerHTML;
        var txt = prompt("My Plain text", txtBefore);
        if (txt && txt !== "") {
            eleMyPlain.getElementsByTagName('div')[0].innerHTML = txt;
            var encrypted = cryptoService.encrypt(txt, data.bpubkey);
            eleMyEncrypted.getElementsByTagName('div')[0].innerHTML = encrypted;
        }
    });
    eleMyEncrypted.addEventListener('click', function (event) {
        var encrypted = eleMyEncrypted.getElementsByTagName('div')[0].innerHTML;
        navigator.clipboard.writeText(encrypted);
        showAlert("copied my encrypted", 1000);
    });
    eleOtherPlain.addEventListener('click', function (event) {
        var plain = eleOtherPlain.getElementsByTagName('div')[0].innerHTML;
        navigator.clipboard.writeText(plain);
        showAlert("copied other's plain", 1000);
    });
    eleOtherEncrypted.addEventListener('click', function (event) {
        var txtBefore = eleOtherEncrypted.getElementsByTagName('div')[0].innerHTML;
        var txt = prompt("Other's encrypted text", txtBefore);
        if (txt && txt !== "") {
            eleOtherEncrypted.getElementsByTagName('div')[0].innerHTML = txt;
            var plain = cryptoService.decrypt(txt, data.aprikey);
            if (plain === false)
                alert("Invalid");
            else
                eleOtherPlain.getElementsByTagName('div')[0].innerHTML = plain;
        }
    });
};
var STATUS_FIRST = 0;
var STATUS_CREATE = 1;
var STATUS_JOIN = 2;
var STATUS_CHAT = 3;
var STATUS_OFFLINE = 4;
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
var openSettingModal = function () {
    showIt('setting-modal');
    document.getElementById('setting-serverurl').value = chatService.urlServer;
};
var closeSettingModal = function () {
    hideIt('setting-modal');
};
var handleChangeServerURL = function () {
    var title = document.getElementById('setting-serverurl').value;
    if (title === null || title === "") {
    }
    else {
        chatService.changeUrlServer(title);
    }
};
var startOfflineMode = function () {
    appStatus = STATUS_OFFLINE;
    showIt("offline-page");
};
var endOfflineMode = function () {
    initAppData();
    hideIt("offline-page");
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
    var input_element = document.getElementById('chat-input');
    input_element.value = "";
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
    chatService.urlServer = "wss://test.mosquitto.org:8081";
    var client = mqtt.connect(chatService.urlServer, options);
    function changeUrlServer(url) {
        chatService.urlServer = url;
        client = mqtt.connect(chatService.urlServer, options);
    }
    chatService.changeUrlServer = changeUrlServer;
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
