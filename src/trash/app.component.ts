import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { IMqttMessage, MqttService } from 'ngx-mqtt';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy{
  title = 'secure-chat';
  private subscription: Subscription;
  topicname: any;
  msg: any;
  isConnected: boolean = false;
  @ViewChild('msglog', { static: true }) msglog: ElementRef;

  constructor(private _mqttService: MqttService) { }

  ngOnInit(): void { }

  ngOnDestroy(): void { 
    this._mqttService.unsafePublish(this.topicname, 'I am out!', {
      qos: 1,
      retain: true,
    });
    this.subscription.unsubscribe();
  }

  subscribeNewTopic(): void {
    console.log('inside subscribe new topic');
 
    this.subscription = this._mqttService.observe(this.topicname).subscribe((message: IMqttMessage) => { 
      console.log('message: ', message);
      this.msg = message.payload.toString();
      this.logMsg('Meassage: ' + message.payload.toString() + '<br> for topic: ' + message.topic);
    });

        console.log('OOOKKK');
        this._mqttService.unsafePublish(this.topicname, "I am in!", {
          qos: 1,
          retain: true,
        });
    this.logMsg('subscribed to topic: ' + this.topicname);
  }

  sendmsg(): void { 
    //use unsafe publish for non-ssl websockets
    this._mqttService.unsafePublish(this.topicname, this.msg, { qos: 1, retain: true });
    this.msg = '';
  }

  logMsg(message): void { 
    this.msglog.nativeElement.innerHTML += '<br><hr>' + message;
  }

  clear(): void { 
    this.msglog.nativeElement.innerHTML = '';
  }

}
