import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { Question } from '../../../models/form.models';
import { SafeHTMLPipe } from "../../../pipes/safe-html.pipe";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-display-question-svg',
  imports: [SafeHTMLPipe, CommonModule],
  templateUrl: './display-question-svg.component.html',
  styleUrl: './display-question-svg.component.scss'
})
export class DisplayQuestionSvgComponent implements AfterViewInit {

  @Input() Question = new Question();
  @Output() QuestionChange = new EventEmitter<any>();
  @ViewChild('svgDiv', { read: ElementRef, static: false }) svgDiv: ElementRef | undefined = undefined;

  @Input() Inverted = false;

  @Input() Stroke = '#ffffff';
  @Input() Fill = '#80808087';

  constructor(private renderer: Renderer2) { }

  ngAfterViewInit(): void {
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

      this.renderer.listen(this.svgDiv.nativeElement, 'click', (event: MouseEvent) => {
        const target = event.target as SVGElement;
        if (target.tagName === 'path') {
          console.log('Path clicked!');
          // Add your desired functionality here
          this.click(event);
        }
      });
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
    this.Question.answer = answer;
    this.QuestionChange.emit(this.Question);
  }
}
