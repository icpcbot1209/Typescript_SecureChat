import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { IMqttMessage, MqttService } from 'ngx-mqtt';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private _mqttService: MqttService) { }
  private subscription: Subscription;

  generateRoomId() {
    let roomId = "" + Math.round((Math.random() + 1) * 100000);
    return { roomId };
  }

  enterRoom(roomId, onReceiveMsg) {
    this.subscription = this._mqttService.observe(roomId).subscribe((message: IMqttMessage) => { 
      let msg = JSON.parse(message.payload.toString());
      onReceiveMsg(msg);
    });
  }

  sendMsg(roomId, msg) {
    //use unsafe publish for non-ssl websockets
    this._mqttService.unsafePublish(roomId, JSON.stringify(msg), { qos: 1, retain: true });
  }


}
