import { Component, Input, ContentChildren, QueryList, AfterViewInit, OnInit, EventEmitter, Output } from '@angular/core';
import { FormElementComponent } from '../form-element/form-element.component';
import { FormComponent } from '../form/form.component';

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

  @Input() FormElements: QueryList<FormElementComponent> = new QueryList<FormElementComponent>();
  @Output() FormElementsChange: EventEmitter<QueryList<FormElementComponent>> = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
    if (this.InlineElements) {
      this.formElements.forEach(fe => fe.FormGroupInline = true);
    }

  }

  ngAfterViewInit() {
    this.setFormGroup();

    this.formElements.changes.subscribe(() => {
      this.setFormGroup();
      this.setFormElements();
    });

    this.setFormElements();
  }

  setFormGroup() {
    window.setTimeout(() => {
      for (let i = 0; i <= this.formElements.length - 1; i++) {
        let fe = this.formElements.get(i);

        if (fe) {
          if (!this.InlineElements)
            fe.FormGroup = true;
          else
            fe.FormGroupInline = true;
        }
      }
    }, 1);
  }

  setFormElements(): void {
    this.FormElements = this.formElements;
    this.FormElementsChange.emit(this.FormElements);
  }
}
