import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { BoxComponent } from '../../../atoms/box/box.component';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-impact',
    imports: [BoxComponent, RouterLink],
    templateUrl: './impact.component.html',
    styleUrls: ['./impact.component.scss']
})
export class ImpactComponent implements AfterViewInit {

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
