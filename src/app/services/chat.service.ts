import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { IMqttMessage, MqttService } from 'ngx-mqtt';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private _mqttService: MqttService) { }
  roomId = 111111;
  generateRoomId() {
    this.roomId = Math.round((Math.random() + 1) * 100000);
    return { roomId:this.roomId };
  }
}
