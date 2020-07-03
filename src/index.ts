document.addEventListener('DOMContentLoaded', (_event) => {
  setEventListeners();
  initAppData();
});

const showAlert = (txt: string, t:number) => {
  let eleAlert = document.getElementById('alert');
  eleAlert!.innerHTML = txt;
  setTimeout(() => { eleAlert!.innerHTML = ""; }, t);
}

const setEventListeners = () => { 
  let element = document.getElementById("chat-input");
  element!.addEventListener('keydown', (event) => {
    if (event.keyCode === 13) {
      let text = element!.value;
      sendMsg(text);
      element!.value = "";
    }
  });

  let element2 = document.getElementById("chat-send");
  element2!.addEventListener('click', (event) => {
    let text = element!.value;
    sendMsg(text);
    element!.value = "";
  });

  let eleMyKey = document.getElementById("offline-my-key"),
    eleOtherKey = document.getElementById('offline-other-key'),
    eleMyPlain = document.getElementById('offline-my-plain'),
    eleMyEncrypted = document.getElementById('offline-my-encrypted'),
    eleOtherPlain = document.getElementById('offline-other-plain'),
    eleOtherEncrypted = document.getElementById('offline-other-encrypted');

  let eleOfflineButton = document.getElementById("offline-mode-button");
  eleOfflineButton?.addEventListener('click', (event) => {
    startOfflineMode();
    let { pubkey, prikey } = cryptoService.generateKeyPair();
    data.apubkey = pubkey;
    data.aprikey = prikey;
  });

  let eleOfflineEndButton = document.getElementById("offline-end-button");
  eleOfflineEndButton?.addEventListener('click', (event) => {
    endOfflineMode();
    eleOtherKey!.getElementsByTagName('span')[0]!.innerHTML = "&#10068;";
    eleMyPlain!.getElementsByTagName('div')[0]!.innerHTML = "";
    eleMyEncrypted!.getElementsByTagName('div')[0]!.innerHTML = "";
    eleOtherPlain!.getElementsByTagName('div')[0]!.innerHTML = "";
    eleOtherEncrypted!.getElementsByTagName('div')[0]!.innerHTML = "";
  });

  eleMyKey!.addEventListener('click', (event) => { 
    navigator.clipboard.writeText(data.apubkey);
    showAlert("copied my key", 1000);
  });
  eleOtherKey!.addEventListener('click', (event) => {
    let txt = prompt("Public key from other.", data.bpubkey);
    if (txt && txt !== "") {
      data.bpubkey = txt;
      eleOtherKey!.getElementsByTagName('span')[0]!.innerHTML = "&#10004;";
    }
  });
  eleMyPlain!.addEventListener('click', (event) => {
    if (data.bpubkey === "") {
      alert("Other's key required.");
      return;
    }

    let txtBefore = eleMyPlain!.getElementsByTagName('div')[0]!.innerHTML;
    let txt = prompt("My Plain text", txtBefore);
    if (txt && txt !== "") {      
      eleMyPlain!.getElementsByTagName('div')[0]!.innerHTML = txt;
      let encrypted = cryptoService.encrypt(txt, data.bpubkey);
      eleMyEncrypted!.getElementsByTagName('div')[0]!.innerHTML = encrypted;
    }
  });
  eleMyEncrypted!.addEventListener('click', (event) => {
    let encrypted = eleMyEncrypted!.getElementsByTagName('div')[0]!.innerHTML;
    navigator.clipboard.writeText(encrypted);
    showAlert("copied my encrypted", 1000);
  });
  eleOtherPlain!.addEventListener('click', (event) => {
    let plain = eleOtherPlain!.getElementsByTagName('div')[0]!.innerHTML;
    navigator.clipboard.writeText(plain);
    showAlert("copied other's plain", 1000);
  });
  eleOtherEncrypted!.addEventListener('click', (event) => {
    let txtBefore = eleOtherEncrypted!.getElementsByTagName('div')[0]!.innerHTML;
    let txt = prompt("Other's encrypted text", txtBefore);
    if (txt && txt !== "") {
      eleOtherEncrypted!.getElementsByTagName('div')[0]!.innerHTML = txt;
      let plain = cryptoService.decrypt(txt, data.aprikey);
      if (plain === false) alert("Invalid");
      else eleOtherPlain!.getElementsByTagName('div')[0]!.innerHTML = plain;
    }
  });
};

