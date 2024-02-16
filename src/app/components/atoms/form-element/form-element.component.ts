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
  SimpleChanges,
  OnChanges
} from '@angular/core';

import { GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-form-element',
  templateUrl: './form-element.component.html',
  styleUrls: ['./form-element.component.scss']
})
export class FormElementComponent implements OnInit, AfterViewInit, DoCheck, OnChanges {
  @Input() FormGroup = false;
  @Input() FormGroupInline = false;
  @Input() RadioGroupStacked = false;
  //@Input() FormInline = false;
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
    window.setTimeout(() => {
      this._SelectList = sl;

      if (['multiCheckbox', 'multiSelect'].includes(this.Type) && this._SelectList) {
        let tmp = JSON.parse(JSON.stringify(this._SelectList));
        this.gs.devConsoleLog(tmp);
        tmp.forEach((e: any) => {
          e['checked'] = this.gs.strNoE(e['checked']) ? (this.Type === 'multiSelect' ? false : '') : e['checked'];
          if (this.Model) {
            if (typeof this.Model === 'string') {
              if (e[this.DisplayProperty] === 'Other') {
                let other = '';
                this.Model.split(',').forEach((option: any) => {
                  let match = false;
                  // TODO: Revisit this logic i dont think this loop is needed
                  tmp.forEach((element: any) => {
                    if (option === element[this.BindingProperty]) match = true;
                  });

                  if (!match)
                    e['checked'] = option;
                });

              }
              else
                e['checked'] = this.Model.split(',').includes(e[this.BindingProperty]).toString();
            }
            else
              this.Model.forEach((m: any) => {
                if (e[this.BindingProperty] === m[this.BindingProperty])
                  e['checked'] = m['checked'];
              });


          }
        });

        this.change(tmp);
      }
      this.positionLabel();
    }, 0);
  }
  _SelectList: any[] = [];
  //@Input() RadioList: any[] = [];
  //@Input() CheckboxList: any[] = [];
  @Input() DisplayEmptyOption = false;
  @Input() FieldSize = 524288;
  @Input() MinValue!: number;
  @Input() MaxValue!: number;
  //@Input() FormElementInline: boolean = true;

  //@Input() Validation = false;
  @Input() ValidationMessage = '';
  @Input() Required = false;
  @Input() Touched = false;
  @Input() Focused = false;
  @Input() Disabled = false;
  valid = true;
  hasValue = false;

  @Input() ValidityFunction?: Function;
  @Input() SelectComparatorFunction!: (o1: any, o2: any) => boolean;

  @Input() Model: any;
  @Output() ModelChange = new EventEmitter();

  phoneMaskModel = '';
  //@Input() ModelProperty = '';

  //@Input() MultiModel: any = [];
  //@Output() MultiModelChange = new EventEmitter();

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

  private stopwatchRun = false;
  private stopwatchHour = 0;
  private stopwatchMinute = 0;
  private stopwatchSecond = 0;
  private stopwatchLoopCount = 0;

  @Input() IconOnly = false;

  @ViewChild('formElement', { read: ElementRef, static: false }) formElement: ElementRef = new ElementRef(null);
  @ViewChild('label', { read: ElementRef, static: false }) label: ElementRef = new ElementRef(null);
  @ViewChild('multiSelectText', { read: ElementRef, static: false }) multiSelectText: ElementRef = new ElementRef(null);
  @ViewChild('validationIndicator', { read: ElementRef, static: false }) validationIndicator: ElementRef = new ElementRef(null);

  constructor(private gs: GeneralService, private renderer: Renderer2) { }

  ngOnInit() {
    this.LabelID = this.gs.getNextGsId();

    if (this.Type === 'checkbox' && this.LabelText.toLocaleLowerCase() === 'other') {
      this.Width = '100%';
    }
    else if (this.Type === 'number' && this.gs.strNoE(this.Model) && this.MinValue !== null && this.MinValue !== undefined) {
      window.setTimeout(() => { this.change(this.MinValue); }, 1);
    }
    else if (this.Type === 'phone') {
      this.phoneMaskFn(this.Model, true);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'Model': {
            if (this.Type === 'phone') {
              //console.log(changes);
              if (this.gs.strNoE(changes['Model'].previousValue) && !this.gs.strNoE(changes['Model'].currentValue)) this.phoneMaskFn(changes['Model'].currentValue);
            }
          }
        }
      }
    }
  }


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

    //this.positionLabel();

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

    //this.positionLabel();

  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    this.positionMultiSelect();
  }

  change(newValue: any, index = -1) {
    if (this.Type === 'checkbox' && this.LabelText.toLowerCase() !== 'other') {
      this.Model = newValue;
      if (newValue.target.checked) {
        this.ModelChange.emit(this.TrueValue);
      } else {
        this.ModelChange.emit(this.FalseValue);
      }
    }
    else if (this.Type == 'number') {
      this.Model = newValue;
      if (this.MinValue !== null && this.MinValue !== undefined) {
        this.Model = newValue >= this.MinValue ? newValue : this.MinValue;
      }
      if (this.MaxValue !== null && this.MaxValue !== undefined) {
        this.Model = newValue <= this.MaxValue ? newValue : this.MaxValue;
      }
      this.ModelChange.emit(this.Model);
    }
    else if (index !== -1) {
      this.Model[index]['checked'] = newValue;
      //this._SelectList[index]['checked'] = newValue;
      this.ModelChange.emit(this.Model);
    }
    else {
      this.Model = newValue;
      this.ModelChange.emit(newValue);
    }

    this.touchIt();
    if (!this.isInvalid()) this.FunctionCallBack.emit();
  }
  /*
    multiChange(newValue: any, index: number) {
      this.Model[index]['checked'] = newValue;
      this._SelectList[index]['checked'] = newValue;
      this.ModelChange.emit(this.Model);
      this.touchIt();
      if (!this.isInvalid()) this.FunctionCallBack.emit();
    }*/

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
    // validate if the element is a valid one or not
    let invalid = false;
    if (this.Touched) {
      if (this.ValidityFunction != null) {
        invalid = !this.ValidityFunction();
      }
      else if (this.Type === 'phone' && !this.strNoE(this.Model)) {
        invalid = !(this.Model.length === 10);
      }
      else if (this.Type === 'email' && this.Model && !this.strNoE(this.Model)) {
        const emailRegex =
          new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/, "gm");
        invalid = !emailRegex.test(this.Model);
      }
    }

    // if the element is populated or not
    if (!this.strNoE(this.Model)) {
      this.hasValue = false;
      if (['multiCheckbox', 'multiSelect'].includes(this.Type)) {
        this.Model.forEach((e: any) => {
          let s = JSON.stringify(e.checked || '').replace('"', '').replace('"', '').replace('false', '');
          if (!this.strNoE(s))
            this.hasValue = true;
        });
      }
      else
        this.hasValue = true;
    }
    else {
      this.hasValue = false;
      //invalid = this.Required;
    }

    if (this.Required && !this.hasValue) invalid = true;

    this.valid = !invalid;

    // move indicator for certain types
    if (['radio'].includes(this.Type))
      window.setTimeout(() => {
        if (this.label && this.validationIndicator) {
          this.renderer.setStyle(this.validationIndicator.nativeElement, 'right', 'calc(' + this.label.nativeElement.scrollWidth + 'px - 2.2rem)');
        }
      }, 1);

    if (['radio', 'multiCheckbox'].includes(this.Type))
      window.setTimeout(() => {
        if (this.label && this.validationIndicator) {
          this.renderer.setStyle(this.validationIndicator.nativeElement, 'left', 'calc(' + this.label.nativeElement.scrollWidth + 'px + 1rem)');
        }
      }, 1);

    return invalid;
  }

  touchIt() {
    this.Touched = true;
  }

  focusIn() {
    if (!this.Focused) {
      this.Focused = true;
      this.isInvalid();
      this.touchIt();
    }
  }

  focusOut() {
    if (this.Focused) {
      this.Focused = false;
      this.isInvalid();
      this.OnFocusOut.emit();
    }
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
      this.change(true, i);
    }
  }

  deselectAll(): void {
    for (let i = 0; i < this._SelectList.length; i++) {
      this.change(false, i);
    }
  }

  stopwatchStart(): void {
    this.stopwatchRun = true;
    this.stopwatchRunFunction();
  }

  stopwatchStop(): void {
    this.stopwatchRun = false;
  }

  stopwatchReset(): void {
    this.stopwatchHour = 0;
    this.stopwatchMinute = 0;
    this.stopwatchSecond = 0;
    this.stopwatchLoopCount = 0;
    this.stopwatchSetValue();
  }

  stopwatchRunFunction(): void {
    if (this.stopwatchRun) {
      this.stopwatchLoopCount++;

      if (this.stopwatchLoopCount === 100) {
        this.stopwatchSecond++;
        this.stopwatchLoopCount = 0;
      }

      if (this.stopwatchSecond === 60) {
        this.stopwatchMinute++;
        this.stopwatchSecond = 0;
      }

      if (this.stopwatchMinute === 60) {
        this.stopwatchHour++;
        this.stopwatchMinute = 0;
        this.stopwatchSecond = 0;
      }

      this.stopwatchSetValue();
      window.setTimeout(this.stopwatchRunFunction.bind(this), 10);
    }
  }

  stopwatchSetValue(): void {
    this.Model = `${(this.stopwatchHour < 10 ? '0' : '')}${this.stopwatchHour}hr ${(this.stopwatchMinute < 10 ? '0' : '')}${this.stopwatchMinute}min ${(this.stopwatchSecond < 10 ? '0' : '')}${this.stopwatchSecond}sec`;
    this.change(this.Model);
  }

  resizeFormElement(): void {
    // This is to make sure the form element is the right width for the label
    window.setTimeout(() => {
      if (!['radio', 'checkbox'].includes(this.Type) && this.label) {
        const width = (this.Type === 'multiSelect' ? (this.multiSelectText.nativeElement.clientWidth + 44) : this.label.nativeElement.clientWidth) + 32;
        if (this.MinWidth === 'auto') {
          this.MinWidth = width + 'px';
        }
      }
      if (this.LabelText.includes('Edit Team')) {
        let x = 0;
      }

      this.positionLabel();
    }, 0);
  }

  positionLabel(): void {
    window.setTimeout(() => {
      if (this.label && this.Type !== 'checkbox') {
        const { lineHeight } = getComputedStyle(this.label.nativeElement);
        const lineHeightParsed = parseInt(lineHeight.split('px')[0]);
        const amountOfLinesTilAdjust = 2;

        if (this.LabelText.includes('Edit Team')) {
          let x = 0;
        }

        // i need this to be . if i find a place where i need it to be
        // strictly this is my reminder that i need to find another solution
        if (this.label.nativeElement.offsetHeight >= (lineHeightParsed * amountOfLinesTilAdjust)) {
          //this.gs.devConsoleLog('your h1 now wrapped ' + this.LabelText.substring(0, 10) + '\n' + 'offsetHeight: ' + this.label.nativeElement.offsetHeight + ' ' + lineHeightParsed);
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
          //this.gs.devConsoleLog('your h1 on one line: ' + this.LabelText.substring(0, 10) + '\n' + 'offsetHeight: ' + this.label.nativeElement.offsetHeight + ' ' + lineHeightParsed);
          this.renderer.setStyle(
            this.label.nativeElement,
            'top', '-7px'
          );
          this.renderer.removeStyle(this.formElement.nativeElement, 'margin-top');
        }
      }
    }, 0);
  }

  strNoE(a: any): boolean {
    return this.gs.strNoE(a);
  }

  phoneMaskFn(value: string, init = false) {
    window.setTimeout(() => {
      this.phoneMaskModel = '';

      // This code manipulates the input to look like a phone number.
      let phone = (value || '').replace(/\D/g, '');
      phone = phone.slice(0, 10);
      const areaCode = phone.slice(0, 3);
      const prefix = phone.slice(3, 6);
      const suffix = phone.slice(6, 10);

      window.setTimeout(() => {
        this.phoneMaskModel = `(${areaCode}) ${prefix}-${suffix}`;
      }, 1);

      if (!init) this.change(phone);
    }, 1);
  };
}
