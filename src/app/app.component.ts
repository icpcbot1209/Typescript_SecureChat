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


  status: number;


  constructor(private cryptoService: CryptoService, private chatService: ChatService) { 
    this.status = this.FIRST;
  }

  ngOnInit(): void { }

  ngOnDestroy(): void { 
  }

  handleCreate() { 
    let { pubkey, prikey } = this.cryptoService.generateKeyPair();
    let { roomId } = this.chatService.generateRoomId();

    alert(`roomId = ${roomId}\n\n\n${pubkey}`);
  }

  handleJoin() { 
    let txt = window.prompt('Please enter the code:', '');
    if (txt === null || txt === '') {
    } else {
      
    }
  }

}
