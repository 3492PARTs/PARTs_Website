import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { BoxComponent } from '../../../shared/components/atoms/box/box.component';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-join',
    imports: [BoxComponent, RouterLink],
    templateUrl: './join.component.html',
    styleUrls: ['./join.component.scss']
})
export class JoinComponent implements AfterViewInit {

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
