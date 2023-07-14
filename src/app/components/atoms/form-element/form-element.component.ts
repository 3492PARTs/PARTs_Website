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
  HostListener,
  DoCheck,
  SimpleChanges
} from '@angular/core';

import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-form-element',
  templateUrl: './form-element.component.html',
  styleUrls: ['./form-element.component.scss']
})
export class FormElementComponent implements OnInit, AfterViewInit, DoCheck {
  @Input() FormGroup = false;
  @Input() FormGroupInline = false;
  @Input() RadioGroupStacked = false;
  @Input() FormInline = false;
  @Input() LabelText = '';
  @Input() Width = 'auto';
  @Input() MinWidth = 'auto';
  @Input() Placeholder = '';
  @Input() Rows = 0;
  //@Input() SelectDisplayValue = '';
  @Input() BindingProperty = '';
  @Input() DisplayProperty = '';
  @Input() DisplayProperty2 = '';

  @Input() Name = '';

  @Input() Type = 'text';

  @Input()
  set SelectList(sl: any) {
    window.setTimeout(() => { this._SelectList = sl; }, 0);
  }
  _SelectList: any[] = [];
  @Input() RadioList: any[] = [];
  @Input() CheckboxList: any[] = [];
  @Input() DisplayEmptyOption = false;
  @Input() FieldSize = 524288;
  @Input() FormElementInline: boolean = true;

  //@Input() Validation = false;
  @Input() ValidationMessage = '';
  @Input() Required = false;
  @Input() Touched = false;
  @Input() Focused = false;
  @Input() Disabled = false;
  valid = false;

  @Input() ValidityFunction?: Function;
  @Input() SelectComparatorFunction!: (o1: any, o2: any) => boolean;

  @Input() Model: any;
  @Output() ModelChange = new EventEmitter();

  @Input() MultiModel: any = [];
  @Output() MultiModelChange = new EventEmitter();

  @Output() FunctionCallBack: EventEmitter<any> = new EventEmitter();
  @Output() OnFocusOut: EventEmitter<any> = new EventEmitter();

  @Input() TrueValue: any = true;
  @Input() FalseValue: any = false;

  LabelID = '';
  private fileData: File | null = null;
  fileName = '';

  @Input() ImageChangeEvent: (e: any) => void = () => { };

  @ViewChild('multiSelectDropdown', { read: ElementRef, static: false }) dropdown: ElementRef = new ElementRef(null);
  @ViewChild('multiSelect', { read: ElementRef, static: false }) multiSelect: ElementRef = new ElementRef(null);
  private expanded = false;

  @ViewChild('fileUpload') fileUpload: { nativeElement: { value: string; }; } = { nativeElement: { value: '' } };

  @Input() IconOnly = false;

  @ViewChild('formElement', { read: ElementRef, static: false }) formElement: ElementRef = new ElementRef(null);
  @ViewChild('label', { read: ElementRef, static: false }) label: ElementRef = new ElementRef(null);

  constructor(private gs: GeneralService, private renderer: Renderer2) { }

  ngOnInit() {
    this.LabelID = this.gs.getNextGsId();
  }

  /*ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'Model': {
            if (this.Type === 'select') {
              console.log(this.Model);
              if (this.gs.strNoE(this.Model)) {
                window.setTimeout(() => {
                  this.change('');
                }, 5);
              }
            }
          }
        }
      }
    }
  }*/


  ngDoCheck(): void {
    if (this.Type === 'file') {
      if (this.Model?.size <= 0) {
        this.fileName = '';
      }
    }
  }

