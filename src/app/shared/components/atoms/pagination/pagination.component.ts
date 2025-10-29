import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Page } from '../../../core/services/general.service';

@Component({
    selector: 'app-pagination',
    imports: [CommonModule],
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {

  _pageInfo: Page = new Page();
  @Input()
  public set PageInfo(val: Page) {
    this._pageInfo = val;
    this.buildPages();
  }
  _page = 1;
  @Input()
  public set Page(val: number) {
    this._page = val;
    this.buildPages();
  }

  pages: number[] = [];

  @Output() FunctionCallBack: EventEmitter<any> = new EventEmitter();



  constructor() { }

  ngOnInit() {
  }

  getPage(val: number): void {
    this.FunctionCallBack.emit(val);
  }

  buildPages(): void {
    this.pages = [];
    for (let i = 0; i < this._pageInfo.count && i < 10; i++) {
      let tmpPg = 0;
      if (this._page + 4 > this._pageInfo.count) {
        if (this._pageInfo.count - 9 < 1) {
          tmpPg = i + 1;
        } else {
          tmpPg = i + this._pageInfo.count - 9;
        }
      } else if (this._page < 7) {
        tmpPg = i + 1;
      } else {
        tmpPg = i + this._page - 5;
      }

      this.pages.push(tmpPg);
    }
  }

}
