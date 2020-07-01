document.addEventListener('DOMContentLoaded', (_event) => {
  initAppData();
});

const STATUS_FIRST = 0;
const STATUS_CREATE = 1;
const STATUS_JOIN = 2;
const STATUS_CHAT = 3;

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
  let a = 1;

  chatService.leaveRoom(data.roomId);
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
  console.log(data.strCreate);
  navigator.clipboard.writeText(data.strCreate);
};

const handleJoin = () => {
  appStatus = STATUS_JOIN;
};

const handleJoinConfirm = (strCreate:string) => {
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


const onReceiveMsg = (msg:Msg) => {
  if (data.sender === "A" && msg.sender === "B") {
    if (!data.bpubkey) {
      data.bpubkey = msg.msgContent;
      console.log("A received bpubkey from B: ", data.bpubkey);

      sendMsg("Hello");
      appStatus = (STATUS_CHAT);
    } else {
      let plain = cryptoService.decrypt(msg.msgContent, data.aprikey);
      if (!plain) return;

      arrChat.push({ sender: msg.sender, plain });
    }
  } else if (data.sender === "B" && msg.sender === "A") {
    let plain = cryptoService.decrypt(msg.msgContent, data.bprikey);
    if (!plain) return;

    if (arrChat.length === 0) appStatus = (STATUS_CHAT);

    arrChat.push({ sender: msg.sender, plain });
  }
};

const sendMsg = (plain:string) => {
  arrChat.push({ sender: data.sender, plain });
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
  let options = {
    protocol: "ws",
    // clientId uniquely identifies client
    // choose any string you wish
    // clientId: "b0908853",
  };
  let client = mqtt.connect("mqtts://test.mosquitto.org:8081", options);

  export function generateRoomId() {
    let roomId = "" + Math.round((Math.random() + 1) * 100000);
    return { roomId };
  }

  export function enterRoom(roomId:string, onReceiveMsg: Function) {
    client.on("message", (topic:string, payload:object) => {
      let msg = JSON.parse(payload.toString());
      onReceiveMsg(msg);
    });

    // MQTT topic
    client.subscribe(roomId);
  }

  export function sendMsg(roomId:string, msg:object) {
    //use unsafe publish for non-ssl websockets
    client.publish(roomId, JSON.stringify(msg));
  }

  export function leaveRoom(roomId:string) {
    client.unsubscribe(roomId);
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