  ngAfterViewInit() {
    this.positionMultiSelect();

    this.resizeFormElement();

    this.positionLabel();

    window.setTimeout(() => {
      if (this.Width === 'auto' && this.Type === 'number') {
        this.Width = '100px';
      }
    }, 1);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.positionMultiSelect();

    this.resizeFormElement();

    this.positionLabel();

  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    this.positionMultiSelect();
  }

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
    this.isInvalid();
  }

  multiChange(newValue: any, index: number) {
    this.MultiModel[index]['checked'] = newValue;
    this._SelectList[index]['checked'] = newValue;
    this.ModelChange.emit(this.MultiModel);
    this.FunctionCallBack.emit();
  }

  private positionMultiSelect(): void {
    if (this.Type === 'multiSelect' && this.multiSelect) {
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

  isInvalid(): boolean {
    let ret = false;
    if (this.Touched && this.Required) {
      if (this.ValidityFunction != null) {
        ret = this.ValidityFunction();
      } else if (!this.Model) {
        ret = true;
      }
    }
    this.valid = !ret;
    return ret;
  }

  touchIt() {
    this.Touched = true;
  }

  focusIn() {
    this.Focused = true;
    this.isInvalid();
    this.touchIt();
  }

  focusOut() {
    this.Focused = false;
    this.isInvalid();
    this.OnFocusOut.emit();
  }

  reset() {
    this.Touched = false;
    this.Focused = false;
  }

  fileProgress(fileInput: any) {
    this.fileData = <File>fileInput.target.files[0];

    if (this.fileData) {

      let tmp = this.fileData.name;

      let ext = tmp.split('.')[tmp.split('.').length - 1];

      if (tmp.length > 18) {
        this.fileName = tmp.substring(0, (17 - ext.length)).trim() + '....' + ext;
      }
      else {
        this.fileName = tmp;
      }

      this.change(this.fileData);
    }

    this.fileUpload.nativeElement.value = '';
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

  formatMAC(value: string): void {
    if (value) {
      //we do not need the value, we just update the formattedMac using this.model.mac_address
      const inputWithoutColon = value.replace(new RegExp(":", 'g'), "");
      let blocks = inputWithoutColon.match(/.{1,2}/g) || [];
      let formattedMac = blocks.shift() || '';
      for (let block of blocks) {
        formattedMac = formattedMac + ":" + block;
      }
      formattedMac = formattedMac.substring(0, 17);
      this.change(formattedMac);
    }
  }

  selectAll(): void {
    for (let i = 0; i < this._SelectList.length; i++) {
      this.multiChange(true, i);
    }
  }

  deselectAll(): void {
    for (let i = 0; i < this._SelectList.length; i++) {
      this.multiChange(false, i);
    }
  }

  resizeFormElement(): void {
    // This is to make sure the form element is the right width for the label
    window.setTimeout(() => {
      if (!['radio', 'checkbox'].includes(this.Type) && this.label) {
        const width = this.label.nativeElement.clientWidth + 32;
        if (this.MinWidth != 'auto') {
          this.gs.devConsoleLog('Developer your min width will be overwritten on your form element.');
        }
        this.MinWidth = width + 'px';
      }
    }, 1);
  }

  positionLabel(): void {
    if (this.label && this.Type !== 'checkbox') {
      const { lineHeight } = getComputedStyle(this.label.nativeElement);
      const lineHeightParsed = parseInt(lineHeight.split('px')[0]);
      const amountOfLinesTilAdjust = 2;

      if (this.LabelText.includes('Please describe your experiences')) {
        let x = 0;
      }

      // i need this to be . if i find a place where i need it to be
      // strictly this is my reminder that i need to find another solution
      if (this.label.nativeElement.offsetHeight >= (lineHeightParsed * amountOfLinesTilAdjust)) {
        this.gs.devConsoleLog('your h1 now wrapped ' + this.LabelText.substring(0, 10) + '\n' + 'offsetHeight: ' + this.label.nativeElement.offsetHeight + ' ' + lineHeightParsed);
        const labelOffset = this.label.nativeElement.offsetHeight - (lineHeightParsed / 2);
        this.renderer.setStyle(
          this.label.nativeElement,
          'top', '-' + labelOffset + 'px'
        );
        this.renderer.setStyle(
          this.formElement.nativeElement,
          'margin-top', labelOffset + 'px'
        );
      } else {
        this.gs.devConsoleLog('your h1 on one line: ' + this.LabelText.substring(0, 10) + '\n' + 'offsetHeight: ' + this.label.nativeElement.offsetHeight + ' ' + lineHeightParsed);
        this.renderer.setStyle(
          this.label.nativeElement,
          'top', '-7px'
        );
        this.renderer.removeStyle(this.formElement.nativeElement, 'margin-top');
      }
    }

  }

  strNoE(a: any): boolean {
    return this.gs.strNoE(a);
  }
}
