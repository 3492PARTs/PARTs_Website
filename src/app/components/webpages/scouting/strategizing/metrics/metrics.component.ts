import { Component, OnInit } from '@angular/core';
import { APIService } from '../../../../../services/api.service';
import { AuthCallStates, AuthService } from '../../../../../services/auth.service';
import { FieldForm, FieldResponse } from '../../../../../models/scouting.models';
import { ScoutingService } from '../../../../../services/scouting.service';
import { FormElementGroupComponent } from "../../../../atoms/form-element-group/form-element-group.component";
import { FormElementComponent } from "../../../../atoms/form-element/form-element.component";
import { CommonModule } from '@angular/common';
import { GeneralService } from '../../../../../services/general.service';
import { SafeHTMLPipe } from "../../../../../pipes/safe-html.pipe";
import { DisplayQuestionSvgComponent } from "../../../../elements/display-question-svg/display-question-svg.component";

@Component({
  selector: 'app-metrics',
  imports: [FormElementGroupComponent, FormElementComponent, CommonModule, SafeHTMLPipe, DisplayQuestionSvgComponent],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.scss'
})
export class MetricsComponent implements OnInit {

  fieldForm!: FieldForm;
  fieldResponses: FieldResponse[] = [];
  fieldResponse!: FieldResponse;

  constructor(private api: APIService, private authService: AuthService, private ss: ScoutingService, private gs: GeneralService) {
    this.authService.authInFlight.subscribe(r => {
      if (r === AuthCallStates.comp) {
        this.init();
      }
    });
  }

  ngOnInit(): void {

  }

  init(): void {
    this.api.get(true, 'scouting/field/scouting-responses/', undefined, (result: FieldResponse[]) => {
      this.fieldResponses = result;
    });

    this.ss.getFieldFormFormFromCache().then(result => {
      if (result)
        this.fieldForm = result.field_form;
    });
  }

  setFieldResponse(r: FieldResponse): void {
    const copy = this.gs.cloneObject(r) as FieldResponse;
    copy.answers.forEach(a => {
      a.flow_answers.forEach(qfa => {
        try {
          qfa.value = JSON.parse(qfa.value);
        }
        catch (e) { }
      });
    });

    this.fieldResponse = copy;
  }

}
