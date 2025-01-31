import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { GeneralService } from '../../../services/general.service';
import { TableColType, TableComponent } from "../../atoms/table/table.component";
import { Flow, FlowQuestion } from '../../../models/form.models';
import { DisplayQuestionSvgComponent } from "../display-question-svg/display-question-svg.component";
import { CommonModule } from '@angular/common';
import { ButtonComponent } from "../../atoms/button/button.component";
import { ButtonRibbonComponent } from "../../atoms/button-ribbon/button-ribbon.component";

@Component({
  selector: 'app-draw-question-svg',
  imports: [TableComponent, DisplayQuestionSvgComponent, CommonModule, ButtonComponent, ButtonRibbonComponent],
  templateUrl: './draw-question-svg.component.html',
  styleUrl: './draw-question-svg.component.scss'
})
export class DrawQuestionSvgComponent implements AfterViewInit {
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

  @Input() set Svg(s: Svg | undefined) {
    if (!s) {
      this.reset();
    }
  }

  @Output() SvgChange: EventEmitter<Svg> = new EventEmitter<Svg>();

  flowTableCols: TableColType[] = [
    { PropertyName: 'question.question', ColLabel: 'Question', Type: "text", Required: true, Width: '200px' },
    { PropertyName: 'order', ColLabel: 'Order', Type: "number", Required: true, Width: '100px' },
    { PropertyName: 'question.question_typ.question_typ_nm', ColLabel: 'Type' },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'function', ColValueFunction: this.ynToYesNo.bind(this), Width: '50px' },
    { PropertyName: 'question.x', ColLabel: 'X', Type: "number" },
    { PropertyName: 'question.y', ColLabel: 'Y', Type: "number" },
    { PropertyName: 'question.width', ColLabel: 'Width', Type: "number" },
    { PropertyName: 'question.height', ColLabel: 'Height', Type: "number" },
    { PropertyName: 'question.icon', ColLabel: 'Icon', Type: "text", Href: "https://pictogrammers.com/library/mdi/", Width: '150px' },
    { PropertyName: 'question.icon_only', ColLabel: 'Icon Only', Type: "checkbox" },
  ];
  flowTableTriggerUpdate = false;

  @Input() FlowQuestions: FlowQuestion[] = [];
  @Output() FlowQuestionsChange: EventEmitter<FlowQuestion[]> = new EventEmitter<FlowQuestion[]>();
  activeFlowQuestion: FlowQuestion | undefined = undefined;

  constructor(private renderer: Renderer2, private gs: GeneralService) { }

  ngAfterViewInit() {
    // It's crucial to get the SVG and path elements after the view is initialized.
    this.adjustImage();
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
      //this.closePath();
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
    const svg = `
      <svg width="${pathBounds.width}" height="${pathBounds.height}" viewBox="${pathBounds.x} ${pathBounds.y} ${pathBounds.width} ${pathBounds.height}" xmlns="http://www.w3.org/2000/svg">
        <path d="${this.myPath.nativeElement.getAttribute('d')}" fill="lightblue" stroke="black" />
      </svg>
    `
    if (svg.length > 2000) {
      this.gs.triggerError('Path too complicated, simplify please.');
      return '';
    }
    else
      return svg;
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

  reset(): void {
    this.points = [];
    if (this.myPath)
      this.myPath.nativeElement.setAttribute('d', '');
  }

  exit(): void {
    this.activeFlowQuestion = undefined;
    this.reset();
  }

  finish(): void {
    this.closePath();

    const pathBounds = this.myPath.nativeElement.getBBox();

    let svg = new Svg();
    svg.x = parseFloat((pathBounds.x / this.image.nativeElement.offsetWidth * 100).toFixed(2));
    svg.y = parseFloat((pathBounds.y / this.image.nativeElement.offsetHeight * 100).toFixed(2));
    svg.width = parseFloat((pathBounds.width / this.image.nativeElement.offsetWidth * 100).toFixed(2));
    svg.height = parseFloat((pathBounds.height / this.image.nativeElement.offsetHeight * 100).toFixed(2));
    svg.svg = this.createSvg();

    if (this.activeFlowQuestion) {
      this.activeFlowQuestion.question.x = svg.x;
      this.activeFlowQuestion.question.y = svg.y;
      this.activeFlowQuestion.question.width = svg.width;
      this.activeFlowQuestion.question.height = svg.height;
      this.activeFlowQuestion.question.svg = svg.svg;
    }

    this.FlowQuestionsChange.emit(this.FlowQuestions);
    this.activeFlowQuestion = undefined;

    this.reset();
  }

  editFlowQuestion(flowQuestion: FlowQuestion): void {
    this.activeFlowQuestion = flowQuestion;
  }

  ynToYesNo(s: string): string {
    return this.gs.decodeYesNo(s);
  }
}

export class Svg {
  svg = '';
  x = NaN;
  y = NaN;
  width = NaN;
  height = NaN;
}