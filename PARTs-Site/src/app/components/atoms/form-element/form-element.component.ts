import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnInit,
  ElementRef,
  Renderer2,
  AfterViewInit,
  HostListener
} from '@angular/core';

import { FormControl } from '@angular/forms';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector: 'app-form-element',
  templateUrl: './form-element.component.html',
  styleUrls: ['./form-element.component.scss']
})
export class FormElementComponent implements OnInit, AfterViewInit {

  constructor(private gs: GeneralService, private renderer: Renderer2) { }
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

  @Input() MultiModel;
  @Output() MultiModelChange = new EventEmitter();

  @Output() FunctionCallBack: EventEmitter<any> = new EventEmitter();
  @Output() OnFocusOut: EventEmitter<any> = new EventEmitter();

  @Input() TrueValue = true;
  @Input() FalseValue = false;

  LabelID: string;
  private fileData: File = null;

  @ViewChild('multiSelectDropdown', { read: ElementRef, static: false }) dropdown: ElementRef;
  @ViewChild('multiselect', { read: ElementRef, static: false }) multiSelect: ElementRef;
  private expanded = false;

  change(newValue) {
    this.Model = newValue;
    if (this.Type === 'checkbox') {
      if (newValue) {
        this.ModelChange.emit(this.TrueValue);
      } else {
        this.ModelChange.emit(this.FalseValue);
      }
    } else {
      this.ModelChange.emit(newValue);
    }
    this.FunctionCallBack.emit();

  }

  multiChange(newValue, index) {
    this.MultiModel[index]['checked'] = newValue;
    this.ModelChange.emit(this.MultiModel);
    this.FunctionCallBack.emit();
  }

  ngOnInit() {
    this.LabelID = this.gs.getNextGsId();
  }

  ngAfterViewInit() {
    this.positionMultiSelect()
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.positionMultiSelect();
  }

  private positionMultiSelect(): void {
    if (this.Type === 'multiselect') {
      const rect = this.multiSelect.nativeElement.getBoundingClientRect();
      this.renderer.setStyle(
        this.dropdown.nativeElement,
        'top', (rect.top + 38) + 'px'
      );
      this.renderer.setStyle(
        this.dropdown.nativeElement,
        'left', (rect.left + 1.2) + 'px'
      );
    }
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

  fileProgress(fileInput: any) {
    this.fileData = <File>fileInput.target.files[0];
    this.change(this.fileData);
  }

  multiSelectMenu(): void {
    if (this.expanded) {
      this.renderer.setStyle(
        this.dropdown.nativeElement,
        'height', '0px'
      );
      window.setTimeout(() => {
        this.renderer.setStyle(
          this.dropdown.nativeElement,
          'visibility', 'hidden'
        );
      }, 150);

      this.expanded = !this.expanded;
    } else {
      this.renderer.setStyle(
        this.dropdown.nativeElement,
        'height', this.dropdown.nativeElement.scrollHeight + 'px'
      );
      this.renderer.setStyle(
        this.dropdown.nativeElement,
        'visibility', 'visible'
      );

      this.expanded = !this.expanded;
    }
  }

  multiSelectClose(): void {
    this.renderer.setStyle(
      this.dropdown.nativeElement,
      'height', '0px'
    );
    window.setTimeout(() => {
      this.renderer.setStyle(
        this.dropdown.nativeElement,
        'visibility', 'hidden'
      );
    }, 150);

    this.expanded = false;
  }

}
