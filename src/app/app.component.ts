import { Component, OnInit, OnDestroy } from '@angular/core';

import { CryptoService } from './services/crypto.service';
import { ChatService } from './services/chat.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy{

  FIRST = 0;
  SECOND_A = 1;
  CHAT = 3;
  status: number;

  sender = "A";
  roomId = "";
  apubkey = null;
  aprikey = null;
  bpubkey = null;
  bprikey = null;

  strSecondA = "";

  arrChat = [];

  chatInput = new FormControl('');

  constructor(private cryptoService: CryptoService, private chatService: ChatService) { 
  }
  ngOnInit(): void {
    this.initApp();
  }
  ngOnDestroy(): void { 
  }

  initApp() {
    this.status = this.FIRST;
    this.apubkey = null;
    this.aprikey = null;
    this.bpubkey = null;
    this.bprikey = null;
    this.arrChat = [];
  }

  handleCreate() { 
    let { pubkey, prikey } = this.cryptoService.generateKeyPair();
    let { roomId } = this.chatService.generateRoomId();

    this.roomId = roomId;
    this.sender = "A";
    this.apubkey = pubkey;
    this.aprikey = prikey;
    this.strSecondA = JSON.stringify({ roomId, pubkey });

    this.status = this.SECOND_A;

    this.chatService.enterRoom(this.roomId, this.onReceiveMsg.bind(this));


  }

  handleJoin() { 
    let txt = window.prompt('Please enter the code:', '');
    if (txt === null || txt === '') {
    } else {
      this.sender = "B";

      let json = JSON.parse(txt);    
      this.roomId = json.roomId;
      this.apubkey = json.pubkey;

      this.chatService.enterRoom(this.roomId, this.onReceiveMsg.bind(this));

      let pair = this.cryptoService.generateKeyPair();
      this.bpubkey = pair.pubkey;
      this.bprikey = pair.prikey;

      let msgContent = this.bpubkey;
      let msg = { sender:this.sender, msgContent };

      this.chatService.sendMsg(this.roomId, msg);
    }
  }



  onReceiveMsg(msg) {
    if (this.sender === "A" && msg.sender === "B") {
      if (!this.bpubkey) {
        this.bpubkey = msg.msgContent;
        console.log('A received bpubkey from B: ', this.bpubkey);

        this.sendMsg("Hello.");
        this.status = this.CHAT;
        return;
      }

      let plain = this.cryptoService.decrypt(msg.msgContent, this.aprikey);
      if (!plain) return;

      this.arrChat.push({ sender: msg.sender, plain });

    } else if (this.sender === "B" && msg.sender === "A") {
      let plain = this.cryptoService.decrypt(msg.msgContent, this.bprikey);
      if (!plain) return;
      
      if(this.arrChat.length === 0) this.status = this.CHAT;

      this.arrChat.push({ sender: msg.sender, plain });
    }
  }


  sendMsg(plain) {
    this.arrChat.push({ sender: this.sender, plain });

    let pubkey = (this.sender === "A") ? this.bpubkey : this.apubkey;
    let msgContent = this.cryptoService.encrypt(plain, pubkey);
    this.chatService.sendMsg(this.roomId, { sender: this.sender, msgContent });
    this.chatInput.setValue("");
  }

}
