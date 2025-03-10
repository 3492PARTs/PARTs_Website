import { Component, OnInit } from '@angular/core';
import { ScoutFieldSchedule, Schedule } from '../../../../models/scouting.models';
import { User, AuthPermission } from '../../../../models/user.models';
import { APIService } from '../../../../services/api.service';
import { AuthService, AuthCallStates } from '../../../../services/auth.service';
import { GeneralService } from '../../../../services/general.service';
import { ScoutingService } from '../../../../services/scouting.service';
import { UserService } from '../../../../services/user.service';
import { BoxComponent } from '../../../atoms/box/box.component';
import { CommonModule } from '@angular/common';
import { TableColType, TableComponent } from '../../../atoms/table/table.component';
import { FormElementGroupComponent } from '../../../atoms/form-element-group/form-element-group.component';

@Component({
  selector: 'app-scouting-portal',
  imports: [BoxComponent, CommonModule, TableComponent, FormElementGroupComponent],
  templateUrl: './scouting-portal.component.html',
  styleUrls: ['./scouting-portal.component.scss']
})
export class ScoutingPortalComponent implements OnInit {
  user: User = new User();
  //userPermissions: AuthPermission[] = [];

  fullFieldSchedule: ScoutFieldSchedule[] = [];


  schedule: Schedule[] = [];
  fieldSchedule: {
    position: string,
    st_time: Date,
    end_time: Date,
    notification1: boolean,
    notification2: boolean,
    notification3: boolean,
  }[] = [];

  scoutFieldScheduleTableCols: TableColType[] = [
    { PropertyName: 'position', ColLabel: 'Position' },
    { PropertyName: 'st_time', ColLabel: 'Start Time' },
    { PropertyName: 'end_time', ColLabel: 'End Time' },
    { PropertyName: 'notification1', ColLabel: '15 min notification', Type: 'function', ColValueFunction: this.decodeSentBoolean.bind(this) },
    { PropertyName: 'notification2', ColLabel: '5 min notification', Type: 'function', ColValueFunction: this.decodeSentBoolean.bind(this) },
    { PropertyName: 'notification3', ColLabel: '0 min notification', Type: 'function', ColValueFunction: this.decodeSentBoolean.bind(this) },
  ];

  expandedScoutFieldScheduleTableCols: TableColType[] = [
    { PropertyName: 'st_time', ColLabel: 'Start Time' },
    { PropertyName: 'end_time', ColLabel: 'End Time' },
    { PropertyName: 'scouts', ColLabel: 'Scouts' },
    { PropertyName: 'notification1', ColLabel: '15 min notification', Type: 'function', ColValueFunction: this.decodeSentBoolean.bind(this) },
    { PropertyName: 'notification2', ColLabel: '5 min notification', Type: 'function', ColValueFunction: this.decodeSentBoolean.bind(this) },
    { PropertyName: 'notification3', ColLabel: '0 min notification', Type: 'function', ColValueFunction: this.decodeSentBoolean.bind(this) },
  ];

  scheduleTableCols: TableColType[] = [
    { PropertyName: 'st_time', ColLabel: 'Start Time' },
    { PropertyName: 'end_time', ColLabel: 'End Time' },
    { PropertyName: 'notified', ColLabel: 'Notified', Type: 'function', ColValueFunction: this.decodeYesNoBoolean.bind(this) },
    { PropertyName: 'sch_nm', ColLabel: 'Type' },
  ];

  constructor(private gs: GeneralService,
    private api: APIService,
    private authService: AuthService,
    private ss: ScoutingService,
    private us: UserService) { }

  ngOnInit() {
    this.authService.authInFlight.subscribe(r => r === AuthCallStates.comp ? this.portalInit() : null);
    this.authService.user.subscribe(u => this.user = u);
    //this.authService.userPermissions.subscribe(ups => this.userPermissions = ups);
  }

  portalInit(): void {
    this.gs.incrementOutstandingCalls();
    this.ss.loadAllScoutingInfo().then(result => {
      if (result) {
        this.schedule = result.schedules.filter(s => (s.user as User).id === this.user.id);
        this.fullFieldSchedule = result.scout_field_schedules;
        result.scout_field_schedules.forEach(fs => {
          let pos = '';

          if ((fs.red_one_id as User)?.id === this.user.id) {
            pos = 'red one'
          }
          else if ((fs.red_two_id as User)?.id === this.user.id) {
            pos = 'red two'
          }
          else if ((fs.red_three_id as User)?.id === this.user.id) {
            pos = 'red three'
          }
          else if ((fs.blue_one_id as User)?.id === this.user.id) {
            pos = 'blue one'
          }
          else if ((fs.blue_two_id as User)?.id === this.user.id) {
            pos = 'blue two'
          }
          else if ((fs.blue_three_id as User)?.id === this.user.id) {
            pos = 'blue three'
          }

          if (!this.gs.strNoE(pos)) {
            this.fieldSchedule.push({
              position: pos,
              st_time: new Date(fs.st_time),
              end_time: new Date(fs.end_time),
              notification1: fs.notification1,
              notification2: fs.notification2,
              notification3: fs.notification3,
            });
          }
        });
      }
      this.gs.decrementOutstandingCalls();
    });
  }

  decodeSentBoolean(b: boolean): string {
    return this.gs.decodeSentBoolean(b);
  }

  decodeYesNoBoolean(b: boolean): string {
    return this.gs.decodeYesNoBoolean(b);
  }
}