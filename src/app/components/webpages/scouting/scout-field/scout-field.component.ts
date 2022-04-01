import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeneralService, RetMessage } from 'src/app/services/general/general.service';
import { ScoutQuestion } from 'src/app/components/webpages/scouting/question-admin-form/question-admin-form.component';
import { AuthService } from 'src/app/services/auth.service';
import { ScoutFieldSchedule } from '../scout-admin/scout-admin.component';

@Component({
  selector: 'app-scout-field',
  templateUrl: './scout-field.component.html',
  styleUrls: ['./scout-field.component.scss']
})
export class ScoutFieldComponent implements OnInit, OnDestroy {
  teams: Team[] = [];
  team!: string;
  scoutQuestions: ScoutQuestion[] = [];
  scoutFieldSchedule: ScoutFieldSchedule = new ScoutFieldSchedule();
  scoutAutoQuestions: ScoutQuestion[] = [];
  scoutTeleopQuestions: ScoutQuestion[] = [];
  scoutOtherQuestions: ScoutQuestion[] = [];
  private checkScoutInterval: number | undefined;

  constructor(private http: HttpClient, private gs: GeneralService, private authService: AuthService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === 'comp' ? this.scoutFieldInit() : null);

    this.checkScoutInterval = window.setInterval(() => {
      this.http.get(
        'api/scoutField/GetQuestions/'
      ).subscribe(
        {
          next: (result: any) => {
            if (this.gs.checkResponse(result)) {
              this.scoutFieldSchedule = result['scoutFieldSchedule'];
            }
          },
          error: (err: any) => {
            console.log('error', err);
          },
          complete: () => {
          }
        }
      );
    }, 30000);
  }

  ngOnDestroy(): void {
    window.clearInterval(this.checkScoutInterval);
  }

  scoutFieldInit(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'api/scoutField/GetQuestions/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.teams = result['teams'];
            this.scoutFieldSchedule = result['scoutFieldSchedule'];
            this.scoutQuestions = result['scoutQuestions'];
            this.sortQuestions();
          }
        },
        error: (err: any) => {
          console.log('error', err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  sortQuestions(): void {
    this.scoutAutoQuestions = [];
    this.scoutTeleopQuestions = [];
    this.scoutOtherQuestions = [];
    this.scoutQuestions.forEach(sq => {
      let sqCopy = JSON.parse(JSON.stringify(sq)) as ScoutQuestion;
      if (sqCopy.sq_sub_typ === 'auto') {
        this.scoutAutoQuestions.push(sqCopy);
      }
      else if (sqCopy.sq_sub_typ === 'teleop') {
        this.scoutTeleopQuestions.push(sqCopy);
      }
      else {
        this.scoutOtherQuestions.push(sqCopy);
      }
    });
  }

  save(): void | null {
    if (this.gs.strNoE(this.team)) {
      this.gs.triggerError('Must select a team to scout!');
      return null;
    }

    this.gs.incrementOutstandingCalls();

    let response: any[] = [];
    this.scoutAutoQuestions.forEach(sq => {
      response.push(sq);
    });
    this.scoutTeleopQuestions.forEach(sq => {
      response.push(sq);
    });
    this.scoutOtherQuestions.forEach(sq => {
      response.push(sq);
    });

    this.http.post(
      'api/scoutField/PostSaveAnswers/',
      { scoutQuestions: response, team: this.team }
    ).subscribe(
      Response => {
        this.gs.addBanner({ message: (Response as RetMessage).retMessage, severity: 1, time: 5000 });
        this.team = '';
        this.sortQuestions();
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

  increment(sq: ScoutQuestion): void {
    if (!sq.answer || this.gs.strNoE(sq.answer.toString())) sq.answer = 0;
    sq.answer = parseInt(sq.answer.toString()) + 1;
  }

  decrement(sq: ScoutQuestion): void {
    if (!sq.answer || this.gs.strNoE(sq.answer.toString())) sq.answer = 0;
    if (parseInt(sq.answer.toString()) > 0) sq.answer = parseInt(sq.answer.toString()) - 1;
  }

}

/*export class ScoutAnswer {
  scoutQuestions: ScoutQuestion[] = [];
  teams: Team[] = [];
  team!: string;
}*/

export class Team {
  team_no!: string;
  team_nm!: string;
}
