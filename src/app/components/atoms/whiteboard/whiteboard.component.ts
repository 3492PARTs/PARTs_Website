import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ButtonComponent } from "../button/button.component";
import { GeneralService } from '../../../services/general.service';
import { FormElementGroupComponent } from "../form-element-group/form-element-group.component";
import { CommonModule } from '@angular/common';
import { fromEvent, map, merge, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-whiteboard',
  standalone: true,
  imports: [ButtonComponent, FormElementGroupComponent, CommonModule],
  templateUrl: './whiteboard.component.html',
  styleUrl: './whiteboard.component.scss'
})
export class WhiteboardComponent implements OnInit {

  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX: number = 0;
  private lastY: number = 0;
  private lineWidth = 2;
  width = 500;
  height = 200;
  currentColor = '';

  // Calculate canvas dimensions dynamically
  private canvasWidth = window.innerWidth;
  private canvasHeight = 0;
  private scaleX = 1;
  private scaleY = 1;

  @Input() StampOptions: string[] = [];

  stampText = '';
  boxShadow = '0px 0px 0px 0.2rem rgba(104, 104, 104, 0.5)';

  @Input() set ImageUrl(s: string) {
    this.setImage(s);
  }

  private url = '';

  @Input()
  set Image(f: File | undefined) {
    if (!f) {
      this.clearCanvas(false);
    }
  }
  @Output() ImageChange: EventEmitter<File> = new EventEmitter<File>();

  // For undo/redo functionality
  private undoStack: ImageData[] = [];
  private redoStack: ImageData[] = [];
  private currentStep = 0;

  constructor(private gs: GeneralService) { }

  ngOnInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d', { willReadFrequently: true })!;
  }

  selectColor(color: string) {
    if (this.currentColor !== color)
      this.currentColor = color;
    else
      this.currentColor = '';
  }

  onCanvasClick(event: MouseEvent) {
    this.stamp(event);
  }

  onMouseDown(event: MouseEvent) {
    if (this.currentColor.length > 0) {
      this.isDrawing = true;
      this.lastX = event.offsetX / this.scaleX;
      this.lastY = event.offsetY / this.scaleY;
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.currentColor.length > 0) {
      if (!this.isDrawing) return;

      const [x, y] = this.getCoordinates(event);
      this.draw(x, y);

    }
  }

  onMouseUp() {
    if (this.currentColor.length > 0) {
      this.isDrawing = false;

      this.saveToUndoStack();
      this.emitImage();
    }
  }

  onTouchStart(event: TouchEvent) {
    if (this.currentColor.length > 0) {
      event.preventDefault(); // Prevent default browser behavior
      const [x, y] = this.getCoordinates(event);
      this.isDrawing = true;
      this.lastX = x;
      this.lastY = y;
      this.stamp(event);
    }
  }

  onTouchMove(event: TouchEvent) {
    if (this.currentColor.length > 0) {
      event.preventDefault(); // Prevent default browser behavior
      const [x, y] = this.getCoordinates(event);
      this.draw(x, y);
    }
  }

  onTouchEnd(event: TouchEvent) {
    if (this.currentColor.length > 0) {
      event.preventDefault(); // Prevent default browser behavior
      this.isDrawing = false;

      this.saveToUndoStack();
      this.emitImage();
    }
  }

  private getCoordinates(event: MouseEvent | TouchEvent): [number, number] {
    this.setScale();

    if (event instanceof MouseEvent) {
      return [event.offsetX / this.scaleX, event.offsetY / this.scaleY];
    } else {
      const touch = event.touches[0];
      const rect = this.canvas.nativeElement.getBoundingClientRect();
      return [(touch.clientX - rect.left) / this.scaleX, (touch.clientY - rect.top) / this.scaleY];
    }
  }

  private draw(x: number, y: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);

    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.lineWidth;

    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }

  private stamp(event: MouseEvent | TouchEvent): void {
    if (this.currentColor.length > 0 && this.stampText.length > 0) {
      //const rect = this.canvas.nativeElement.getBoundingClientRect();
      //const x = (event.clientX - rect.left) / this.scaleX;
      //const y = (event.clientY - rect.top) / this.scaleY;

      const [x, y] = this.getCoordinates(event)

      if (this.stampText.length > 0) {
        // Get text dimensions
        this.ctx.font = '20px Arial';
        const textMetrics = this.ctx.measureText(this.stampText);
        const textWidth = textMetrics.width;
        const textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

        // Calculate box coordinates
        const boxX = x - 5;
        const boxY = y - 20;
        const boxWidth = textWidth + 10;
        const boxHeight = textHeight + 10;

        // Draw the box
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Draw the text with a black border
        const border = 2;
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(this.stampText, x - border, y - border); // Offset by border pixel for shadow
        this.ctx.fillText(this.stampText, x + border, y - border);
        this.ctx.fillText(this.stampText, x - border, y + border);
        this.ctx.fillText(this.stampText, x + border, y + border);

        // Draw the text
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(this.stampText, x, y);
      }
    }
  }

  emitImage() {
    const dataURL = this.canvas.nativeElement.toDataURL('image/png');
    // Download or upload the dataURL to your server
    // Example:
    // window.open(dataURL, '_blank'); 
    // or send dataURL to a backend API for saving

    // This is a simplified example. You'll likely need to handle 
    // image saving and uploading more robustly in a real-world application.
    const file = this.dataURLtoFile(dataURL);
    this.ImageChange.emit(file)
  }

  private dataURLtoFile(dataURI: string): File {
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
    return new File([blob], "whiteboard.png", { type: mimeString, });

  }

  clearCanvas(confirm = true) {
    const fn = () => {
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        // Re-draw the background image
        this.setImage(this.url);
        this.currentColor = '';
        this.stampText = '';
      }

    };

    if (confirm)
      this.gs.triggerConfirm('Are you sure you want to clear the canvas?', fn);
    else
      fn();
  }

  private setScale(): void {
    //this.canvasHeight = this.canvas.nativeElement.height;
    this.scaleX = this.canvas.nativeElement.clientWidth / this.canvasWidth;
    this.scaleY = this.canvas.nativeElement.clientHeight / this.canvasHeight;
  }

  private setImage(s: string): void {
    this.undoStack = []; // Clear undo/redo stacks
    this.redoStack = [];
    this.currentStep = 0;

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

      this.setScale();

      this.ctx.drawImage(img, 0, 0, this.canvasWidth, this.canvasHeight);

      // Save initial state of the canvas
      this.saveToUndoStack();

      /*
      // Handle both mouse and touch events
      const mouseMove$ = fromEvent<MouseEvent>(this.canvas.nativeElement, 'mousemove');
      const mouseUp$ = fromEvent<MouseEvent>(this.canvas.nativeElement, 'mouseup');
      const mouseDown$ = fromEvent<MouseEvent>(this.canvas.nativeElement, 'mousedown');

      const touchMove$ = fromEvent<TouchEvent>(this.canvas.nativeElement, 'touchmove');
      const touchEnd$ = fromEvent<TouchEvent>(this.canvas.nativeElement, 'touchend');
      const touchStart$ = fromEvent<TouchEvent>(this.canvas.nativeElement, 'touchstart');

      merge(mouseDown$, touchStart$)
        .pipe(
          switchMap(() => {
            this.isDrawing = true;
            return merge(mouseMove$, touchMove$)
              .pipe(
                map((event: MouseEvent | TouchEvent) => {
                  return this.getCoordinates(event);
                }),
                takeUntil(merge(mouseUp$, touchEnd$))
              );
          })
        )
        .subscribe(([x, y]) => {
          this.draw(x, y);
        });
        */
    };
  }

  saveToUndoStack() {
    const canvasData = this.canvas.nativeElement.toDataURL();
    const image = new Image();
    image.src = canvasData;

    image.onload = () => {
      this.undoStack.push(this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight));
      this.redoStack = []; // Clear redo stack when a new action is performed
      this.currentStep = this.undoStack.length - 1;
    };
  }

  undo() {
    if (this.currentStep > 0) {
      this.redoStack.push(this.undoStack.pop()!);
      this.currentStep--;
      this.ctx.putImageData(this.undoStack[this.currentStep], 0, 0);
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      this.undoStack.push(this.redoStack.pop()!);
      this.currentStep++;
      this.ctx.putImageData(this.undoStack[this.currentStep], 0, 0);
    }
  }

  toggleStampText(s: string): void {
    if (this.stampText.length <= 0)
      this.stampText = s;
    else if (this.stampText !== s)
      this.stampText = s;
    else
      this.stampText = '';
  }
}
