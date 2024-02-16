import { Component, ContentChildren, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';
import { FormElementComponent } from '../../atoms/form-element/form-element.component';
import { Question } from '../question-admin-form/question-admin-form.component';

@Component({
  selector: 'app-question-display-form',
  templateUrl: './question-display-form.component.html',
  styleUrls: ['./question-display-form.component.scss']
})
export class QuestionDisplayFormComponent implements OnInit, OnChanges {

  @Input() LabelText = '';
  @Input() Questions: Question[] = [];
  @Output() QuestionsChange: EventEmitter<Question[]> = new EventEmitter();

  //formElements = new QueryList<FormElementComponent>();

  @Input() FormElements: QueryList<FormElementComponent> = new QueryList<FormElementComponent>();
  @Output() FormElementsChange: EventEmitter<QueryList<FormElementComponent>> = new EventEmitter();

  constructor(private gs: GeneralService) { }

  ngOnInit(): void {
    //this.setFormElements();
    //this.formElements.changes.subscribe(fe => {
    //this.setFormElements();
    //console.log('changes');
    //});
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'Questions':
            this.QuestionsChange.emit(this.Questions);
            break;
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

  setFormElements(fes: QueryList<FormElementComponent>): void {
    this.FormElements = fes;
    this.FormElementsChange.emit(this.FormElements);
  }
}
