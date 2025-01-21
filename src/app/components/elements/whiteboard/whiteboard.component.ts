import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

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
  height = 200;
  private currentColor = 'black';

  // Calculate canvas dimensions dynamically
  private canvasWidth = window.innerWidth;
  private canvasHeight = 0;
  private scaleX = 1;
  private scaleY = 1;

  @Input() set ImageUrl(s: string) {
    this.setImage(s);
  }

  private url = '';

  @Output() Image: EventEmitter<File> = new EventEmitter<File>();

  ngOnInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
  }

  selectColor(color: string) {
    this.currentColor = color;
  }

  onMouseDown(event: MouseEvent) {
    this.isDrawing = true;
    this.lastX = event.offsetX / this.scaleX;
    this.lastY = event.offsetY / this.scaleY;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDrawing) return;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    const x = event.offsetX / this.scaleX;
    const y = event.offsetY / this.scaleY;
    this.ctx.lineTo(x, y);
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.lastX = event.offsetX / this.scaleX;
    this.lastY = event.offsetY / this.scaleY;
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
    const file = this.dataURLtoFile(dataURL);
    this.Image.emit(file)
  }

  dataURLtoFile(dataURI: string): File {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    var ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], { type: mimeString });
    return new File([blob], "whiteboard.png");

  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    // Re-draw the background image
    this.setImage(this.url);
  }

  private setImage(s: string): void {
    // Load and draw background image from URL
    const img = new Image();
    img.src = s;
    img.crossOrigin = 'anonymous';
    this.url = s;

    img.onload = () => {
      // Calculate canvas height to maintain aspect ratio
      this.canvasWidth = this.canvas.nativeElement.width;

      this.canvasHeight = (img.height / img.width) * this.canvasWidth;
      this.canvas.nativeElement.height = this.canvasHeight;
      //this.height = this.canvasHeight

      //this.canvasHeight = this.canvas.nativeElement.height;
      this.scaleX = this.canvas.nativeElement.clientWidth / this.canvasWidth;
      this.scaleY = this.canvas.nativeElement.clientHeight / this.canvasHeight;

      this.ctx.drawImage(img, 0, 0, this.canvasWidth, this.canvasHeight);
    };
  }
}
