import { Component, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'app-seconda',
  templateUrl: './seconda.component.html',
  styleUrls: ['./seconda.component.css']
})
export class SecondaComponent implements OnInit {
  @Input() strSecondA;

  constructor() { }

  ngOnInit(): void {

  }

  async onClickCopy() {
    // var copyText = document.getElementById("myInput");
    // copyText.select();
    // copyText.setSelectionRange(0, 99999)
    // document.execCommand("copy");
    // alert("Copied the text: " + copyText.value);
    await navigator.clipboard.writeText(this.strSecondA);
    alert('copied');
  }

}
