import { Component, HostListener, OnInit } from '@angular/core';
import { AppSize, GeneralService, RetMessage } from 'src/app/services/general.service';
import { AuthService, PhoneType, AuthCallStates } from 'src/app/services/auth.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { QuestionAggregateType, QuestionAggregate, QuestionWithConditions } from 'src/app/models/form.models';
import { Team, Event, ScoutFieldSchedule, ScoutFieldResponsesReturn, Season, ScoutPitResponse, ScheduleByType, Schedule, ScheduleType } from 'src/app/models/scouting.models';
import { User, AuthGroup } from 'src/app/models/user.models';
import { UserLinks } from 'src/app/models/navigation.models';
import { APIService } from 'src/app/services/api.service';
import { ScoutingService } from 'src/app/services/scouting.service';

@Component({
  selector: 'app-scouting-admin',
  templateUrl: './scouting-admin.component.html',
  styleUrls: ['./scouting-admin.component.scss']
})
export class ScoutingAdminComponent implements OnInit {
  Model: any = {};
  page = 'users';

  // value variables


  //manage season sub page


  // schedule sub page


  // manage questions sub pages



  // scout activity sub page






  // field responses sub page


  // pit responses sub page


  constructor(private gs: GeneralService,
    private api: APIService,
    private authService: AuthService,
    private ns: NavigationService,
    private us: UserService,
    private ss: ScoutingService) {
    this.ns.subPage.subscribe(p => {
      this.page = p;

      switch (this.page) {
        case 'users':

          break;
        case 'mngSeason':

          break;
        case 'mngSch':

          break;
        case 'scoutAct':

          break;
        case 'mngFldRes':

          break;
        case 'mngPitRes':

          break;
        case 'mngFldQAgg':
          break;
        case 'mngFldQCond':
          break;
      }
    });
  }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => {
      if (r === AuthCallStates.comp) {
        this.adminInit();
        this.getPhoneTypes();
      }
    });
    /*
        this.ns.setSubPages([
          new UserLinks('Users', 'users', 'account-group'),
          new UserLinks('Season', 'mngSeason', 'card-bulleted-settings-outline'),
          new UserLinks('Schedule', 'mngSch', 'clipboard-text-clock'),
          new UserLinks('Scouting Activity', 'scoutAct', 'account-reactivate'),
          new UserLinks('Field Form', 'mngFldQ', 'chat-question-outline'),
          new UserLinks('Field Form Aggregates', 'mngFldQAgg', 'sigma'),
          new UserLinks('Field Form Conditions', 'mngFldQCond', 'code-equal'),
          new UserLinks('Field Responses', 'mngFldRes', 'table-edit'),
          new UserLinks('Pit Form', 'mngPitQ', 'chat-question-outline'),
          new UserLinks('Pit Form Conditions', 'mngPitQCond', 'code-equal'),
          new UserLinks('Pit Responses', 'mngPitRes', 'table-edit'),
        ]);*/


    if (environment.production) this.ns.setSubPage('users');
    else this.ns.setSubPage('users');
    this.setTableSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setTableSize();
  }

  setTableSize(): void {
    if (this.gs.getAppSize() < AppSize.LG) this.userScoutActivityResultsTableWidth = '800%';
  }

  adminInit(): void {
    this.gs.incrementOutstandingCalls();
    this.ss.loadAllScoutingInfo().then(async result => {
      if (result) {
        this.seasons = result.seasons;
        this.events = result.events;
        //this.teams = result.teams; this is a list of current. we need all teams
        this.currentSeason = result.seasons.filter(s => s.current === 'y')[0];
        this.currentEvent = result.events.filter(e => e.current === 'y')[0];
        this.scoutFieldSchedules = result.scout_field_schedules;
        this.scoutFieldSchedules.forEach(fs => {
          fs.st_time = new Date(fs.st_time),
            fs.end_time = new Date(fs.end_time)
        });
        this.scheduleTypes = result.schedule_types;
        this.scheduleByType = [];
        result.schedule_types.forEach(async st => {
          const tmp = result.schedules.filter(s => s.sch_typ === st.sch_typ);
          if (tmp) this.scheduleByType.push({ sch_typ: st, schedule: tmp });
        });

        this.getEventsForCurrentSeason();
      };

      this.gs.decrementOutstandingCalls();
    });

    this.api.get(true, 'scouting/admin/scout-auth-group/', undefined, (result: AuthGroup[]) => {
      this.userGroups = result;
    }, (err: any) => {
      this.gs.triggerError(err);
    });
  }



  // Season -----------------------------------------------------------


  // Users ----------------------------------------------------------------------







  // Scouting Activity -----------------------------------------------------------------------------------------------------------------


  // Field question aggregates -----------------------------------------------------------------------------------------------


  // Manage field results ------------------------------------------------------------------------


  // Manage pit results ---------------------------------------------------------------------------------

}


