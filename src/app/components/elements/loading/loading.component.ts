import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralService } from '../../../services/general.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  loading = false;

  constructor(private gs: GeneralService) {
    this.gs.currentOutstandingCalls.subscribe(o => {
      this.loading = o > 0;

      const body = document.body;
      const html = document.documentElement;

      if (this.loading) {
        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
      }
      else {
        html.style.overflow = 'initial';
        body.style.overflow = 'initial';
      }
    });
  }

  ngOnInit(): void {
  }

}
