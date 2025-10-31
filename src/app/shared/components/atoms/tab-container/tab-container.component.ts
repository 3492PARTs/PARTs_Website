import { Component, Input, ContentChildren, AfterContentInit, QueryList } from '@angular/core';
import { TabComponent } from '../tab/tab.component';
import { CommonModule } from '@angular/common';
import { GeneralService } from '@app/core/services/general.service';

import { Utils } from '@app/core/utils/utils';
@Component({
  selector: 'app-tab-container',
  imports: [CommonModule],
  templateUrl: './tab-container.component.html',
  styleUrls: ['./tab-container.component.scss']
})
export class TabContainerComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabContainerTabs: QueryList<TabComponent> = new QueryList<TabComponent>();

  tabs: TabElement[] = [];

  activeTab?: TabElement;

  @Input()
  set ActiveTab(at: string) {
    this.setActiveTab(at);
    this.activeTabTitle = at;
  }
  private activeTabTitle = '';


  constructor(private gs: GeneralService) { }

  ngAfterContentInit() {
    this.tabContainerTabs.changes.subscribe(() => {
      this.getTabs();
    });

    this.getTabs();
  }

  setActiveTab(at: string) {
    if (at !== '') this.tabs.forEach(t => t.name === at ? this.showTab(t) : null);
  }

  getTabs() {
    this.tabContainerTabs.forEach(el => {
      this.tabs.push({ name: el.TabName, element: el, active: false });
    });

    window.setTimeout(() => {
      if (this.tabs.length > 0)
        if (!Utils.strNoE(this.activeTabTitle)) this.setActiveTab(this.activeTabTitle);
        else this.showTab(this.tabs[0]);
    }, 0);
  }

  showTab(tab: TabElement) {
    if (this.activeTab && this.activeTab.element) {
      this.activeTab.element.visible = false;
      this.activeTab.active = false;
    }
    if (tab.element) {
      tab.active = true;
      tab.element.visible = true;

      this.activeTab = tab;
    }
  }

}

export class TabElement { name?: string; element?: TabComponent; active?: boolean; }
