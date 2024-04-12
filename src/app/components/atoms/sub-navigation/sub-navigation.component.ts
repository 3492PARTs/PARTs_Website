import { Component, Input, Output } from '@angular/core';
import { UserLinks } from 'src/app/models/navigation.models';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-sub-navigation',
  templateUrl: './sub-navigation.component.html',
  styleUrls: ['./sub-navigation.component.scss']
})
export class SubNavigationComponent {

  @Input()
  public set setNavExpanded(val: boolean) {
    this.navExpanded = val;
  }
  navExpanded = false;

  @Input() hideNavExpander = false;

  page = '';
  @Input() navItems: UserLinks[] = [];


  constructor(private ns: NavigationService) {
    this.ns.currentSubPages.subscribe(sp => this.navItems = sp);
    this.ns.currentSubPage.subscribe(p => this.page = p);
  }

  ngOnInit(): void {

  }

  setPage(s: string): void {
    this.ns.setSubPage(s);
  }
}