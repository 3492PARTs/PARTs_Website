import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    const appHeader = document.getElementById('site-header') || new HTMLElement();
    const slider = document.getElementById('cssSlider') || new HTMLElement();
    slider.style.maxHeight = 'calc( 100vh - ' + (appHeader.offsetHeight || 0) + 'px)';
  }

}
