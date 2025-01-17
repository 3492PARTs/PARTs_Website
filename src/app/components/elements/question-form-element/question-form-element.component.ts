import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormElementComponent } from '../../atoms/form-element/form-element.component';
import { GeneralService } from '../../../services/general.service';
import { CommonModule } from '@angular/common';
import { Question } from '../../../models/form.models';

@Component({
  selector: 'app-question-form-element',
  standalone: true,
  imports: [CommonModule, FormElementComponent],
  templateUrl: './question-form-element.component.html',
  styleUrls: ['./question-form-element.component.scss']
})
export class QuestionFormElementComponent {
  @Input() Question!: Question;
  @Input() Disabled = false;
  @Output() QuestionChange = new EventEmitter<any>();
  @ViewChild(FormElementComponent) formElement!: FormElementComponent;

  @Output() FunctionCallBack: EventEmitter<any> = new EventEmitter();

  constructor(private gs: GeneralService) { }

  change(answer: any): void {
    this.Question.answer = answer;
    this.QuestionChange.emit(this.Question);
  }

  click(e: MouseEvent): void {
    //console.log(e);
    this.change({ x: e.offsetX, y: e.offsetY });
  }

  runFunction(): void {
    this.FunctionCallBack.emit();
  }
}
