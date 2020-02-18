import { Component, OnInit, AfterContentInit,ElementRef,ContentChildren,QueryList,ViewChild,AfterViewInit  } from '@angular/core';
import { NgForm,AbstractControl, FormControl } from '@angular/forms';
import { FormElementComponent } from '../form-element/form-element.component';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})

export class FormComponent implements AfterContentInit {
  constructor() { }

  @ContentChildren(FormElementComponent) formElements: QueryList<FormElementComponent>;
 // @ViewChild('GenericForm', {read: NgForm, static: true}) GenericForm: NgForm;
  //elements: FormElementComponent[] = [];

  ngAfterContentInit() {}

  ResetForm(){
    this.formElements.forEach(eachObj => {
      eachObj.ResetFormElement();
    });
  }

  FlagAllRequiredFeilds(){
    this.formElements.forEach(eachObj => {
      eachObj.TouchIt();

    });
  }

  //ngOnInit() { }



}
