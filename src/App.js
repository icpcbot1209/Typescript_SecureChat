import React, { useState, useEffect, useRef } from 'react';
import "./App.css";

import { First } from "./components/First";
import { PageCreate } from "./components/PageCreate";
import { PageJoin } from './components/PageJoin';
import { PageChat } from "./components/PageChat";

import * as cryptoService from './funcs/crypto';
import * as chatService from './funcs/chat';

const STATUS_FIRST = 0;
const STATUS_CREATE = 1;
const STATUS_JOIN = 2;
const STATUS_CHAT = 3;

let data = {
  sender: "A",
  roomId: "",
  apubkey: null,
  aprikey: null,
  bpubkey: null,
  bprikey: null,
  strCreate: "",
};

function App() {
  const [status, setStatus] = useState(STATUS_FIRST);
  const [arrChat, setArrChat] = useState([]);

  useEffect(() => {
    initAppData();
    return () => { 
      chatService.leaveRoom(data.roomId);
    }
  }, []);

  const initAppData = () => {
    setStatus(STATUS_FIRST);
    setArrChat([]);
    data = {
      sender: "A",
      roomId: "",
      apubkey: null,
      aprikey: null,
      bpubkey: null,
      bprikey: null,
      strCreate: ""
    };

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

    setStatus(STATUS_CREATE);
    chatService.enterRoom(data.roomId, onReceiveMsg);
  };
  
  const handleCopy = async (strCreate) => {
    await navigator.clipboard.writeText(strCreate);
  };

  const handleJoin = () => {
    setStatus(STATUS_JOIN);
  };

  const handleJoinConfirm = (strCreate) => {
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
    
  }


  const onReceiveMsg = (msg) => {
    if (data.sender === "A" && msg.sender === "B") {
      if (!data.bpubkey) {
        data.bpubkey = msg.msgContent;
        console.log('A received bpubkey from B: ', data.bpubkey);

        sendMsg("Hello.");
        setStatus(STATUS_CHAT);
      } else { 
        let plain = cryptoService.decrypt(msg.msgContent, data.aprikey);
        if (!plain) return;
        setArrChat((arrChat) => [...arrChat, { sender: msg.sender, plain }]);
      }

    } else if (data.sender === "B" && msg.sender === "A") {
      let plain = cryptoService.decrypt(msg.msgContent, data.bprikey);
      if (!plain) return;
      
      if(arrChat.length === 0) setStatus(STATUS_CHAT);

      setArrChat((arrChat) => [...arrChat, { sender: msg.sender, plain }]);
    }
  }

  const sendMsg = (plain) => {
    console.log(plain);
    setArrChat((arrChat)=>[...arrChat, { sender: data.sender, plain }]);

    let pubkey = (data.sender === "A") ? data.bpubkey : data.apubkey;
    let msgContent = cryptoService.encrypt(plain, pubkey);
    chatService.sendMsg(data.roomId, { sender: data.sender, msgContent });
    // this.chatInput.setValue("");
  }

  return (
    <div className="app-container">
      {status === STATUS_FIRST && (
        <First handleCreate={handleCreate} handleJoin={handleJoin} />
      )}
      {status === STATUS_CREATE && (
        <PageCreate
          strCreate={data.strCreate}
          handleCopy={handleCopy}
          handleClose={initAppData}
        />
      )}
      {status === STATUS_JOIN && (
        <PageJoin
          strCreate={data.strCreate}
          handleJoinConfirm={handleJoinConfirm}
          handleClose={initAppData}
        />
      )}
      {status === STATUS_CHAT && (
        <PageChat
          arrChat={arrChat}
          handleSend={sendMsg}
          handleClose={initAppData}
        />
      )}
    </div>
  );
}

export default App;
