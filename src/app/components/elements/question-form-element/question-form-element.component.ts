import { AfterContentInit, AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { FormElementComponent } from '../../atoms/form-element/form-element.component';
import { GeneralService } from '../../../services/general.service';
import { CommonModule } from '@angular/common';
import { Question } from '../../../models/form.models';
import { DisplayQuestionSvgComponent } from "../display-question-svg/display-question-svg.component";

@Component({
  selector: 'app-question-form-element',
  imports: [CommonModule, FormElementComponent, DisplayQuestionSvgComponent],
  templateUrl: './question-form-element.component.html',
  styleUrls: ['./question-form-element.component.scss']
})
export class QuestionFormElementComponent implements AfterViewInit {
  @Input() Question!: Question;
  @Input() Disabled = false;
  @Output() QuestionChange = new EventEmitter<any>();
  @ViewChild(FormElementComponent) formElement!: FormElementComponent;

  @Output() FunctionCallBack: EventEmitter<any> = new EventEmitter();

  @Input() Inverted = false;

  constructor(private gs: GeneralService, private renderer: Renderer2) { }

  ngAfterViewInit(): void {

  }

  change(answer: any): void {
    this.Question.answer = answer;
    this.QuestionChange.emit(this.Question);
  }

  questionChange(question: Question): void {
    this.Question = question;
    this.QuestionChange.emit(this.Question);
  }

  runFunction(): void {
    this.FunctionCallBack.emit();
  }
}
