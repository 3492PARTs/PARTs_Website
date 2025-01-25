import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-draw-shape',
  imports: [],
  templateUrl: './draw-shape.component.html',
  styleUrl: './draw-shape.component.scss'
})
export class DrawShapeComponent {
  @ViewChild('myCanvas', { static: true }) myCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private points: { x: number, y: number }[] = [];

  ngOnInit() {
    this.ctx = this.myCanvas.nativeElement.getContext('2d')!;
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

  addPoint(x: number, y: number) {
    this.points.push({ x, y });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.myCanvas.nativeElement.width, this.myCanvas.nativeElement.height);
    this.ctx.beginPath();
    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      this.ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    this.ctx.stroke();
  }

  closePath() {
    if (this.points.length > 2) {
      this.ctx.lineTo(this.points[0].x, this.points[0].y);
      this.ctx.closePath();
      this.ctx.stroke();
    }
  }

  exportSvg() {
    const svg = this.createSvg();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'shape.svg';
    link.click();

    URL.revokeObjectURL(url);
  }

  createSvg(): string {
    const pointsStr = this.points.map(p => `${p.x},${p.y}`).join(' ');
    return `
      <svg width="${this.myCanvas.nativeElement.width}" height="${this.myCanvas.nativeElement.height}" xmlns="http://www.w3.org/2000/svg">
        <polygon points="${pointsStr}" fill="none" stroke="black" />
      </svg>
    `;
  }
}
