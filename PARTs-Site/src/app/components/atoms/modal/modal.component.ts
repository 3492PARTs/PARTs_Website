import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  @Input() ButtonType: string = "";
  @Input() ButtonText: string = "";
  @Input() Title: string = "";

  visible = false;

  constructor() { }

  ngOnInit() {
  }

  open() {
    this.visible = true;
  }

  close() {
    this.visible = false;
  }
}
