import { Component, OnInit, ContentChildren, QueryList, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FormElementGroupComponent } from '../form-element-group/form-element-group.component';
import { FormElementComponent } from '../form-element/form-element.component';
import { Banner, GeneralService } from 'src/app/services/general.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})

export class FormComponent implements OnInit {
  @Input() FormElements: QueryList<FormElementComponent> = new QueryList<FormElementComponent>();

  @Output() SubmitFunction = new EventEmitter();

  @ContentChildren(FormElementComponent, { descendants: true }) formElements = new QueryList<FormElementComponent>();
  //@ContentChildren(FormElementGroupComponent) formElementGroups = new QueryList<FormElementGroupComponent>();

  constructor(private gs: GeneralService) { }

  ngOnInit() { }

  reset() {
    this.formElements.forEach(eachObj => {
      eachObj.reset();
    });

    this.FormElements.forEach(eachObj => {
      eachObj.reset();
    });
  }

  validateAllFelids(): string {
    let ret = '';
    // Returns true if all fields ARE valid
    //let valid = true;
    this.formElements.forEach(eachObj => {
      eachObj.touchIt();
      const v = eachObj.isInvalid();
      /*if (valid && v) {
        valid = false;
      }*/
      if (v)
        ret += '&bull;  ' + eachObj.LabelText + ' is invalid\n'
    });

    this.FormElements.forEach(eachObj => {
      eachObj.touchIt();
      const v = eachObj.isInvalid();
      /*if (valid && v) {
        valid = false;
      }*/
      if (v)
        ret += '&bull;  ' + eachObj.LabelText + ' is invalid\n'
    });
    return ret;
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
    let ret = this.validateAllFelids();

    if (this.gs.strNoE(ret)) {
      this.SubmitFunction.emit();
      this.reset();
    }
    else {
      this.gs.addBanner(new Banner(ret, 3500));
    }
  }
}
