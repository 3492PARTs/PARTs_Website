import { Component, OnInit, ContentChildren, QueryList, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormElementGroupComponent } from '../form-element-group/form-element-group.component';
import { FormElementComponent } from '../form-element/form-element.component';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})

export class FormComponent implements OnInit {
  @Output() SubmitFunction = new EventEmitter();

  @ContentChildren(FormElementComponent, { descendants: true }) formElements = new QueryList<FormElementComponent>();
  //@ContentChildren(FormElementGroupComponent) formElementGroups = new QueryList<FormElementGroupComponent>();

  constructor() { }

  ngOnInit() { }

  reset() {
    this.formElements.forEach(eachObj => {
      eachObj.reset();
    });

    /*this.formElementGroups.forEach(eachObj => {
      eachObj.formElements.forEach(eachObj2 => {
        eachObj2.reset();
      });
    });*/
  }

  validateAllFelids(): boolean {
    // Returns true if all fields ARE valid
    let valid = true;
    this.formElements.forEach(eachObj => {
      const v = eachObj.isInvalid();
      if (valid && v) {
        valid = false;
      }
    });

    /*this.formElementGroups.forEach(eachObj => {
      eachObj.formElements.forEach(eachObj2 => {
        const v = eachObj2.isInvalid();
        if (valid && v) {
          valid = false;
        }
      });
    });*/
    return valid;
  }

  onSubmit(f: NgForm) {
    this.formElements.forEach(eachObj => {
      eachObj.Touched = true;
    });

    /*this.formElementGroups.forEach(eachObj => {
      eachObj.formElements.forEach(eachObj2 => {
        eachObj2.Touched = true;
      });
    });*/

    if (this.validateAllFelids()) {
      this.SubmitFunction.emit();
      this.reset();
    }
  }
}
