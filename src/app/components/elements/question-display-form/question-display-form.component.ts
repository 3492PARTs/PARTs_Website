import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';
import { Question } from '../question-admin-form/question-admin-form.component';

@Component({
  selector: 'app-question-display-form',
  templateUrl: './question-display-form.component.html',
  styleUrls: ['./question-display-form.component.scss']
})
export class QuestionDisplayFormComponent implements OnChanges {

  @Input() LabelText = '';
  @Input() Questions: Question[] = [];
  @Output() QuestionsChange: EventEmitter<Question[]> = new EventEmitter();

  constructor(private gs: GeneralService) { }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'Questions': {
            this.QuestionsChange.emit(this.Questions);
          }
        }
      }
    }
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