const STATUS_FIRST = 0;
const STATUS_CREATE = 1;
const STATUS_JOIN = 2;
const STATUS_CHAT = 3;
const STATUS_OFFLINE = 4;

let data = {
  sender: "A",
  roomId: "",
  apubkey: "",
  aprikey: "",
  bpubkey: "",
  bprikey: "",
  strCreate: "",
};

var appStatus: number;
var arrChat = [];

const initAppData = () => {
  chatService.leaveRoom(data.roomId);
  chatService.doConnect("wss://test.mosquitto.org:8081", () => {

  }, () => {
    showAlert("Connection Error", 3000);
  });

  appStatus = STATUS_FIRST;
  arrChat = [];
  data = {
    sender: "A",
    roomId: "",
    apubkey: "",
    aprikey: "",
    bpubkey: "",
    bprikey: "",
    strCreate: "",
  };
};

const openSettingModal = () => { 
  showIt('setting-modal');
  document.getElementById('setting-serverurl')!.value = chatService.urlServer;
};

const closeSettingModal = () => { 
  hideIt('setting-modal');
};

const handleChangeServerURL = () => { 
  let title = document.getElementById('setting-serverurl')!.value;
  if (title === null || title === "") {
  } else {
    chatService.doConnect(title, () => { }, () => {
      showAlert("Connection Error", 3000);
    });
    hideIt('setting-modal');
  }
}

const startOfflineMode = () => { 
  appStatus = STATUS_OFFLINE;
  showIt("offline-page");
};

const endOfflineMode = () => { 
  initAppData();
  hideIt("offline-page");
};

const handleCreate = () => {
  let { pubkey, prikey } = cryptoService.generateKeyPair();
  let { roomId } = chatService.generateRoomId();

  data.roomId = roomId;
  data.sender = "A";
  data.apubkey = pubkey;
  data.aprikey = prikey;
  data.strCreate = JSON.stringify({ roomId, pubkey });

  appStatus = STATUS_CREATE;
  chatService.enterRoom(data.roomId, onReceiveMsg);

  showIt('create-modal'); 
  let element = document.getElementById("strCreate");
  element!.innerHTML = data.strCreate;
};

const showIt = (id: string) => {
  let element = document.getElementById(id);
  element!.style.display = "block";
};

const hideIt = (id: string) => {
  let element = document.getElementById(id);
  element!.style.display = "none";
};

const handleCopy = () => {
  navigator.clipboard.writeText(data.strCreate);
};

const handleCreateCancel = () => { 
  hideIt('create-modal');
  initAppData();
}


const handleJoin = () => {
  appStatus = STATUS_JOIN;
  showIt("join-modal");
};

const handleJoinConfirm = () => {
  let strCreate: string = document.getElementById("paste-panel")!.value;
  strCreate = strCreate.trim();
  if (strCreate === "") return;

  data.strCreate = strCreate;

  let json = JSON.parse(strCreate);
  let pair = cryptoService.generateKeyPair();

  data.sender = "B";
  data.roomId = json.roomId;
  data.apubkey = json.pubkey;
  data.bpubkey = pair.pubkey;
  data.bprikey = pair.prikey;

  chatService.enterRoom(data.roomId, onReceiveMsg);
  chatService.sendMsg(data.roomId, {
    sender: data.sender,
    msgContent: data.bpubkey,
  });
};

const handleJoinCancel = () => { 
  hideIt('join-modal');
  document.getElementById('paste-panel')!.value = '';
  initAppData();
}

const onReceiveMsg = (msg:Msg) => {
  if (data.sender === "A" && msg.sender === "B") {
    if (!data.bpubkey) {
      data.bpubkey = msg.msgContent;
      console.log("A received bpubkey from B: ", data.bpubkey);

      sendMsg("Hello");
      startChat();
    } else {
      let plain = cryptoService.decrypt(msg.msgContent, data.aprikey);
      if (!plain) return;

      addToChatList({ sender: msg.sender, plain });
    }
  } else if (data.sender === "B" && msg.sender === "A") {
    let plain = cryptoService.decrypt(msg.msgContent, data.bprikey);
    if (!plain) return;

    if (arrChat.length === 0) {
      document.getElementById("paste-panel")!.value = "";
      startChat();
    }

    addToChatList({ sender: msg.sender, plain });

  }
};


