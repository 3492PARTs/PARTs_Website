import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-electrical',
  templateUrl: './electrical.component.html',
  styleUrls: ['./electrical.component.scss']
})
export class ElectricalComponent implements AfterViewInit {

  @ViewChild('thisJoinPic', { read: ElementRef, static: true }) pic!: ElementRef;

  constructor(private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    const header = document.getElementById('site-header');
    const height = header?.offsetHeight || 0;

    if (this.pic) {
      if (height > 0) this.renderer.setStyle(this.pic.nativeElement, 'height', 'calc(100vh - ' + height + 'px)');
      else this.renderer.setStyle(this.pic.nativeElement, 'height', '100vh');
    }
  }
}
