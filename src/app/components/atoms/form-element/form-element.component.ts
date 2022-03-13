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
  @Input() DisplayProperty2 = '';

  @Input() Name = '';

  @Input() Type = 'text';

  @Input() SelectList: any[] = [];
  @Input() RadioList: any[] = [];
  @Input() DisplayEmptyOption = false;
  @Input() FieldSize = 524288;
  @Input() FormElementInline: boolean = true;
  @Input() LabelOnTop: boolean = true;

  @Input()
  SelectValidityFunction!: (o1: any, o2: any) => boolean;

  @Input() Required = false;
  @Input() Touched = false;
  @Input() Focused = false;
  @Input() Disabled = false;

  @Input()
  ValidityFunction!: Function;

  @Input() Model: any;
  @Output() ModelChange = new EventEmitter();

  @Input()
  MultiModel!: any;
  @Output() MultiModelChange = new EventEmitter();

  @Output() FunctionCallBack: EventEmitter<any> = new EventEmitter();
  @Output() OnFocusOut: EventEmitter<any> = new EventEmitter();

  @Input() TrueValue: any = true;
  @Input() FalseValue: any = false;

  LabelID!: string;
  private fileData!: File;

  @ViewChild('multiSelectDropdown', { read: ElementRef })
  dropdown!: ElementRef;
  @ViewChild('multiselect', { read: ElementRef })
  multiSelect!: ElementRef;
  private expanded = false;

  change(newValue: any) {
    this.Model = newValue;
    if (this.Type === 'checkbox') {
      if (newValue.target.checked) {
        this.ModelChange.emit(this.TrueValue);
      } else {
        this.ModelChange.emit(this.FalseValue);
      }
    } else {
      this.ModelChange.emit(newValue);
    }
    this.FunctionCallBack.emit();

  }

  multiChange(newValue: any, index: string | number) {
    this.MultiModel[index]['checked'] = newValue;
    this.ModelChange.emit(this.MultiModel);
    this.FunctionCallBack.emit();
  }

  ngOnInit() {
    this.LabelID = this.gs.getNextGsId();
  }

  ngAfterViewInit() {
    this.positionMultiSelect();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.positionMultiSelect();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.positionMultiSelect();
  }

  private positionMultiSelect(): void {
    if (this.Type === 'multiselect' && this.multiSelect && this.dropdown) {
      const rect = this.multiSelect.nativeElement.getBoundingClientRect();
      this.renderer.setStyle(
        this.dropdown.nativeElement,
        'top', (rect.top + 38) + 'px'
      );
      this.renderer.setStyle(
        this.dropdown.nativeElement,
        'left', (rect.left + 1.2) + 'px'
      );
      this.renderer.setStyle(
        this.dropdown.nativeElement,
        'max-height', 'calc( 100vh - ' + (rect.top + 38) + 'px - 16px)'
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
    this.positionMultiSelect();
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
      this.renderer.setStyle(
        this.dropdown.nativeElement,
        'overflow-y', 'hidden'
      );

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
      this.renderer.setStyle(
        this.dropdown.nativeElement,
        'overflow-y', 'auto'
      );

      this.expanded = !this.expanded;
    }
  }

  multiSelectClose(): void {
    if (this.dropdown) {
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

}
