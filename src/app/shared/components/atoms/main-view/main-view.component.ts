import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-main-view',
  standalone: true,
  templateUrl: './main-view.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./main-view.component.scss'],
})
export class MainViewComponent {}
