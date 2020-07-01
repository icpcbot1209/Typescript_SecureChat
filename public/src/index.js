document.addEventListener('DOMContentLoaded', function (_event) {
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
    var a = 1;
    chatService.leaveRoom(data.roomId);
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
    console.log(data.strCreate);
    navigator.clipboard.writeText(data.strCreate);
};
var handleJoin = function () {
    appStatus = STATUS_JOIN;
};
var handleJoinConfirm = function (strCreate) {
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
var onReceiveMsg = function (msg) {
    if (data.sender === "A" && msg.sender === "B") {
        if (!data.bpubkey) {
            data.bpubkey = msg.msgContent;
            console.log("A received bpubkey from B: ", data.bpubkey);
            sendMsg("Hello");
            appStatus = (STATUS_CHAT);
        }
        else {
            var plain = cryptoService.decrypt(msg.msgContent, data.aprikey);
            if (!plain)
                return;
            arrChat.push({ sender: msg.sender, plain: plain });
        }
    }
    else if (data.sender === "B" && msg.sender === "A") {
        var plain = cryptoService.decrypt(msg.msgContent, data.bprikey);
        if (!plain)
            return;
        if (arrChat.length === 0)
            appStatus = (STATUS_CHAT);
        arrChat.push({ sender: msg.sender, plain: plain });
    }
};
var sendMsg = function (plain) {
    arrChat.push({ sender: data.sender, plain: plain });
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
        protocol: "ws"
    };
    var client = mqtt.connect("mqtts://test.mosquitto.org:8081", options);
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
    }
    chatService.enterRoom = enterRoom;
    function sendMsg(roomId, msg) {
        //use unsafe publish for non-ssl websockets
        client.publish(roomId, JSON.stringify(msg));
    }
    chatService.sendMsg = sendMsg;
    function leaveRoom(roomId) {
        client.unsubscribe(roomId);
    }
    chatService.leaveRoom = leaveRoom;
})(chatService || (chatService = {}));
