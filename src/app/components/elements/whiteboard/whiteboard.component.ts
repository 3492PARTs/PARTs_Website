import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ButtonComponent } from "../../atoms/button/button.component";
import { GeneralService } from '../../../services/general.service';
import { FormElementGroupComponent } from "../../atoms/form-element-group/form-element-group.component";

@Component({
  selector: 'app-whiteboard',
  standalone: true,
  imports: [ButtonComponent, FormElementGroupComponent],
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


    this.ctx.lineCap = 'round'; // Use round line cap for smoother erasing
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.lineWidth;


    this.ctx.stroke();

    this.lastX = event.offsetX / this.scaleX;
    this.lastY = event.offsetY / this.scaleY;
  }

  onMouseUp() {
    this.isDrawing = false;
    // Save initial state of the canvas
    this.saveToUndoStack();
    this.emitImage();
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
      }

    };

    if (confirm)
      this.gs.triggerConfirm('Are you sure you want to clear the canvas?', fn);
    else
      fn();
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

      //this.canvasHeight = this.canvas.nativeElement.height;
      this.scaleX = this.canvas.nativeElement.clientWidth / this.canvasWidth;
      this.scaleY = this.canvas.nativeElement.clientHeight / this.canvasHeight;

      this.ctx.drawImage(img, 0, 0, this.canvasWidth, this.canvasHeight);

      // Save initial state of the canvas
      this.saveToUndoStack();
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
}
