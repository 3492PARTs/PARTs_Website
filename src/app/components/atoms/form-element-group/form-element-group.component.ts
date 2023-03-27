import { Component, OnInit, Input, ContentChildren, QueryList } from '@angular/core';
import { FormElementComponent } from '../form-element/form-element.component';

@Component({
  selector: 'app-form-element-group',
  templateUrl: './form-element-group.component.html',
  styleUrls: ['./form-element-group.component.scss']
})
export class FormElementGroupComponent implements OnInit {
  @Input() Inline = false;
  @Input() MaxWidth = false;
  @Input() LabelText = '';
  @Input() InlineElements = false;
  @Input() WrapElements = false;
  @ContentChildren(FormElementComponent) formElements = new QueryList<FormElementComponent>();

  constructor() { }


  ngOnInit() {
  }

}
