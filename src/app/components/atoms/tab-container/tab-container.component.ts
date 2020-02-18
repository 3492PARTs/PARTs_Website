import { Component, Input, ContentChildren, AfterContentInit, QueryList } from '@angular/core';
import { TabComponent } from '../tab/tab.component';

@Component({
  selector: 'app-tab-container',
  templateUrl: './tab-container.component.html',
  styleUrls: ['./tab-container.component.scss']
})
export class TabContainerComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabContainerTabs: QueryList<TabComponent>;

  tabs: TabElement[] = [];

  activeTab: TabElement;

  constructor() { }

  ngAfterContentInit() {
    this.getTabs();
  }

  getTabs() {
    this.tabContainerTabs.forEach(el => {
      this.tabs.push({ name: el.TabName, element: el , active: false });
    });

    this.tabContainerTabs.toArray()[0].visible = true;
    this.tabs[0].active = true;
    this.activeTab = this.tabs[0];
  }

  showTab(tab: TabElement) {
    this.activeTab.element.visible = false;
    this.activeTab.active = false;

    tab.active = true;
    tab.element.visible = true;

    this.activeTab = tab;
  }

}

export class TabElement  { name: string; element: TabComponent; active: boolean; }
