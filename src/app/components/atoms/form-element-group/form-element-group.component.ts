import { Component, Input, ContentChildren, QueryList, AfterViewInit, OnInit, EventEmitter, Output } from '@angular/core';
import { FormElementComponent } from '../form-element/form-element.component';
import { FormComponent } from '../form/form.component';
import { QuestionFormElementComponent } from '../../elements/question-form-element/question-form-element.component';
import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-form-element-group',
  templateUrl: './form-element-group.component.html',
  styleUrls: ['./form-element-group.component.scss']
})
export class FormElementGroupComponent implements OnInit, AfterViewInit {
  @Input() Inline = false;
  @Input() MaxWidth = false;
  @Input() LabelText = '';
  @Input() InlineElements = false;
  @ContentChildren(FormElementComponent, { descendants: true }) formElements = new QueryList<FormElementComponent>();
  @ContentChildren(QuestionFormElementComponent, { descendants: true }) questionFormElements = new QueryList<QuestionFormElementComponent>();

  @Input() FormElements: QueryList<FormElementComponent> = new QueryList<FormElementComponent>();
  @Output() FormElementsChange: EventEmitter<QueryList<FormElementComponent>> = new EventEmitter();

  @Input() RemoveBorder = false;

  constructor(private gs: GeneralService) {
  }

  ngOnInit() {
    if (this.InlineElements) {
      this.formElements.forEach(fe => fe.FormGroupInline = true);
      this.questionFormElements.forEach(qfe => qfe.formElement.FormGroupInline = true);
    }

  }

  ngAfterViewInit() {
    this.setFormGroup();

    this.formElements.changes.subscribe(() => {
      this.setFormGroup();
      this.setFormElements();
    });
    this.questionFormElements.changes.subscribe(() => {
      this.setFormGroup();
      this.setFormElements();
    })
    this.setFormElements();
  }

  setFormGroup() {
    this.gs.triggerChange(() => {
      this.formElements.forEach(fe => {
        if (fe) {
          if (!this.InlineElements)
            fe.FormGroup = true;
          else
            fe.FormGroupInline = true;
        }
      });

      this.questionFormElements.forEach(qfe => {
        let fe = qfe.formElement;
        if (fe) {
          if (!this.InlineElements)
            fe.FormGroup = true;
          else
            fe.FormGroupInline = true;
        }
      })

    });
  }

  setFormElements(): void {
    const questionFormElements: FormElementComponent[] = [];
    this.questionFormElements.forEach(qfe => {
      questionFormElements.push(qfe.formElement);
    });
    this.FormElements.reset([...this.formElements, ...questionFormElements]);
    this.FormElementsChange.emit(this.FormElements);
  }
}
