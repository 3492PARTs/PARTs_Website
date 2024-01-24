import { Component, HostListener, OnInit } from '@angular/core';
import { GeneralService, RetMessage, Page } from 'src/app/services/general.service';
import { HttpClient } from '@angular/common/http';
import { User, AuthGroup, AuthService, PhoneType, ErrorLog, AuthCallStates } from 'src/app/services/auth.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { MenuItem } from '../../navigation/navigation.component';
import * as moment from 'moment';
import { UserService } from 'src/app/services/user.service';
import { Question } from '../../elements/question-admin-form/question-admin-form.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  page = 'users';

  init: AdminInit = new AdminInit();
  users: User[] = [];

  userTableCols = [
    { PropertyName: 'name', ColLabel: 'User' },
    { PropertyName: 'username', ColLabel: 'Username' },
    { PropertyName: 'email', ColLabel: 'Email' },
    { PropertyName: 'discord_user_id', ColLabel: 'Discord' },
    { PropertyName: 'phone', ColLabel: 'Phone' },
    { PropertyName: 'phone_type_id', ColLabel: 'Carrier', Type: 'function', ColValueFn: this.getPhoneType.bind(this) },
  ];

  userOptions = [{ property: 'Active', value: 1 }, { property: 'Inactive', value: -1 }];
  userOption = 1;
  adminOption = 1;
  filterText = '';

  manageUserModalVisible = false;
  activeUser: User = new User();
  userGroups: AuthGroup[] = [];
  availableAuthGroups: AuthGroup[] = [];
  newAuthGroup: AuthGroup = new AuthGroup();

  userGroupsTableCols: object[] = [
    { PropertyName: 'name', ColLabel: 'Name' }
  ];

  errorTableCols: object[] = [
    { PropertyName: 'user_name', ColLabel: 'User' },
    { PropertyName: 'path', ColLabel: 'Path' },
    { PropertyName: 'message', ColLabel: 'Message' },
    { PropertyName: 'exception', ColLabel: 'Exception' },
    { PropertyName: 'display_time', ColLabel: 'Time' }
  ];
  errors: ErrorLog[] = [];
  pageInfo: Page = new Page();
  pages = [];
  errorPage = 1;
  errorDetailModalVisible = false;
  currentError: ErrorLog = new ErrorLog();

  teamApplicationResponsesCols = [
    { PropertyName: 'response_id', ColLabel: 'ID' },
    { PropertyName: 'questionanswer_set[0].answer', ColLabel: 'Name' },
    { PropertyName: 'time', ColLabel: 'Time' },
  ];
  teamApplicationResponses: Response[] = [];

  teamContactResponsesCols = [
    { PropertyName: 'response_id', ColLabel: 'ID' },
    { PropertyName: 'questionanswer_set[0].answer', ColLabel: 'Name' },
    { PropertyName: 'questionanswer_set[3].answer', ColLabel: 'Message' },
    { PropertyName: 'time', ColLabel: 'Time' },
  ];
  teamContactResponses: Response[] = [];

  //---------------------
  itemTableCols: object[] = [
    { PropertyName: 'item_nm', ColLabel: 'Item' },
    { PropertyName: 'item_desc', ColLabel: 'Description' },
    { PropertyName: 'quantity', ColLabel: 'Quantity' },
    { PropertyName: 'sponsor_quantity', ColLabel: 'Donated' },
    { PropertyName: 'img_url', ColLabel: 'Image', Type: 'image' },
    { PropertyName: 'active', ColLabel: 'Active' },
  ];
  items: Item[] = [];
  activeItem = new Item();
  itemModalVisible = false;

  constructor(private gs: GeneralService, private http: HttpClient, private authService: AuthService, private ns: NavigationService, private us: UserService) {
    this.ns.currentSubPage.subscribe(p => {
      this.page = p;
      switch (this.page) {
        case 'errors':
          this.getErrors(this.errorPage);
          break;
        case 'req-items':
          this.getItems();
          break;
        case 'team-app-form':
          this.getResponses('team-app');
          break;
        case 'team-cntct-form':
          this.getResponses('team-cntct');
          break;
      }
    });

    this.us.currentUsers.subscribe(u => this.users = u);
  }

  ngOnInit() {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.adminInit();
        this.us.getUsers(this.userOption, this.adminOption);
      }
    });

    this.ns.setSubPages([
      new MenuItem('Manage Users', 'users', 'account-group'),
      new MenuItem('Error Log', 'errors', 'alert-circle-outline'),
      new MenuItem('Requested Items', 'req-items', 'view-grid-plus'),
      new MenuItem('Team Application Form', 'team-app-form', 'chat-question-outline'),
      new MenuItem('Team Contact Form', 'team-cntct-form', 'chat-question-outline')
    ]);
    this.ns.setSubPage('users');
  }

  adminInit(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'admin/init/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.init = result as AdminInit;
            this.userTableCols = this.userTableCols;
            //console.log(this.init);
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  getUsers() {
    this.us.getUsers(this.userOption, this.adminOption);
  }

  showManageUserModal(u: User): void {
    this.manageUserModalVisible = true;
    this.activeUser = u;
    this.gs.incrementOutstandingCalls();
    this.authService.getUserGroups(u.id.toString())!.subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.userGroups = result as AuthGroup[];
            this.buildAvailableUserGroups();
          }
        },
        error: (err: any) => {
          console.log('error', err);
          this.gs.triggerError(err);
        },
        complete: () => {
          this.gs.decrementOutstandingCalls();
        }
      }
    );
  }

  private buildAvailableUserGroups(): void {
    this.availableAuthGroups = this.init.userGroups.filter(ug => {
      return this.userGroups.map(el => el.id).indexOf(ug.id) < 0;
    });
  }

  addUserGroup(): void {
    const tmp: AuthGroup[] = this.availableAuthGroups.filter(ag => {
      return ag.id === this.newAuthGroup.id;
    });
    this.userGroups.push({ id: this.newAuthGroup.id, name: tmp[0].name, permissions: [] });
    this.newAuthGroup = new AuthGroup();
    this.buildAvailableUserGroups();
  }

  removeUserGroup(ug: AuthGroup): void {
    this.userGroups.splice(this.userGroups.lastIndexOf(ug), 1);
    this.buildAvailableUserGroups();
  }

  saveUser(): void {
    this.us.saveUser(this.activeUser, this.userGroups, () => {
      this.manageUserModalVisible = false;
      this.activeUser = new User();
      this.adminInit();
      this.us.getUsers(this.userOption, this.adminOption);
    });
  }

  getPhoneType(type: number): string {
    if (this.init)
      for (let pt of this.init.phoneTypes) {
        if (pt.phone_type_id === type) return pt.carrier;
      }

    return '';
  }

  getErrors(pg: number): void {
    this.gs.incrementOutstandingCalls();
    this.errorPage = pg;
    this.http.get(
      'admin/error-log/', {
      params: {
        pg_num: pg.toString()
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.errors = result['errors'] as ErrorLog[];
            delete result['errors'];
            this.pageInfo = result as Page;
            this.errors.forEach(el => {
              el.user_name = el.user.first_name + ' ' + el.user.last_name;
              el.time = new Date(el.time);
              el.display_time = el.time.getMonth() + 1 + '/' + el.time.getDate() + '/' +
                el.time.getFullYear() + ' ' +
                (el.time.getHours() > 12 ? el.time.getHours() - 12 : el.time.getHours()) + ':' +
                (el.time.getMinutes() < 10 ? '0' : '') + el.time.getMinutes() + ' ' + (el.time.getHours() > 12 ? 'PM' : 'AM');
            });
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

  showErrorModal(error: ErrorLog) {
    this.errorDetailModalVisible = true;
    this.currentError = error;
  }

  getResponses(form_typ: string): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'form/get-responses/', {
      params: {
        form_typ: form_typ
      }
    }
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            if (form_typ === 'team-app')
              this.teamApplicationResponses = result as Response[];
            else
              this.teamContactResponses = result as Response[];
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

  openResponse(res: Response): void {
    if (res.form_typ === 'team-app')
      this.gs.navigateByUrl(`/join/team-application?response_id=${res.response_id}`);
    else
      this.gs.navigateByUrl(`/contact?response_id=${res.response_id}`);
  }










  //----------------------------------------------------------------------------------------------------

  getItems(): void {
    this.gs.incrementOutstandingCalls();
    this.http.get(
      'sponsoring/get-items/'
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.items = result as Item[];
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

  editItem(i = new Item()): void {
    this.activeItem = i;
    this.gs.previewImage(this.activeItem.img_url, 'item-image');
    this.itemModalVisible = true;
  }

  saveItem(): void {
    this.gs.incrementOutstandingCalls();
    let formData = new FormData();
    //formData.append('file', this.form.get('profile').value);
    for (const [k, v] of Object.entries(this.activeItem)) {
      if (moment.isMoment(v)) {
        formData.append(k, v.format('YYYY-MM-DD'));
      }
      else
        formData.append(k, v);
    }

    this.http.post(
      'sponsoring/save-item/', formData
    ).subscribe(
      {
        next: (result: any) => {
          if (this.gs.checkResponse(result)) {
            this.activeItem = new Item();
            this.itemModalVisible = false;
            this.getItems();
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

  previewImage(link: string, id: string): void {
    this.gs.previewImage(link, id);
  }

  previewImageFile(): void {
    this.gs.previewImageFile(this.activeItem.img, this.loadImage.bind(this))
  }

  loadImage(ev: ProgressEvent<FileReader>): any {
    this.activeItem.img_url = ev.target?.result as string;
  }
}

export class AdminInit {
  userGroups: AuthGroup[] = [];
  phoneTypes: PhoneType[] = [];
}

export class Response {
  response_id!: number;
  form_typ = '';
  time = new Date();
  questionanswer_set: Question[] = [];
}
export class Item {
  item_id!: number;
  item_nm = '';
  item_desc = '';
  quantity!: number;
  sponsor_quantity!: number;
  cart_quantity!: number;
  reset_date = new Date();
  active = 'y';
  img!: any;
  img_url = '';
  void_ind = '';
}

export class Sponsor {
  sponsor_id!: number;
  sponsor_nm = '';
  phone = '';
  email = '';
  can_send_emails = false;
  void_ind = '';
}