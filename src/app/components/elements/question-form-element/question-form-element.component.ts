import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Question } from '../question-admin-form/question-admin-form.component';
import { FormElementComponent } from '../../atoms/form-element/form-element.component';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-question-form-element',
  templateUrl: './question-form-element.component.html',
  styleUrls: ['./question-form-element.component.scss']
})
export class QuestionFormElementComponent {
  @Input() Question = new Question();
  @Output() QuestionChange = new EventEmitter<Question>();
  @ViewChild(FormElementComponent) formElement!: FormElementComponent;

  constructor(private gs: GeneralService) { }

  change(answer: any): void {
    this.Question.answer = answer;
    this.QuestionChange.emit(this.Question);
  }

  increment(sq: Question): void {
    if (!sq.answer || this.gs.strNoE(sq.answer.toString())) sq.answer = 0;
    sq.answer = parseInt(sq.answer.toString()) + 1;
  }

  decrement(sq: Question): void {
    if (!sq.answer || this.gs.strNoE(sq.answer.toString())) sq.answer = 0;
    if (parseInt(sq.answer.toString()) > 0) sq.answer = parseInt(sq.answer.toString()) - 1;
  }

}
