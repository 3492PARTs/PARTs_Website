import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2, ViewChild } from '@angular/core';
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
  private isDragging = false;
  points: { x: number, y: number }[] = [];
  private draggingPoint: { x: number, y: number } | null = null;

  @Input() set ImageUrl(s: string) {
    this.url = s;
    this.gs.triggerChange(() => this.adjustImage(), 5);

  }

  url = '';

  private resizeTimer: number | null | undefined;

  @Input() Svg = new Svg();
  @Output() SvgChange: EventEmitter<Svg> = new EventEmitter<Svg>();

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
    if (!this.isDragging) {
      this.isDrawing = true;
      this.addPoint(event.offsetX, event.offsetY);
    }
    else
      this.isDrawing = false;

  }

  handleMouseMove(event: MouseEvent) {
    if (this.isDrawing && false) {
      this.addPoint(event.offsetX, event.offsetY);
      this.draw();
    }
  }

  handleMouseUp() {
    if (!this.isDragging) {
      this.isDrawing = false;
      this.closePath();
      this.draw();
    }
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

    const pathBounds = this.myPath.nativeElement.getBBox();

    let svg = new Svg();
    svg.x = parseFloat((this.points[0].x / this.image.nativeElement.offsetWidth * 100).toFixed(2));
    svg.y = parseFloat((this.points[0].y / this.image.nativeElement.offsetHeight * 100).toFixed(2));
    svg.width = parseFloat((pathBounds.width / this.image.nativeElement.offsetWidth * 100).toFixed(2));
    svg.height = parseFloat((pathBounds.height / this.image.nativeElement.offsetHeight * 100).toFixed(2));
    svg.svg = this.createSvg();

    this.SvgChange.emit(svg);
  }

  closePath() {
    if (this.points.length > 2) {
      const firstPoint = this.points[0];
      const currentPath = this.myPath.nativeElement.getAttribute('d') || '';
      this.myPath.nativeElement.setAttribute('d', `${currentPath} L${firstPoint.x},${firstPoint.y} Z`);
    }
  }

  startDragging(point: { x: number, y: number }) {
    this.isDragging = true;
    this.isDrawing = false;
    this.draggingPoint = point;
  }

  dragPoint(event: MouseEvent) {
    if (this.draggingPoint) {
      this.draggingPoint.x = event.offsetX;
      this.draggingPoint.y = event.offsetY;
      this.draw();
    }
  }

  endDragging() {
    this.draggingPoint = null;
    this.isDragging = false;
  }

  private createSvg(): string {
    const pathBounds = this.myPath.nativeElement.getBBox();
    //const width = this.mySvg.nativeElement.clientWidth;
    //const height = this.mySvg.nativeElement.clientHeight;
    // const svg = this.mySvg.nativeElement.outerHTML; // Get the entire SVG content

    return `
      <svg width="${pathBounds.width}" height="${pathBounds.height}" viewBox="${pathBounds.x} ${pathBounds.y} ${pathBounds.width} ${pathBounds.height}" xmlns="http://www.w3.org/2000/svg">
        <path d="${this.myPath.nativeElement.getAttribute('d')}" fill="lightblue" stroke="black" />
      </svg>
    `;
  }

  exportSvg() {
    const svg = this.createSvg();

    console.log(svg.length);

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

export class Svg {
  svg = '';
  x = NaN;
  y = NaN;
  width = NaN;
  height = NaN;
}