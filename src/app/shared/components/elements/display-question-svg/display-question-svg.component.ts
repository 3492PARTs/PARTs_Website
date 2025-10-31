import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, Renderer2, ViewChild } from '@angular/core';
import { Question } from '@app/core/models/form.models';
import { SafeHTMLPipe } from "../../../pipes/safe-html.pipe";
import { CommonModule } from '@angular/common';
import { GeneralService } from '@app/core/services/general.service';

import { Utils } from '@app/core/utils/utils';
@Component({
  selector: 'app-display-question-svg',
  imports: [SafeHTMLPipe, CommonModule],
  templateUrl: './display-question-svg.component.html',
  styleUrls: ['./display-question-svg.component.scss']
})
export class DisplayQuestionSvgComponent implements AfterViewInit, OnDestroy {

  @Input() set Question(q: Question) {
    this.question = q;
    Utils.triggerChange(() => this.setSvgAttributes());
  }
  @Output() QuestionChange = new EventEmitter<any>();

  question = new Question();

  @ViewChild('svgDiv', { read: ElementRef, static: false }) svgDiv: ElementRef | undefined = undefined;

  @Input() Inverted = false;
  @Input() HideLabel = false;

  @Input() Stroke = '#ffffff';
  @Input() Fill = '#80808087';

  private clickListener: (() => void) | null = null; // Store the listener function

  constructor(private renderer: Renderer2, private gs: GeneralService) { }

  ngAfterViewInit(): void {
    this.setSvgAttributes();
  }

  ngOnDestroy(): void {
    if (this.clickListener) {
      this.clickListener(); // Call the listener function to remove it
      this.clickListener = null; // Reset the listener reference
    }
  }

  private setSvgAttributes(): void {
    if (this.svgDiv) {
      // Get the SVG element within the container
      const svgElement = this.svgDiv.nativeElement.querySelector('svg');
      const pathElement = this.svgDiv.nativeElement.querySelector('path');

      if (svgElement) {
        // Set the width of the SVG element
        this.renderer.setStyle(svgElement, 'width', '100%');
        this.renderer.setStyle(svgElement, 'height', '100%');
      }

      if (pathElement) {
        // Set the width of the SVG element
        this.renderer.setStyle(pathElement, 'fill', this.Fill);
        this.renderer.setStyle(pathElement, 'stroke', this.Stroke);
        this.renderer.setStyle(pathElement, 'stroke-width', '0.3rem');
        this.renderer.setStyle(pathElement, 'stroke-linejoin', 'round');
      }

      if (!this.clickListener) { // Check if listener already exists
        this.clickListener = this.renderer.listen(this.svgDiv.nativeElement, 'click', (event: MouseEvent) => {
          const target = event.target as SVGElement;
          if (target.tagName === 'path') {
            this.click(event);
          }
        });
      }
    }
  }

  click(e: MouseEvent): void {
    if (this.svgDiv) {
      let coords = {
        x: parseFloat((e.offsetX / parseInt(this.svgDiv.nativeElement.offsetWidth) * 100).toFixed(2)),
        y: parseFloat((e.offsetY / parseInt(this.svgDiv.nativeElement.offsetHeight) * 100).toFixed(2)),
      };

      if (this.Inverted) {
        coords.x = 50 - (coords.x - 50);
      }

      this.change(coords);
    }
  }

  change(answer: any): void {
    this.question.answer = answer;
    this.QuestionChange.emit(this.question);
  }
}
