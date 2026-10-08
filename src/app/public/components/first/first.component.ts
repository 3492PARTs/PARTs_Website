import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BoxComponent } from '@app/shared/components/atoms/box/box.component';

@Component({
  selector: 'app-first',
  imports: [BoxComponent],
  templateUrl: './first.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./first.component.scss'],
})
export class FirstComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