const startChat = () => {
  appStatus = STATUS_CHAT;
  hideIt("create-modal");
  hideIt("join-modal");
  showIt("chat-page");

  document.getElementById("chat-input")!.focus();
}

const endChat = () => {
  hideIt('chat-page');
  let list_element = document.getElementById('chat-list');
  list_element!.innerHTML = "";
  let input_element = document.getElementById('chat-input');
  input_element!.value = "";

  initAppData();
}

const addToChatList = (chat: Chat) => {
  if (chat.plain.trim() === "") return;
  arrChat.push(chat);
  let list_element = document.getElementById('chat-list');
  var node = document.createElement("DIV");
  var badge = document.createElement("DIV");
  var textnode = document.createTextNode(`${chat.sender}: ${chat.plain}`);
  badge.appendChild(textnode);
  node.appendChild(badge);
  list_element!.appendChild(node);
  
  node.className = (chat.sender === 'A') ? "chat-item-left" : "chat-item-right";
  badge.className = (chat.sender === 'A') ? "dont-break-out badge-left" : "dont-break-out badge-right";
  list_element!.scrollTop = list_element!.scrollHeight;

};

const sendMsg = (plain:string) => {
  addToChatList({ sender: data.sender, plain });
  let pubkey = data.sender === "A" ? data.bpubkey : data.apubkey;
  let msgContent = cryptoService.encrypt(plain, pubkey);
  chatService.sendMsg(data.roomId, { sender: data.sender, msgContent });
  // this.chatInput.setValue("");
};


namespace cryptoService {
  let crypt: any = null;

  export function generateKeyPair() {
    let keySize = 1024;
    crypt = new JSEncrypt({ default_key_size: keySize });
    crypt.getKey();
    let prikey = crypt.getPrivateKey();
    let pubkey = crypt.getPublicKey();

    return { prikey, pubkey };
  }

  export function encrypt(text:string, pubkey:string) {
    if (text.length > 117) {
      text = text.substr(0, 117);
    }

    crypt.setPublicKey(pubkey);
    let cypherText = crypt.encrypt(text);
    return cypherText;
  }

  export function decrypt(cypherText:string, prikey:string) {
    crypt.setPrivateKey(prikey);
    let text = crypt.decrypt(cypherText);

    if (text === null) {
      console.log("Decrypt failed");
      return null;
    }
    return text;
  }

}


namespace chatService { 

  export let urlServer = "wss://test.mosquitto.org:8081";
  let client = mqtt.connect(urlServer, options);
  let options = {
    protocol: "wss",
    // clientId uniquely identifies client
    // choose any string you wish
    // clientId: "b0908853",
  };

  export function doConnect(url: string, callback: Function, errHandler: Function){
    urlServer = url;

    client = mqtt.connect(urlServer, options);
    client.on("connect", function () {
      console.log("connected");
      callback();
    });

    client.on("error", function (err: any) {
      console.log('err');
      errHandler();
    });
    client.on('offline', function () {
      console.log('Offline');
      errHandler();
    });
  }

  export function generateRoomId() {
    let roomId = "" + Math.round((Math.random() + 1) * 100000);
    return { roomId };
  }

  export function enterRoom(roomId: string, onReceiveMsg: Function) {
    client.on("message", (topic:string, payload:object) => {
      let msg = JSON.parse(payload.toString());
      onReceiveMsg(msg);
    });

    // MQTT topic
    client.subscribe(roomId);
        console.log(roomId);
  }

  export function sendMsg(roomId:string, msg:object) {
    //use unsafe publish for non-ssl websockets
    client.publish(roomId, JSON.stringify(msg));
  }

  export function leaveRoom(roomId:string) {
    client.unsubscribe(roomId);
    client.end();
  }
}

interface Msg{
  msgContent: string;
  sender: string;
}

interface Chat { 
  plain: string;
  sender: string;
}
