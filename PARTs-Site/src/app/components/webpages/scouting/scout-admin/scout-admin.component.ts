import { Component, OnInit } from '@angular/core';
import { GeneralService, RetMessage } from 'src/app/services/general/general.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-scout-admin',
  templateUrl: './scout-admin.component.html',
  styleUrls: ['./scout-admin.component.scss']
})
export class ScoutAdminComponent implements OnInit {
  init: ScoutAdminInit = new ScoutAdminInit();
  season: number;
  newSeason: number;
  delSeason: number;
  event: number;
  eventList: Event[] = [];
  scoutFieldQuestion: ScoutQuestion = new ScoutQuestion();
  scoutPitQuestion: ScoutQuestion = new ScoutQuestion();

  syncSeasonResponse = new RetMessage();

  optionsTableCols: object[] = [
    { PropertyName: 'option', ColLabel: 'Option', Type: 'area' },
    { PropertyName: 'active', ColLabel: 'Active' }
  ];


  constructor(private gs: GeneralService, private http: HttpClient) { }

  ngOnInit() {
    this.adminInit();
  }

  adminInit(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_scout_admin_init/'
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.init = Response as ScoutAdminInit;

          if (this.init.currentSeason.season_id) {
            this.season = this.init.currentSeason.season_id;
          }

          if (this.init.currentEvent.event_id) {
            this.event = this.init.currentEvent.event_id;
          }

          this.buildEventList();

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

  syncSeason(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_sync_season/', {
      params: {
        season_id: this.season.toString()
      }
    }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          this.syncSeasonResponse = Response as RetMessage;
          this.adminInit();
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

  setSeason(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_set_season/', {
      params: {
        season_id: this.season.toString(),
        event_id: this.event.toString()
      }
    }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
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

  buildEventList(): void {
    this.eventList = this.init.events.filter(item => item.season === this.season);
  }

  addSeason(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_add_season/', {
      params: {
        season: this.newSeason.toString()
      }
    }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
          this.adminInit();
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

  deleteSeason(): void {
    if (!confirm('Are you sure you want to delete this season?\nDeleting this season will result in all associated data being reomved.')) {
      return null;
    }

    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_delete_season/', {
      params: {
        season_id: this.delSeason.toString()
      }
    }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
          this.adminInit();
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

  saveScoutFieldQuestion(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'api/post_save_scout_field_question/', this.scoutFieldQuestion
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
          this.scoutFieldQuestion = new ScoutQuestion();
          this.adminInit();
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

  updateScoutFieldQuestion(q: ScoutQuestion): void {
    this.gs.incrementOutstandingCalls();
    if (q.options.length <= 0) {
      q.options = [];
    }
    this.http.post(
      'api/post_update_scout_field_question/', q
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
          this.scoutFieldQuestion = new ScoutQuestion();
          this.adminInit();
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

  deleteScoutFieldQuestion(q: ScoutQuestion): void {
    if (!confirm('Are you sure you want to toggle this question?')) {
      return null;
    }

    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_delete_scout_field_question/', {
      params: {
        sfq_id: q.sq_id.toString()
      }
    }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
          this.adminInit();
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

  ToggleOption(op: QuestionOption): void {
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
          this.adminInit();
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

  saveScoutPitQuestion(): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'api/post_save_scout_pit_question/', this.scoutPitQuestion
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
          this.scoutPitQuestion = new ScoutQuestion();
          this.adminInit();
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

  updateScoutPitQuestion(q: ScoutQuestion): void {
    this.gs.incrementOutstandingCalls();
    this.http.post(
      'api/post_update_scout_pit_question/', q
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
          this.scoutPitQuestion = new ScoutQuestion();
          this.adminInit();
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

  deleteScoutPitQuestion(q: ScoutQuestion): void {
    if (!confirm('Are you sure you want to toggle this question?')) {
      return null;
    }

    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/get_delete_scout_pit_question/', {
      params: {
        sfq_id: q.sq_id.toString()
      }
    }
    ).subscribe(
      Response => {
        if (this.gs.checkResponse(Response)) {
          alert((Response as RetMessage).retMessage);
          this.adminInit();
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

export class Season {
  season_id: number;
  season: string;
  current: string;
}

export class Event {
  event_id: number;
  season: number;
  event_nm: string;
  date_st: Date;
  event_cd: string;
  date_end: Date;
  current: string;
  void_ind: string;
}

export class QuestionType {
  question_typ: string;
  question_typ_nm: string;
  void_ind: string;
}

export class ScoutAdminInit {
  seasons: Season[] = [];
  events: Event[] = [];
  currentSeason: Season = new Season();
  currentEvent: Event = new Event();
  questionTypes: QuestionType[] = [];
  scoutFieldQuestions: ScoutQuestion[] = [];
  scoutPitQuestions: ScoutQuestion[] = [];
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
