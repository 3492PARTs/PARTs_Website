import { Component, HostListener, OnInit } from '@angular/core';
import { GeneralService, RetMessage, Page } from 'src/app/services/general.service';
import { HttpClient } from '@angular/common/http';
import { AuthService, PhoneType, ErrorLog, AuthCallStates } from 'src/app/services/auth.service';
import { NavigationService } from 'src/app/services/navigation.service';

import { UserService } from 'src/app/services/user.service';
import { QuestionWithConditions } from 'src/app/models/form.models';
import { User, AuthGroup, AuthPermission } from 'src/app/models/user.models';
import { UserLinks } from 'src/app/models/navigation.models';
import { APIService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';
import { Router, Event as NavigationEvent, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  page = 'users';

  constructor(private router: Router,
    private ns: NavigationService) {
    this.ns.currentSubPage.subscribe(p => {
      this.page = p;
    });

    this.router.events.subscribe(
      (event: NavigationEvent) => {
        if (event instanceof NavigationEnd) {
          const urlEnd = event.url.substring(1, event.url.length);
          this.ns.setSubPage(urlEnd === 'admin' ? 'admin/admin-users' : urlEnd);
        }
      });
  }

  ngOnInit() {

    let subPages = [
      new UserLinks('Users', 'admin/admin-users', 'account-group'),
      new UserLinks('Security', 'admin/security', 'security'),
      new UserLinks('Team Application Form', 'admin/team-application-form', 'chat-question-outline'),
      new UserLinks('Team Contact Form', 'admin/team-contact-form', 'chat-question-outline'),
      new UserLinks('Phone Types', 'admin/phone-types', 'phone'),
      new UserLinks('Error Log', 'admin/error-log', 'alert-circle-outline'),
    ];

    if (!environment.production) subPages.push(new UserLinks('Requested Items', 'admin/requested-items', 'view-grid-plus'));

    this.ns.setSubPages(subPages);

  }

  adminInit(): void {

  }





  // Phone Types -------------------------------------------------------------------------------------


  //----------------------------------------------------------------------------------------------------


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