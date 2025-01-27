import { Component, OnInit, ContentChildren, QueryList, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FormElementGroupComponent } from '../form-element-group/form-element-group.component';
import { FormElementComponent } from '../form-element/form-element.component';
import { Banner } from '../../../models/api.models';
import { GeneralService } from '../../../services/general.service';
import { TableComponent } from '../table/table.component';
@Component({
  selector: 'app-form',
  imports: [FormsModule],
  templateUrl: './form.component.html'
})

export class FormComponent implements OnInit {
  @Input() FormElements: QueryList<FormElementComponent> = new QueryList<FormElementComponent>();

  @Output() SubmitFunction = new EventEmitter();

  @ContentChildren(FormElementComponent, { descendants: true }) formElements = new QueryList<FormElementComponent>();
  //@ContentChildren(FormElementGroupComponent) formElementGroups = new QueryList<FormElementGroupComponent>();
  @ContentChildren(TableComponent, { descendants: true }) tables = new QueryList<TableComponent>();

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
    this.formElements.forEach(fec => {
      ret += this.validateFormElement(fec);
    });

    this.FormElements.forEach(fec => {
      ret += this.validateFormElement(fec);
    });

    this.tables.forEach(t => {
      let tableRet = '';
      t.formElements.forEach(fec => {
        tableRet += this.validateFormElement(fec);
      });

      if (tableRet.length > 0)
        ret += `${t.TableName}:\n ${tableRet}`;
    });
    return ret;
  }

  private validateFormElement(fec: FormElementComponent): string {
    if (fec) {
      fec.touchIt();
      if (fec.isInvalid())
        return `&bull;  ${fec.Name} is invalid\n`;
    }
    return '';
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
      this.gs.addBanner(new Banner(0, ret, 3500));
    }
  }
}
