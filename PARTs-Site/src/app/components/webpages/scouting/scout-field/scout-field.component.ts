import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeneralService } from 'src/app/services/general/general.service';

@Component({
  selector: 'app-scout-field',
  templateUrl: './scout-field.component.html',
  styleUrls: ['./scout-field.component.scss']
})
export class ScoutFieldComponent implements OnInit {
  scoutFieldQuestions: ScoutFieldQuestion[];

  constructor(private http: HttpClient, private gs: GeneralService) { }

  ngOnInit() {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_scout_field_questions/'
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.scoutFieldQuestions = Response as ScoutFieldQuestion[];
        }
        this.gs.decrementOutstandingCalls();
      },
      Error => {
        const tmp = Error as { error: { detail: string } };
        console.log('error', Error);
        alert(tmp.error.detail);
        this.gs.decrementOutstandingCalls();
      }
    );
  }

  save(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'api/post_save_scout_field_answers/',
      {}
    ).subscribe(
      Response => {
        this.scoutFieldQuestions = Response as ScoutFieldQuestion[];
        this.gs.decrementOutstandingCalls();
      },
      Error => {
        const tmp = Error as { error: { non_field_errors: [1] } };
        console.log('error', Error);
        alert(tmp.error.non_field_errors[0]);
        this.gs.decrementOutstandingCalls();
      }
    );
  }

}

export class ScoutFieldQuestion {
  order: number;
  question: string;
  question_typ: string;
  season: number;
  sfq_id: number;
  void_ind: string;
  answer: string;
}
