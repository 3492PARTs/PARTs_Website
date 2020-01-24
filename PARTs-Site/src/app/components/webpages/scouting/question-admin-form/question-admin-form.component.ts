import { Component, OnInit, Input } from '@angular/core';
import { GeneralService, RetMessage } from 'src/app/services/general/general.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-question-admin-form',
  templateUrl: './question-admin-form.component.html',
  styleUrls: ['./question-admin-form.component.scss']
})
export class QuestionAdminFormComponent implements OnInit {

  @Input() questionType: string;

  init: Init = new Init();
  scoutQuestion: ScoutQuestion = new ScoutQuestion();

  optionsTableCols: object[] = [
    { PropertyName: 'option', ColLabel: 'Option', Type: 'area' },
    { PropertyName: 'active', ColLabel: 'Active' }
  ];

  constructor(private gs: GeneralService, private http: HttpClient) { }

  ngOnInit() {
    this.questionInit();
  }

  questionInit(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_scout_question_init/', {
      params: {
        sq_typ: this.questionType
      }
    }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.init = Response as Init;
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

  saveScoutQuestion(): void {
    this.gs.incrementOutstandingCalls();
    this.scoutQuestion.sq_typ = this.questionType;
    this.http.post(
      'api/post_save_scout_question/', this.scoutQuestion
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
          this.scoutQuestion = new ScoutQuestion();
          this.questionInit();
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

  updateScoutQuestion(q: ScoutQuestion): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'api/post_update_scout_question/', q
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
          this.scoutQuestion = new ScoutQuestion();
          this.questionInit();
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

  toggleScoutQuestion(q: ScoutQuestion): void {
    if (!confirm('Are you sure you want to toggle this question?')) {
      return null;
    }

    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_toggle_scout_question/', {
      params: {
        sq_id: q.sq_id.toString()
      }
    }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
          this.questionInit();
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

  addOption(list: any): void {
    list.push(new QuestionOption());
  }

  toggleOption(op: QuestionOption): void {
    if (!confirm('Are you sure you want to toggle this option?')) {
      return null;
    }

    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_toggle_option/', {
      params: {
        q_opt_id: op.q_opt_id.toString()
      }
    }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
          this.questionInit();
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

}

export class ScoutQuestion {
  sq_id: number;
  season: number;
  sq_typ: string;
  question_typ: string;
  question: string;
  order: number
  active = 'y';
  void_ind: string;
  answer = '';

  options: QuestionOption[] = [];
}

export class QuestionOption {
  q_opt_id: number;
  sfq_id: number;
  spq_id: number;
  option: string;
  active = 'y';
  void_ind: string;
}

export class QuestionType {
  question_typ: string;
  question_typ_nm: string;
  void_ind: string;
}

export class Init {
  questionTypes: QuestionType[] = [];
  scoutQuestions: ScoutQuestion[] = [];
}
