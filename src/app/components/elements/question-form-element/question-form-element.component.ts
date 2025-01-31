import { AfterContentInit, AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { FormElementComponent } from '../../atoms/form-element/form-element.component';
import { GeneralService } from '../../../services/general.service';
import { CommonModule } from '@angular/common';
import { Question } from '../../../models/form.models';
import { SafeHTMLPipe } from "../../../pipes/safe-html.pipe";

@Component({
  selector: 'app-question-form-element',
  imports: [CommonModule, FormElementComponent, SafeHTMLPipe],
  templateUrl: './question-form-element.component.html',
  styleUrls: ['./question-form-element.component.scss']
})
export class QuestionFormElementComponent implements AfterViewInit {
  @Input() Question!: Question;
  @Input() Disabled = false;
  @Output() QuestionChange = new EventEmitter<any>();
  @ViewChild(FormElementComponent) formElement!: FormElementComponent;

  @Output() FunctionCallBack: EventEmitter<any> = new EventEmitter();

  @ViewChild('mntPhsBtn', { read: ElementRef, static: false }) mntPhsBtn: ElementRef | undefined = undefined;
  @ViewChild('svgDiv', { read: ElementRef, static: false }) svgDiv: ElementRef | undefined = undefined;
  @Input() Inverted = false;

  constructor(private gs: GeneralService, private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    if (this.svgDiv)
      this.renderer.listen(this.svgDiv.nativeElement, 'click', (event: MouseEvent) => {
        const target = event.target as SVGElement;
        if (target.tagName === 'path') {
          console.log('Path clicked!');
          // Add your desired functionality here
        }
      });
  }

  change(answer: any): void {
    this.Question.answer = answer;
    this.QuestionChange.emit(this.Question);
  }

  click(e: MouseEvent): void {
    if (this.mntPhsBtn) {
      let coords = {
        x: parseFloat((e.offsetX / parseInt(this.mntPhsBtn.nativeElement.offsetWidth) * 100).toFixed(2)),
        y: parseFloat((e.offsetY / parseInt(this.mntPhsBtn.nativeElement.offsetHeight) * 100).toFixed(2)),
      };

      if (this.Inverted) {
        coords.x = 50 - (coords.x - 50);
      }

      this.change(coords);
    }
  }

  runFunction(): void {
    this.FunctionCallBack.emit();
  }
}
