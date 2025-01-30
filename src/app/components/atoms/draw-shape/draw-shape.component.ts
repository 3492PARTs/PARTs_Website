import { AfterViewInit, Component, ElementRef, HostListener, Input, Renderer2, ViewChild } from '@angular/core';
import { GeneralService } from '../../../services/general.service';

@Component({
  selector: 'app-draw-shape',
  imports: [],
  templateUrl: './draw-shape.component.html',
  styleUrl: './draw-shape.component.scss'
})
export class DrawShapeComponent implements AfterViewInit {
  @ViewChild('mySvg', { static: false }) mySvg!: ElementRef<SVGSVGElement>;
  @ViewChild('myPath', { static: false }) myPath!: ElementRef<SVGPathElement>;
  @ViewChild('backgroundImage', { static: false }) image!: ElementRef<HTMLImageElement>; // For image

  private isDrawing = false;
  private points: { x: number, y: number }[] = [];

  @Input() set ImageUrl(s: string) {
    this.url = s;
    this.gs.triggerChange(() => this.adjustImage(), 5);

  }

  url = '';

  private resizeTimer: number | null | undefined;

  constructor(private renderer: Renderer2, private gs: GeneralService) { }

  ngAfterViewInit() {
    // It's crucial to get the SVG and path elements after the view is initialized.
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.resizeTimer != null) {
      window.clearTimeout(this.resizeTimer);
    }

    this.resizeTimer = window.setTimeout(() => {
      this.adjustImage();
    }, 200);
  }


  handleMouseDown(event: MouseEvent) {
    this.isDrawing = true;
    this.addPoint(event.offsetX, event.offsetY);
  }

  handleMouseMove(event: MouseEvent) {
    if (this.isDrawing) {
      this.addPoint(event.offsetX, event.offsetY);
      this.draw();
    }
  }

  handleMouseUp() {
    this.isDrawing = false;
    this.closePath();
  }

  handleClick(event: MouseEvent) {
    // Check if the click hit the path element.
    if (event.target === this.myPath.nativeElement) {
      console.log('Shape Tapped!');
    }
  }


  addPoint(x: number, y: number) {
    this.points.push({ x, y });
  }

  draw() {
    const pathData = this.points.map((p, i) => {
      if (i === 0) {
        return `M${p.x},${p.y}`;
      } else {
        return `L${p.x},${p.y}`;
      }
    }).join(' ');
    this.myPath.nativeElement.setAttribute('d', pathData);
  }

  closePath() {
    if (this.points.length > 2) {
      const firstPoint = this.points[0];
      const currentPath = this.myPath.nativeElement.getAttribute('d') || '';
      this.myPath.nativeElement.setAttribute('d', `${currentPath} L${firstPoint.x},${firstPoint.y} Z`);
    }
  }


  exportSvg() {
    const width = this.mySvg.nativeElement.clientWidth;
    const height = this.mySvg.nativeElement.clientHeight;
    // const svg = this.mySvg.nativeElement.outerHTML; // Get the entire SVG content

    const svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <path d="${this.myPath.nativeElement.getAttribute('d')}" fill="lightblue" stroke="black" />
      </svg>
    `;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'shape.svg';
    link.click();

    URL.revokeObjectURL(url);
  }

  adjustImage(): void {
    if (this.image) {
      if (window.innerWidth > window.innerHeight) {
        this.renderer.setStyle(this.image.nativeElement, 'width', 'auto');
        this.renderer.setStyle(this.image.nativeElement, 'height', '70vh');
      }
      else {
        this.renderer.setStyle(this.image.nativeElement, 'width', '100%');
        this.renderer.setStyle(this.image.nativeElement, 'height', 'auto');
      }
    }
  }
}
