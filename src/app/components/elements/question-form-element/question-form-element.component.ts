import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormElementComponent } from '../../atoms/form-element/form-element.component';
import { GeneralService } from '../../../services/general.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question-form-element',
  standalone: true,
  imports: [CommonModule, FormElementComponent],
  templateUrl: './question-form-element.component.html',
  styleUrls: ['./question-form-element.component.scss']
})
export class QuestionFormElementComponent {
  @Input() Question: any;
  @Input() Disabled = false;
  @Output() QuestionChange = new EventEmitter<any>();
  @ViewChild(FormElementComponent) formElement!: FormElementComponent;

  constructor(private gs: GeneralService) { }

  change(answer: any): void {
    this.Question.answer = answer;
    this.QuestionChange.emit(this.Question);
  }
}
