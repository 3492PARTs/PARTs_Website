import { CommonModule } from '@angular/common';
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
import { AppSize, GeneralService } from '../../../services/general.service';
import { NavigationService, NavigationState } from '../../../services/navigation.service';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { ClickInsideDirective } from '../../../directives/click-inside/click-inside.directive';
import { ClickOutsideDirective } from '../../../directives/click-outside/click-outside.directive';
import { OwlDateTimeModule, OwlNativeDateTimeModule, PickerMode } from '@danielmoncada/angular-datetime-picker';


@Component({
  selector: 'app-form-element',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, ClickInsideDirective, ClickOutsideDirective, OwlDateTimeModule, OwlNativeDateTimeModule],
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
  @Input() MaxWidth = 'auto';
  private originalMinWidth = '';
  @Input() Placeholder = '';
  @Input() Rows: number | null = 0;
  //@Input() SelectDisplayValue = '';
  @Input() BindingProperty: string | null = null;
  @Input() DisplayProperty: string | null = null;
  @Input() DisplayProperty2: string | null = null;

  @Input() Name = '';

  @Input() Type = 'text';
  @Input() PickerMode: PickerMode | null = null;
  _PickerMode: PickerMode = 'popup';

  @Input()
  set SelectList(sl: any) {
    this.gs.triggerChange(() => {
      this._SelectList = sl;

      if (['multiCheckbox', 'multiSelect'].includes(this.Type) && this._SelectList) {
        let tmp = JSON.parse(JSON.stringify(this._SelectList));
        //this.gs.devConsoleLog(tmp);
        tmp.forEach((e: any) => {
          e['checked'] = this.gs.strNoE(e['checked']) ? (this.Type === 'multiSelect' ? false : '') : e['checked'];
          if (this.Model) {
            if (typeof this.Model === 'string') {
              if (e[this.DisplayProperty || ''] === 'Other') {
                let other = '';
                this.Model.split(',').map(s => s = s.trim()).forEach((option: any) => {
                  let match = false;
                  // TODO: Revisit this logic i dont think this loop is needed
                  tmp.forEach((element: any) => {
                    if (option === element[this.BindingProperty || '']) match = true;
                  });

                  if (!match)
                    e['checked'] = option;
                });

              }
              else
                e['checked'] = this.Model.split(',').map(s => s = s.trim()).includes(e[this.BindingProperty || '']).toString();
            }
            else
              this.Model.forEach((m: any) => {
                if (e[this.BindingProperty || ''] === m[this.BindingProperty || ''])
                  e['checked'] = m['checked'];
              });


          }
        });

        this.change(tmp);
      }

      this.gs.triggerChange(() => {
        this.setElementPositions();
      });
    });
  }
  _SelectList: any[] = [];
  //@Input() RadioList: any[] = [];
  //@Input() CheckboxList: any[] = [];
  @Input() DisplayEmptyOption = false;
  @Input() FieldSize: number | null = null;
  @Input() MinValue: number | null = null;
  @Input() MaxValue: number | null = null;
  //@Input() FormElementInline: boolean = true;

  //@Input() Validation = false;
  @Input() ValidationMessage = '';
  @Input() Required = false;
  @Input() Touched = false;
  @Input() Focused = false;
  @Input() Disabled = false;
  valid = true;
  hasValue = false;

  @Input() NumberIncDec = false;

  @Input() ValidityFunction?: Function;
  @Input() SelectComparatorFunction: (o1: any, o2: any) => boolean = (o1: any, o2: any) => {
    return JSON.stringify(o1) === JSON.stringify(o2);
  };

  @Input() Model: any;
  @Output() ModelChange = new EventEmitter();

  phoneMaskModel: string | null = null;
  //@Input() ModelProperty = '';

  //@Input() MultiModel: any = [];
  //@Output() MultiModelChange = new EventEmitter();

  @Output() FunctionCallBack: EventEmitter<any> = new EventEmitter();
  @Output() OnFocusOut: EventEmitter<any> = new EventEmitter();
  @Output() ResetFunction: EventEmitter<any> = new EventEmitter();

  @Input() TrueValue: any = true;
  @Input() FalseValue: any = false;

  LabelID = '';
  private fileData: File | null = null;
  fileName = '';

  @Input() ImageChangeEvent: (e: any) => void = () => { };

  @ViewChild('multiSelectDropdown', { read: ElementRef, static: false }) dropdown: ElementRef | undefined = undefined;
  @ViewChild('multiSelect', { read: ElementRef, static: false }) multiSelect: ElementRef | undefined = undefined;
  private expanded = false;

  @ViewChild('fileUpload') fileUpload: { nativeElement: { value: string; }; } = { nativeElement: { value: '' } };

  private stopwatchRun = false;
  private stopwatchHour = 0;
  private stopwatchMinute = 0;
  private stopwatchSecond = 0;
  private stopwatchLoopCount = 0;

  @Input() IconOnly = false;

  @ViewChild('formElement', { read: ElementRef, static: false }) formElement: ElementRef | undefined = undefined;
  @ViewChild('label', { read: ElementRef, static: false }) label: ElementRef | undefined = undefined;
  @ViewChild('input', { read: ElementRef, static: false }) input: ElementRef | undefined = undefined;

  @ViewChild('multiSelectText', { read: ElementRef, static: false }) multiSelectText: ElementRef | undefined = undefined;
  @ViewChild('validationIndicator', { read: ElementRef, static: false }) validationIndicator: ElementRef | undefined = undefined;

  //private resizeTimeout: number | null | undefined;

  constructor(private gs: GeneralService, private renderer: Renderer2, private navigationService: NavigationService) { }

  ngOnInit() {
    this.LabelID = this.gs.getNextGsId();
    this.originalMinWidth = this.MinWidth;

    if (!this.FieldSize) this.FieldSize = 2000;

    if (this.gs.strNoE(this.Name) && !this.gs.strNoE(this.LabelText))
      this.Name = this.LabelText;

    if (this.Type === 'checkbox' && this.LabelText.toLocaleLowerCase() === 'other') {
      this.Width = '100%';
    }
    //else if (this.Type === 'number' && this.gs.strNoE(this.Model) && this.MinValue !== null && this.MinValue !== undefined) {
    //window.setTimeout(() => { this.change(this.MinValue); }, 1);
    //}
    else if (this.Type === 'phone') {
      this.phoneMaskFn(this.Model, true);
    }
    else if (this.Type === 'text') {
      if (typeof this.Model === 'number' && isNaN(this.Model)) {
        this.gs.triggerChange(() => {
          this.change('');
        });
      }
    }

    this.markRequired();

    this.navigationService.currentNavigationState.subscribe(ns => {
      if (ns === NavigationState.collapsed && this.Type != 'select') this.MinWidth = 'auto';
      this.setElementPositions();

    });

    this.setDatePanel();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'Model':
            let modelChanges = changes['Model'];
            if (this.Type === 'phone' && !modelChanges.firstChange) {
              if (this.formatPhone(modelChanges.currentValue) !== this.phoneMaskModel) {
                //console.log(this.Model);
                //console.log(this.phoneMaskModel);
                //console.log(changes);
                this.phoneMaskFn(modelChanges.currentValue);
              }
            }
            this.markRequired();
            break;
          case 'Disabled':
          case 'Required':
            this.markRequired();
            break;
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
    this.setElementPositions();

    this.gs.triggerChange(() => {
      if (this.Width === 'auto' && this.Type === 'number') {
        this.Width = '100px';
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setElementPositions();
    this.setDatePanel();
  }

  setElementPositions(): void {
    this.positionMultiSelect();

    this.resizeFormElement();

    this.setIndicatorPosition();
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
      if (!this.gs.strNoE(this.Model)) {
        if (this.MinValue !== null && this.MinValue !== undefined) {
          this.Model = newValue >= this.MinValue ? newValue : this.MinValue;
        }
        if (this.MaxValue !== null && this.MaxValue !== undefined) {
          this.Model = newValue <= this.MaxValue ? newValue : this.MaxValue;
        }
      }

      this.ModelChange.emit(this.Model);
    }
    else if (index !== -1) {
      this.Model[index]['checked'] = newValue;
      //this._SelectList[index]['checked'] = newValue;
      this.ModelChange.emit(this.Model);
    }
    else {
      if (newValue === null) {
        newValue = new Object();
      }
      this.Model = newValue;
      this.ModelChange.emit(newValue);
    }

    this.touchIt();
    if (!this.isInvalid()) this.FunctionCallBack.emit();
  }

  private positionMultiSelect(): void {
    if (this.Type === 'multiSelect' && this.multiSelect && this.dropdown) {
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

  markRequired(): void {
    this.touchIt();
    this.isInvalid();
  }

  isInvalid(): boolean {
    // validate if the element is a valid one or not
    let invalid = false;
    if (!this.Disabled) {
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
        if (['multiCheckbox', 'multiSelect'].includes(this.Type) && Array.isArray(this.Model)) {
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
    }

    this.valid = !invalid;

    // move indicator for certain types
    this.setIndicatorPosition();

    return invalid;
  }

  isFormElementValid(): boolean {
    return !this.Disabled && this.valid && this.Required && this.Touched;
  }

  isFormElementInvalid(): boolean {
    return !this.Disabled && !this.valid && this.Touched;
  }

  isFormElementRequired(): boolean {
    return !this.Disabled && this.Required && this.Touched && this.hasValue;
  }

  setIndicatorPosition(): void {
    //this.gs.triggerChange(() => {
    if (this.validationIndicator && this.validationIndicator.nativeElement) {
      if (['radio', 'multiCheckbox', 'checkbox'].includes(this.Type)) {
        if (this.label) {
          if (['radio', 'multiCheckbox'].includes(this.Type))
            this.renderer.setStyle(this.validationIndicator.nativeElement, 'left', 'calc(' + this.label.nativeElement.scrollWidth + 'px + 1rem)');
          if (['checkbox'].includes(this.Type))
            this.renderer.setStyle(this.validationIndicator.nativeElement, 'left', 'calc(' + this.label.nativeElement.scrollWidth + 'px + 1rem + 13px)');
        }
      }
      else if (this.Type === 'area') {
        this.renderer.setStyle(this.validationIndicator.nativeElement, 'right', `1.5rem`);
      }
      else if (this.input && this.input.nativeElement) {
        let width = this.input.nativeElement.offsetWidth;

        let offset = '0.5rem';

        if (this.Type === 'select')
          offset = '1.25rem'
        else if (['date', 'datetime'].includes(this.Type))
          offset = '2.8rem'

        this.renderer.setStyle(this.validationIndicator.nativeElement, 'left', `calc(${width}px - 24px - ${offset})`); //24 px is the size of the indicator
      }
    }
    //});

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

      if (tmp.length > 16) {
        this.fileName = tmp.substring(0, (15 - ext.length)).trim() + '....' + ext;
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
    if (this.dropdown) {
      if (this.expanded) {
        this.renderer.setStyle(
          this.dropdown.nativeElement,
          'height', '0px'
        );
        this.gs.triggerChange(() => {
          if (this.dropdown)
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
  }

  multiSelectClose(): void {
    if (this.dropdown) {
      this.renderer.setStyle(
        this.dropdown.nativeElement,
        'height', '0px'
      );

      this.gs.triggerChange(() => {
        if (this.dropdown)
          this.renderer.setStyle(
            this.dropdown.nativeElement,
            'visibility', 'hidden'
          );
      }, 150);

      this.expanded = false;
    }
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

      /*
      if (this.stopwatchMinute === 60) {
        this.stopwatchHour++;
        this.stopwatchMinute = 0;
        this.stopwatchSecond = 0;
      }
      */

      this.stopwatchSetValue();
      this.gs.triggerChange(this.stopwatchRunFunction.bind(this), 10);
    }
  }

  stopwatchSetValue(): void {
    //this.Model = `${(this.stopwatchHour < 10 ? '0' : '')}${this.stopwatchHour}hr ${(this.stopwatchMinute < 10 ? '0' : '')}${this.stopwatchMinute}min ${(this.stopwatchSecond < 10 ? '0' : '')}${this.stopwatchSecond}sec`;
    this.Model = `${(this.stopwatchMinute < 10 ? '0' : '')}${this.stopwatchMinute}min ${(this.stopwatchSecond < 10 ? '0' : '')}${this.stopwatchSecond}sec ${this.stopwatchLoopCount}ms`;
    this.change(this.Model);
  }

  resizeFormElement(): void {
    // This is to make sure the form element is the right width for the label
    /*window.setTimeout(() => {
      if (!['radio', 'checkbox', 'multiCheckbox'].includes(this.Type) && this.label) {
        const width = (this.Type === 'multiSelect' ? (this.multiSelectText.nativeElement.clientWidth + 20) : this.label.nativeElement.clientWidth) + 32;

        if (this.originalMinWidth === 'auto') {
          this.MinWidth = width + 'px';
        }
      }

      this.positionLabel();
    }, 0);*/
    this.positionLabel();
  }

  positionLabel(): void {
    if (this.label && this.label.nativeElement) {
      //this.gs.triggerChange(() => {
      if (this.label && this.Type !== 'checkbox') {
        if (this.input) {
          if (this.Type === 'number') {
            const width = this.input.nativeElement.offsetWidth;
            this.renderer.setStyle(
              this.label.nativeElement,
              'max-width', `calc(${width}px - 16px - 16px)`
            );
          }
          else {
            const width = this.input.nativeElement.offsetWidth;
            this.renderer.setStyle(
              this.label.nativeElement,
              'max-width', `calc(${width}px - 16px - 16px - 16px)`
            );
          }
        }


        const { lineHeight } = getComputedStyle(this.label.nativeElement);
        const lineHeightParsed = parseFloat(lineHeight.split('px')[0]);
        const amountOfLinesTilAdjust = 1.0;
        /*
        if (this.LabelText.includes('ou to the PARTs program')) {
          let x = 0;
        }*/

        if (this.formElement) {
          if (this.label.nativeElement.offsetHeight > (lineHeightParsed * amountOfLinesTilAdjust)) {
            //if (this.LabelText.includes('Lining up '))
            //  this.gs.devConsoleLog('form element - positionLabel', 'your h1 now wrapped ' + this.LabelText.substring(0, 10) + '\n' + 'offsetHeight: ' + this.label.nativeElement.offsetHeight + ' ' + lineHeightParsed);
            const labelOffset = this.label.nativeElement.offsetHeight - (lineHeightParsed / 2.0) - 3; //im hoping i can add this -2px offset to make it look a little beter 
            this.renderer.setStyle(
              this.label.nativeElement,
              'top', '-' + labelOffset + 'px'
            );
            this.renderer.setStyle(
              this.formElement.nativeElement,
              'margin-top', labelOffset + 'px'
            );
          }
          else {
            //if (this.LabelText.includes('Lining up '))
            //  this.gs.devConsoleLog('form element - positionLabel', 'your h1 on one line: ' + this.LabelText.substring(0, 10) + '\n' + 'offsetHeight: ' + this.label.nativeElement.offsetHeight + ' ' + lineHeightParsed);
            this.renderer.setStyle(
              this.label.nativeElement,
              'top', this.Type === 'rating' ? '-12px' : '-4px'
            );
            this.renderer.removeStyle(this.formElement.nativeElement, 'margin-top');
          }
        }
      }
      //});
    }
  }

  strNoE(a: any): boolean {
    return this.gs.strNoE(a);
  }

  formatPhone(value: string): string {
    // This code manipulates the input to look like a phone number.
    let phone = (value || '').replace(/\D/g, '');
    phone = phone.slice(0, 10);
    const areaCode = phone.slice(0, 3);
    const prefix = phone.slice(3, 6);
    const suffix = phone.slice(6, 10);

    let ret = areaCode.length >= 1 ? '(' : '';
    ret += areaCode;
    ret += prefix.length > 0 ? ') ' : '';
    ret += prefix;
    ret += suffix.length >= 1 ? '-' : '';
    ret += suffix;

    return ret;
  }

  phoneMaskFn(value: string, init = false) {
    this.phoneMaskModel = '';

    // This code manipulates the input to look like a phone number.
    let phone = (value || '').replace(/\D/g, '').slice(0, 10);
    /*phone = phone.slice(0, 10);
    const areaCode = phone.slice(0, 3);
    const prefix = phone.slice(3, 6);
    const suffix = phone.slice(6, 10);*/

    this.gs.triggerChange(() => {
      /*this.phoneMaskModel = areaCode.length >= 1 ? '(' : '';
      this.phoneMaskModel += areaCode;
      this.phoneMaskModel += prefix.length > 0 ? ') ' : '';
      this.phoneMaskModel += prefix;
      this.phoneMaskModel += suffix.length >= 1 ? '-' : '';
      this.phoneMaskModel += suffix;*/
      const val = this.formatPhone(value);
      this.phoneMaskModel = !this.gs.strNoE(val) ? val : null;

      if (!init) this.change(phone);
    });
  };

  increment(): void {
    if (this.gs.strNoE(this.Model)) this.Model = 0;
    this.Model++;
    this.change(this.Model);
  }

  decrement(): void {
    if (this.gs.strNoE(this.Model)) this.Model = 0;
    if (this.Model > 0) this.Model--;
    this.change(this.Model);
  }

  setDatePanel(): void {
    if (['date', 'datetime'].includes(this.Type))
      if (this.PickerMode && !this.gs.strNoE(this.PickerMode))
        this._PickerMode = this.PickerMode;
      else
        if (this.gs.getAppSize() <= AppSize.SM)
          this._PickerMode = 'dialog';
        else {
          this._PickerMode = 'popup';
        }
  }

  runResetFunction(): void {
    this.ResetFunction.emit();
  }

  setRating(n: number): void {
    if (!this.Disabled)
      this.change(n);
  }
}
