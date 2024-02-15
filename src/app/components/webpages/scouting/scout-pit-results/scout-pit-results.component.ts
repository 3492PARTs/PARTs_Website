import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeneralService } from 'src/app/services/general.service';
import { Team } from '../scout-field/scout-field.component';
import { Question } from '../../../elements/question-admin-form/question-admin-form.component';

import * as LoadImg from 'blueimp-load-image';
import { AuthCallStates, AuthService } from 'src/app/services/auth.service';
import { AppSize } from '../../../../services/general.service';

@Component({
  selector: 'app-scout-pit-results',
  templateUrl: './scout-pit-results.component.html',
  styleUrls: ['./scout-pit-results.component.scss']
})
export class ScoutPitResultsComponent implements OnInit {
  teams: Team[] = [];
  teamsList: Team[] = [];
  scoutPitResults: ScoutPitResults[] = [];
  resultWidth = '350px';

  constructor(private http: HttpClient, private gs: GeneralService, private authService: AuthService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => AuthCallStates.comp ? this.scoutPitResultsInit() : null);
    this.resultWidth = this.gs.screenSize() === AppSize.XS ? '100%' : '350px';
  }

  scoutPitResultsInit(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'scouting/pit/results-init/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.teams = result as Team[];
            this.teamsList = result as Team[];
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
          this.gs.decrementOutstandingCalls();
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  search(): void {
    this.gs.incrementOutstandingCalls();

    this.teams.forEach((t) => {
      if (!t.checked) {
        t.checked = false;
      }
    });

    this.http.post(
      'scouting/pit/results/', this.teams
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.scoutPitResults = result as ScoutPitResults[];
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
          this.gs.decrementOutstandingCalls();
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  prevImage(sp: ScoutPitResults): void {
    if (sp.pic - 1 < 0) sp.pic = sp.pics.length - 1;
    else sp.pic--;

    this.preview(sp, sp.pic)
  }

  nextImage(sp: ScoutPitResults): void {
    if (sp.pic + 1 > sp.pics.length - 1) sp.pic = 0;
    else sp.pic++;

    this.preview(sp, sp.pic)
  }

  preview(sp: ScoutPitResults, index?: number): void {
    if (sp.pics.length > 0) {
      let link = '';

      if (index) link = sp.pics[index].pic;
      else {
        for (let i = 0; i < sp.pics.length; i++) {
          if (sp.pics[i].default) {
            sp.pic = i;
            link = sp.pics[i].pic;
            break;
          }
        }

        if (this.gs.strNoE(link)) {
          link = sp.pics[0].pic;
          sp.pic = 0;
        }
      }

      let el = document.getElementById(sp.teamNo);

      if (el) el.replaceChildren();

      LoadImg(
        link,
        (img: any) => {
          img.style.width = '100%';
          img.style.height = 'auto';
          document.getElementById(sp.teamNo)!.appendChild(img);
        },
        {
          //maxWidth: 600,
          //maxHeight: 300,
          //minWidth: 100,
          //minHeight: 50,
          //canvas: true,
          orientation: true
        }
      );
    }
  }

  download(): void | null {
    let export_file = this.scoutPitResults;

    if (export_file.length <= 0) {
      this.gs.triggerError('Cannot export empty dataset.');
      return null;
    }

    let csv = 'Team Number,';
    export_file[0].results.forEach(r => {
      csv += '"' + r.question + '"' + ',';
    })

    csv += 'Pic URL,';

    csv = csv.substring(0, csv.length - 1);
    csv += '\n';

    export_file.forEach(element => {
      csv += element.teamNo + ',';
      element.results.forEach(r => {
        csv += '"' + r.answer + '"' + ',';
      });

      element.pics.forEach(p => {
        csv += p.pic + ',';
      });

      csv = csv.substring(0, csv.length - 1);
      csv += '\n';
    });

    this.gs.downloadFileAs('ScoutPitResults.csv', csv, 'text/csv');
  }
}
export class ScoutPitResults {
  teamNo!: string;
  teamNm!: string;
  pics: ScoutPitImage[] = [];
  pic = 0;
  results: ScoutPitResultAnswer[] = [];
}

export class ScoutPitResultAnswer {
  question!: string;
  answer!: string;
}

export class ScoutPitImage {
  pic!: string;
  default = false;
}