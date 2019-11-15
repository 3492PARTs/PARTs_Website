import { Component, OnInit, ViewChild, ElementRef, Input, HostListener } from '@angular/core';
//import * as $ from 'jquery';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {
  @ViewChild('thisSideNav', { read: ElementRef, static: true }) sideNav: ElementRef;

  @Input() Width: string;

  constructor() { }

  ngOnInit() {
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event) {
    /*const windowTop = $(window).scrollTop();

    if (this.sideNav.nativeElement.offsetTop < windowTop + 16) {
      this.sideNav.nativeElement.classList.add('sticky');
    } else {
      this.sideNav.nativeElement.classList.remove('sticky');
    }*/

  }

}
