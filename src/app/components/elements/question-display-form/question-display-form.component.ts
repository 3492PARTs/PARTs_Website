import { Component, ContentChildren, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges } from '@angular/core';
import { GeneralService } from 'src/app/services/general.service';
import { FormElementComponent } from '../../atoms/form-element/form-element.component';
import { QuestionWithConditions } from 'src/app/models/form.models';

@Component({
  selector: 'app-question-display-form',
  templateUrl: './question-display-form.component.html',
  styleUrls: ['./question-display-form.component.scss']
})
export class QuestionDisplayFormComponent implements OnInit, OnChanges {

  @Input() LabelText = '';
  @Input() Disabled = false;
  @Input() Questions: QuestionWithConditions[] = [];
  @Output() QuestionsChange: EventEmitter<QuestionWithConditions[]> = new EventEmitter();

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

  setFormElements(fes: QueryList<FormElementComponent>): void {
    this.FormElements = fes;
    this.FormElementsChange.emit(this.FormElements);
  }
}
