import { Component, OnInit, OnDestroy } from '@angular/core';

import { CryptoService } from './services/crypto.service';
import { ChatService } from './services/chat.service';

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


  constructor(private cryptoService: CryptoService, private chatService: ChatService) { 
    this.status = this.FIRST;
  }

  ngOnInit(): void { }

  ngOnDestroy(): void { 
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


  onReceiveMsg(msg) {
    if (this.sender==="A" && msg.sender==="B") {
      let plain = this.cryptoService.decrypt(msg.msgContent, this.aprikey);
      if (!plain) return;

      if (!this.bpubkey) {
        this.bpubkey = plain;
        console.log('A received bpubkey from B: ', this.bpubkey);

        let msgContent = this.cryptoService.encrypt("Welcome", this.bpubkey);
        this.chatService.sendMsg(this.roomId, { sender: this.sender, msgContent });

        this.status = this.CHAT;
        return;
      }
      
    }
    
    if(this.sender==="B" && msg.sender==="A") {
      let plain = this.cryptoService.decrypt(msg.msgContent, this.bprikey);
      if (!plain) return;

    }
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

      let msgContent = this.cryptoService.encrypt(this.bpubkey, this.apubkey);
      let msg = { sender:this.sender, msgContent };

      this.chatService.sendMsg(this.roomId, msg);
    }
  }

}
