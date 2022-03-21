import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  Renderer2,
  DoCheck,
  OnChanges,
  HostListener,
  RendererStyleFlags2
} from '@angular/core';


//import * as $ from 'jquery';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnChanges {

  private screenSizeWide = 1175;
  private resizeTimer: number | null | undefined;

  constructor(private renderer: Renderer2) { }
  @Input()
  TableData: any[] = [];
  @Input() TableCols: any[] = [];

  @Input()
  TableTitle!: string;

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
  @Output() DblClkRecordClickCallBack: EventEmitter<any> = new EventEmitter();

  @Input() EnableRemovedFiter = false;
  @Input() RemovedFiterProperty = 'Removed';
  @Input() RemovedFiterPropertyValue: any = true;

  @Input() AppyRemovedFilter = true;

  @Input() Stripes = false;
  @Input() Borders = false;
  @Input() Hilighting = false;
  @Input() Scrollable = false;
  @Input() ScrollHeight = '20em';
  @Input() Responsive = false;
  @Input() AllowActiveRecord = false;
  @Input() DisplayRecordInfo = false;
  @Input() Resizable = false;
  @Input() ButtonsFirstCol = false;
  @Input() Mobile = false;

  @Input() DisableInputs = false;
  @Output() RecordChanged: EventEmitter<any> = new EventEmitter(); // TODO Is this used?

  @Input() Width = '';


  SearchText = '';
  OrderByProperty = '';
  OrderByReverse = false;
  ActiveRec!: object;
  @Input()
  set SetActiveRec(rec: object) {
    this.ActiveRec = rec;
    this.SetTableContainerWidth();
  }
  FixedTableScrollColWidth = '0px';
  @ViewChild('InfoContainer', { read: ElementRef, static: true })
  InfoContainer!: ElementRef;

  @ViewChild('TableContainer', { read: ElementRef, static: true })
  TableContainer!: ElementRef;
  @ViewChild('MainTableBody', { read: ElementRef, static: true })
  MainTableBody!: ElementRef;

  @ViewChild('Table', { read: ElementRef, static: true })
  Table!: ElementRef;

  ngOnInit() {
    if (this.Width !== '') {
      this.renderer.setStyle(this.Table.nativeElement, 'width', this.Width, RendererStyleFlags2.DashCase | RendererStyleFlags2.Important);
    }

    this.SetTableContainerWidth();

    /*
      If the table header is set to fixed, need width of scrollbar
      to add a col to fix spacing
    */
    if (this.Scrollable) {
      this.FixedTableScrollColWidth = this.getScrollbarWidth() + 'px';
      this.renderer.setStyle(
        this.MainTableBody.nativeElement,
        'max-height',
        this.ScrollHeight
      );
    }

    /*$(function () {
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
    });*/

  }

  ngOnChanges() {
    this.toType();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.resizeTimer != null) {
      window.clearTimeout(this.resizeTimer);
    }

    this.resizeTimer = window.setTimeout(() => {
      this.SetTableContainerWidth();
    }, 200);
  }

  private toType() {
    for (let obj of this.TableData) {
      for (const property in obj) {
        if (obj.hasOwnProperty(property)) {
          const numPatt = new RegExp('^[0-9]+(\.[0-9]+)?$');
          const datePatt = new RegExp('^[0-2][0-9]\/[0-9][0-9]\/[0-9]{4}$');
          /*if (numPatt.test(obj[property])) {
            obj[property] = parseFloat(obj[property]);
          } else */
          if (datePatt.test(obj[property])) {
            const dt = obj[property].split(/\/|\-|\s/);
            // obj[property] = new Date(dt[0] + '-' + dt[1] + '-' + dt[2]); // fixed format dd-mm-yyyy
          }
        }
      }
    }
  }

  RecordClick(Rec: object) {
    this.RecordClickCallBack.emit(Rec);
    if (this.AllowActiveRecord) {
      this.ActiveRec = Rec;
      this.SetTableContainerWidth();
    }
  }

  DblClkRecordClick(Rec: any) {
    this.DblClkRecordClickCallBack.emit(Rec);
  }

  SetTableContainerWidth() {
    if (this.DisplayRecordInfo && this.ActiveRec != null) {
      this.renderer.setStyle(
        this.InfoContainer.nativeElement,
        'display',
        'inline-block'
      );
      const infopixels = this.InfoContainer.nativeElement.offsetWidth;
      const FinalCssVal = 'calc(100% - ' + infopixels + 'px)';

      if (
        window.innerWidth >= this.screenSizeWide &&
        (window.innerWidth - (infopixels + 300) > 0)
      ) {
        this.renderer.setStyle(
          this.TableContainer.nativeElement,
          'width',
          FinalCssVal
        );
      } else {
        this.renderer.setStyle(
          this.TableContainer.nativeElement,
          'width',
          '100%'
        );
        this.renderer.setStyle(
          this.InfoContainer.nativeElement,
          'display',
          'block'
        );
      }

    } else {
      this.renderer.setStyle(
        this.InfoContainer.nativeElement,
        'display',
        'none'
      );
    }
  }

  SetOrder(PropertyName: string) {
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

  GetTableDisplayValue(rec: any, property: string) {
    if (!property) {
      throw new Error('NO DISPLAY PROPERTY PROVIDED FOR ONE OF THE TABLE COMPOENT COLUMNS');
    }
    let ret = '';
    const comand = 'ret = rec.' + property + ';';
    eval(comand);
    return ret;

  }

  IsPropertyInColumnSettings(PropertyName: any) {
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

  Remove(rec: any) {
    this.RemoveRecordCallBack.emit(rec);
  }

  View(rec: any) {
    this.ViewRecordCallBack.emit(rec);
  }

  Edit(rec: any) {
    this.EditRecordCallBack.emit(rec);
  }

  Add() {
    this.AddRecordCallBack.emit();
  }

  private getScrollbarWidth() {
    // Creating invisible container
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll'; // forcing scrollbar to appear
    //outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    document.body.appendChild(outer);

    // Creating inner element and placing it in the container
    const inner = document.createElement('div');
    outer.appendChild(inner);

    // Calculating difference between container's full width and the child width
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

    // Removing temporary elements from the DOM
    outer.parentNode!.removeChild(outer);

    return scrollbarWidth;
  }
}
