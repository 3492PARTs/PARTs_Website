import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-whiteboard',
  standalone: true,
  imports: [],
  templateUrl: './whiteboard.component.html',
  styleUrl: './whiteboard.component.scss'
})
export class WhiteboardComponent implements OnInit {

  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX: number = 0;
  private lastY: number = 0;
  width = 500;
  height = 300;
  private currentColor = 'black';

  ngOnInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
  }

  selectColor(color: string) {
    this.currentColor = color;
  }

  onMouseDown(event: MouseEvent) {
    this.isDrawing = true;
    this.lastX = event.offsetX;
    this.lastY = event.offsetY;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDrawing) return;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(event.offsetX, event.offsetY);
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.lastX = event.offsetX;
    this.lastY = event.offsetY;
  }

  onMouseUp() {
    this.isDrawing = false;
  }

  saveImage() {
    const dataURL = this.canvas.nativeElement.toDataURL('image/png');
    // Download or upload the dataURL to your server
    // Example:
    // window.open(dataURL, '_blank'); 
    // or send dataURL to a backend API for saving

    // This is a simplified example. You'll likely need to handle 
    // image saving and uploading more robustly in a real-world application.
  }
}
