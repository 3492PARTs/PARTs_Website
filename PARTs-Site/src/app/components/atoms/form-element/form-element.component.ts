import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnInit
} from '@angular/core';

import { FormControl } from '@angular/forms';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector: 'app-form-element',
  templateUrl: './form-element.component.html',
  styleUrls: ['./form-element.component.scss']
})
export class FormElementComponent implements OnInit {
  @Input() FormGroup = false;
  @Input() FormGroupInline = false;
  @Input() RadioGroupStacked = false;
  @Input() FormInline = false;
  @Input() LabelText = '';
  @Input() Width = 'auto';
  @Input() Placeholder = ''; // TODO Still needed?
  @Input() Rows = 0;
  //@Input() SelectDisplayValue = '';
  @Input() BindingProperty = '';
  @Input() DisplayProperty = '';

  @Input() Name = '';

  @Input() Type = 'text';

  @Input() SelectList: [] = [];
  @Input() RadioList: [] = [];
  @Input() DisplayEmptyOption = false;
  @Input() FieldSize = 524288;
  @Input() FormElementInline: boolean = true;
  @Input() LabelOnTop: boolean = true;

  @Input() Required = false;
  @Input() Touched = false;
  @Input() Focused = false;
  @Input() Disabled = false;

  @Input() ValidityFunction: Function;

  @Input() Model;
  @Output() ModelChange = new EventEmitter();

  @Output() FunctionCallBack: EventEmitter<any> = new EventEmitter();
  @Output() OnFocusOut: EventEmitter<any> = new EventEmitter();

  LabelID: string;

  change(newValue) {
    this.Model = newValue;
    this.ModelChange.emit(newValue);
    this.FunctionCallBack.emit();

  }
  constructor(private gs: GeneralService) { }

  ngOnInit() {
    this.LabelID = this.gs.getNextGsId();
  }

  IsInvalid(): boolean {
    let ret = false;
    // console.log(this.Touched  + " " + this.Required);
    if (this.Touched && this.Required) {
      if (this.ValidityFunction != null) {
        ret = this.ValidityFunction();
      } else if (!this.Model) {
        ret = true;
      }
    }
    return ret;
  }

  TouchIt() {
    this.Touched = true;
  }

  ResetFormElement() {
    this.Touched = false;
    this.Focused = false;
  }


  RunFunction() {
    this.FunctionCallBack.emit();
  }

  focusOut() {
    this.OnFocusOut.emit();
  }



}
