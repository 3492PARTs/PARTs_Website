import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-return-link',
  imports: [RouterLink, CommonModule],
  templateUrl: './return-link.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./return-link.component.scss'],
})
export class ReturnLinkComponent {
  @Input() RouterLink = '';
  @Output() FunctionCallBack = new EventEmitter();

  runFunction() {
    this.FunctionCallBack.emit();
  }
}
