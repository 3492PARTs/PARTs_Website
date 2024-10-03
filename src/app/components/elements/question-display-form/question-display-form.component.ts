import { Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges } from '@angular/core';
import { FormElementComponent } from '../../atoms/form-element/form-element.component';
import { QuestionWithConditions } from '../../../models/form.models';
import { GeneralService } from '../../../services/general.service';
import { FormElementGroupComponent } from '../../atoms/form-element-group/form-element-group.component';
import { QuestionFormElementComponent } from '../question-form-element/question-form-element.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question-display-form',
  standalone: true,
  imports: [FormElementGroupComponent, QuestionFormElementComponent, CommonModule],
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
