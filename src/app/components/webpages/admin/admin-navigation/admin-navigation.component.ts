import { Component, Input } from '@angular/core';
import { GeneralService, Page } from 'src/app/services/general.service';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-admin-navigation',
  templateUrl: './admin-navigation.component.html',
  styleUrls: ['./admin-navigation.component.scss']
})
export class AdminNavigationComponent {

  @Input()
  public set setNavExpanded(val: boolean) {
    this.navExpanded = val;
    //this.firmware = JSON.parse(JSON.stringify(this.fs.firmware.getValue()));
    this.firmware.forEach(f => {
      if (!this.navExpanded && f.name.length > 16) {
        f.name = f.name.substring(0, 14).trim() + '...';
      } else if (this.navExpanded && f.name.length > 20) {
        f.name = f.name.substring(0, 17).trim() + '...';
      }
    });
  }
  navExpanded = false;

  @Input() hideNavExpander = false;

  page = 'users'


  firmwareModalVisible = false;
  firmwareModalMode = 'Add';
  activeFirmware: Firmware = new Firmware();
  firmware: Firmware[] = [];
  firmwarePage = 1;
  firmwarePages: Page = {
    count: -1,
    previous: null,
    next: null
  };
  searchTicketModalVisible = false;
  searchCols = [
    { PropertyName: 'id', ColLabel: 'Ticket #' },
    { PropertyName: 'title', ColLabel: 'Title' },
    { PropertyName: 'created_at', ColLabel: 'Created', Type: 'function', ColValueFn: this.tableDate.bind(this) },
    { PropertyName: 'resolved', ColLabel: 'Resolved', Type: 'function', ColValueFn: this.tableResolved }
  ];

  constructor(//private fs: FirmwareService, 
    private gs: GeneralService,
    private ns: NavigationService) {
    this.ns.setSubPage(this.page);
    this.ns.currentSubPage.subscribe(p => this.page = p);
    /*this.fs.firmware$.subscribe((f) => {
      this.firmware = JSON.parse(JSON.stringify(f));
      this.firmware.forEach(f => {
        if (!this.navExpanded && f.name.length > 16) {
          f.name = f.name.substring(0, 14).trim() + '...';
        } else if (this.navExpanded && f.name.length > 20) {
          f.name = f.name.substring(0, 17).trim() + '...';
        }
      });
      this.firmwareModalVisible = false;
    });
    this.fs.firmwarePage$.subscribe(f => this.firmwarePage = f);
    this.fs.firmwarePages$.subscribe(f => this.firmwarePages = f);*/
  }

  ngOnInit(): void {
    //this.fs.getFirmware();;
    this.firmware = [
      { name: 'te1', updated_at: new Date(), description: 'fdsgds' },
      { name: 'te2', updated_at: new Date(), description: '2345235' },
      { name: 'te3', updated_at: new Date(), description: 'fsa4' },
      { name: 'te4', updated_at: new Date(), description: 'dfsdfsdffffff' }
    ]
  }

  setPage(s: string): void {
    this.ns.setSubPage(s);
  }

  openFirmwareModal(f?: Firmware): void {
    if (f) {
      this.activeFirmware = f;
      //this.fs.getFirmwareVersions(this.activeFirmware);
      //if (!f.versions) f.versions = [];
      this.firmwareModalMode = 'Edit';
    }
    else {
      this.activeFirmware = new Firmware();
      this.firmwareModalMode = 'Add';
    }
    this.firmwareModalVisible = true;
  }

  setFirmware(f: Firmware): void {
    //this.fs.setFirmware(f);
  }

  saveFirmware() {
    //this.fs.saveFirmware(this.activeFirmware);
  }

  nextPage(): void {
    /*if (this.firmwarePages.next) {
      this.fs.getFirmware(this.firmwarePages.next);
    }*/
  }

  previousPage(): void {
    /*if (this.firmwarePages.previous) {
      this.fs.getFirmware(this.firmwarePages.previous);
    }*/
  }

  showSearchModal(): void {
    //this.searchTicketModalVisible = true;
  }

  search(): void {
    // TODO Need to implement
  }

  tableDate(d: string): string {
    if (d) return this.gs.dateStringToString(d);
    else return 'no date';
  }

  tableResolved(b: boolean): string {
    return b ? 'Resolves' : 'Unresolved';
  }
}

export class Firmware {
  name = '';
  updated_at = new Date();
  description = '';
}