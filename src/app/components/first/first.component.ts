import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-first',
  templateUrl: './first.component.html',
  styleUrls: ['./first.component.css'],
})
export class FirstComponent implements OnInit {
  @Output() handleCreate: EventEmitter<any> = new EventEmitter();
  @Output() handleJoin: EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  onClickCreate() {
    this.handleCreate.emit();
  }

  onClickJoin() {
    this.handleJoin.emit();
  }
}
