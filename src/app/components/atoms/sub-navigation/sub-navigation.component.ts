import { CommonModule } from '@angular/common';
import { Component, Input, Output } from '@angular/core';
import { UserLinks } from '../../../models/navigation.models';
import { NavigationService } from '../../../services/navigation.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sub-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
    this.ns.subPages.subscribe(sp => this.navItems = sp);
    this.ns.subPage.subscribe(p => this.page = p);
  }

  ngOnInit(): void {

  }

  setPage(s: string): void {
    this.ns.setSubPage(s);
  }
}