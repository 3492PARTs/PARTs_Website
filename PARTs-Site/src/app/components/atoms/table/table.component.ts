import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  Renderer2
} from '@angular/core';

import * as $ from 'jquery';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  @Input() TableData: any[];
  @Input() TableCols: any[] = [];

  @Input() EnableFilter = false;
  @Input() DisableSort = false;

  @Output() RemoveRecordCallBack: EventEmitter<any> = new EventEmitter();
  @Input() ShowRemoveButton = false;

  @Output() ViewRecordCallBack: EventEmitter<any> = new EventEmitter();
  @Input() ShowViewButton = false;

  @Output() EditRecordCallBack: EventEmitter<any> = new EventEmitter();
  @Input() ShowEditButton = false;

  @Output() AddRecordCallBack: EventEmitter<any> = new EventEmitter();
  @Input() ShowAddButton = false;


  @Output() RecordClickCallBack: EventEmitter<any> = new EventEmitter();

  @Input() EnableRemovedFiter = false;
  @Input() RemovedFiterProperty = 'Removed';
  @Input() RemovedFiterPropertyValue: any = false;

  @Input() AppyRemovedFilter = false;

  @Input() Stripes = false;
  @Input() Borders = false;
  @Input() Hilighting = false;
  @Input() Scrollable = false;
  @Input() ScrollHeight = '20em';
  @Input() Responsive = true;
  @Input() AllowActiveRecord = false; //TODO Is this used?
  @Input() DisplayRecordInfo = false; //TODO Is this used?
  @Input() Resizable = false;




  SearchText = '';
  OrderByProperty = '';
  OrderByReverse = false;
  ActiveRec: Object = null;
  FixedTableScrollColWidth = '0px';

  constructor(private renderer: Renderer2) { }
  @ViewChild('InfoContainer', { read: ElementRef, static: true }) InfoContainer: ElementRef;

  @ViewChild('TableContainer', { read: ElementRef, static: true }) TableContainer: ElementRef;
  @ViewChild('MainTableBody', { read: ElementRef, static: true }) MainTableBody: ElementRef;


  ngOnInit() {
    this.SetTableContainerWidth();

    /*
      If the table header is set to fixed, need width of scrollbar
      to add a col to fix spacing
    */

    if (this.Scrollable) {

      this.renderer.setStyle(
        this.MainTableBody.nativeElement,
        'height',
        this.ScrollHeight
      );
    }

    $(function () {
      var startX,
        startWidth,
        $handle,
        $table,
        pressed = false;

      $(document)
        .on({
          mousemove: function (event) {
            if (pressed) {
              $handle.width(startWidth + (event.pageX - startX));
            }
          },
          mouseup: function () {
            if (pressed) {
              $table.removeClass('resizing');
              pressed = false;
            }
          }
        })
        .on('mousedown', '.table-resizable th', function (event) {
          $handle = $(this);
          pressed = true;
          startX = event.pageX;
          startWidth = $handle.width();

          $table = $handle.closest('.table-resizable').addClass('resizing');
        })
        .on('dblclick', '.table-resizable thead', function () {
          // Reset column sizes on double click
          $(this)
            .find('th[style]')
            .css('width', '');
        });
    });

  }

  SetActive(Rec) {
    this.RecordClickCallBack.emit(Rec);
    if (this.AllowActiveRecord) {
      this.ActiveRec = Rec;
      this.SetTableContainerWidth();
    }
  }

  SetTableContainerWidth() {
    if (this.DisplayRecordInfo && this.ActiveRec != null) {
      this.renderer.setStyle(
        this.InfoContainer.nativeElement,
        'display',
        'inline-block'
      );
      const infopixels = this.InfoContainer.nativeElement.offsetWidth + 10;
      const FinalCssVal = 'calc(100% - ' + infopixels + 'px)';
      this.renderer.setStyle(
        this.TableContainer.nativeElement,
        'width',
        FinalCssVal
      );
    } else {
      this.renderer.setStyle(
        this.InfoContainer.nativeElement,
        'display',
        'none'
      );
    }
  }

  SetOrder(PropertyName) {
    // console.log(this.EnableRemovedFiter + " | " + this.RemovedFiterProperty + " | " + this.RemovedFiterPropertyValue)
    if (this.DisableSort) {
      this.OrderByReverse = false;
      this.OrderByProperty = '';
    } else {
      if (PropertyName === this.OrderByProperty) {
        this.OrderByReverse = !this.OrderByReverse;
      } else {
        this.OrderByReverse = false;
      }

      this.OrderByProperty = PropertyName;
    }
  }

  IsPropertyInColumnSettings(PropertyName) {
    return true;
  }

  ShowButtonColumn() {
    if (
      this.ShowAddButton ||
      this.ShowRemoveButton ||
      this.ShowEditButton ||
      this.ShowViewButton
    ) {
      return true;
    }

    return false;
  }

  Remove(rec) {
    this.RemoveRecordCallBack.emit(rec);
  }

  View(rec) {
    this.ViewRecordCallBack.emit();
  }

  Edit(rec) {
    this.EditRecordCallBack.emit();
  }

  Add() {
    this.AddRecordCallBack.emit();
  }

  private getScrollbarWidth() {
    // Creating invisible container
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll'; // forcing scrollbar to appear
    outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    document.body.appendChild(outer);

    // Creating inner element and placing it in the container
    const inner = document.createElement('div');
    outer.appendChild(inner);

    // Calculating difference between container's full width and the child width
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

    // Removing temporary elements from the DOM
    outer.parentNode.removeChild(outer);

    return scrollbarWidth;
  }
}
