import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent, TableButtonType, TableColType } from './table.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SimpleChange } from '@angular/core';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.TableData).toEqual([]);
      expect(component.TableCols).toEqual([]);
      expect(component.TableDataButtons).toEqual([]);
      expect(component.EnableFilter).toBe(false);
      expect(component.DisableSort).toBe(false);
      expect(component.ShowRemoveButton).toBe(false);
      expect(component.ShowViewButton).toBe(false);
      expect(component.ShowEditButton).toBe(false);
      expect(component.ShowAddButton).toBe(false);
      expect(component.ShowDownloadButton).toBe(false);
      expect(component.ShowArchiveButton).toBe(false);
    });

    it('should set CursorPointer when RecordClickCallBack is observed', () => {
      component.RecordClickCallBack.observers.push({} as any);
      component.ngOnInit();
      expect(component.CursorPointer).toBe(true);
    });

    it('should set TableName from TableTitle if TableName is empty', () => {
      component.TableTitle = 'Test Table';
      component.TableName = '';
      component.ngOnInit();
      expect(component.TableName).toBe('Test Table');
    });

    it('should not override TableName if already set', () => {
      component.TableTitle = 'Test Table';
      component.TableName = 'Custom Name';
      component.ngOnInit();
      expect(component.TableName).toBe('Custom Name');
    });
  });

  describe('Input Properties', () => {
    it('should accept TableData input', () => {
      const testData = [{ id: 1, name: 'Test' }, { id: 2, name: 'Test2' }];
      component.TableData = testData;
      expect(component.TableData).toEqual(testData);
    });

    it('should accept TableCols input', () => {
      const col = new TableColType();
      col.ColLabel = 'Name';
      col.PropertyName = 'name';
      component.TableCols = [col];
      expect(component.TableCols.length).toBe(1);
      expect(component.TableCols[0].ColLabel).toBe('Name');
    });

    it('should accept EnableFilter input', () => {
      component.EnableFilter = true;
      expect(component.EnableFilter).toBe(true);
    });

    it('should accept DisableSort input', () => {
      component.DisableSort = true;
      expect(component.DisableSort).toBe(true);
    });

    it('should accept FilterText input', () => {
      component.FilterText = 'search term';
      expect(component.FilterText).toBe('search term');
    });

    it('should accept OrderByProperty input', () => {
      component.OrderByProperty = 'name';
      expect(component.OrderByProperty).toBe('name');
    });

    it('should accept OrderByReverse input', () => {
      component.OrderByReverse = true;
      expect(component.OrderByReverse).toBe(true);
    });

    it('should accept Stripes input', () => {
      component.Stripes = true;
      expect(component.Stripes).toBe(true);
    });

    it('should accept Borders input', () => {
      component.Borders = true;
      expect(component.Borders).toBe(true);
    });

    it('should accept Highlighting input', () => {
      component.Highlighting = true;
      expect(component.Highlighting).toBe(true);
    });

    it('should accept Scrollable input', () => {
      component.Scrollable = true;
      expect(component.Scrollable).toBe(true);
    });

    it('should accept ScrollHeight input', () => {
      component.ScrollHeight = '30em';
      expect(component.ScrollHeight).toBe('30em');
    });

    it('should accept Responsive input', () => {
      component.Responsive = true;
      expect(component.Responsive).toBe(true);
    });

    it('should accept Width input', () => {
      component.Width = '800px';
      expect(component.Width).toBe('800px');
    });
  });

  describe('Button Visibility', () => {
    it('should handle ShowAddButton', () => {
      component.ShowAddButton = true;
      expect(component.ShowAddButton).toBe(true);
    });

    it('should handle ShowEditButton', () => {
      component.ShowEditButton = true;
      expect(component.ShowEditButton).toBe(true);
    });

    it('should handle ShowViewButton', () => {
      component.ShowViewButton = true;
      expect(component.ShowViewButton).toBe(true);
    });

    it('should handle ShowRemoveButton', () => {
      component.ShowRemoveButton = true;
      expect(component.ShowRemoveButton).toBe(true);
    });

    it('should handle ShowDownloadButton', () => {
      component.ShowDownloadButton = true;
      expect(component.ShowDownloadButton).toBe(true);
    });

    it('should handle ShowArchiveButton', () => {
      component.ShowArchiveButton = true;
      expect(component.ShowArchiveButton).toBe(true);
    });
  });

  describe('Output Events', () => {
    it('should emit RemoveRecordCallBack', (done) => {
      component.RemoveRecordCallBack.subscribe((record: any) => {
        expect(record).toEqual({ id: 1 });
        done();
      });
      component.RemoveRecordCallBack.emit({ id: 1 });
    });

    it('should emit ViewRecordCallBack', (done) => {
      component.ViewRecordCallBack.subscribe((record: any) => {
        expect(record).toEqual({ id: 2 });
        done();
      });
      component.ViewRecordCallBack.emit({ id: 2 });
    });

    it('should emit EditRecordCallBack', (done) => {
      component.EditRecordCallBack.subscribe((record: any) => {
        expect(record).toEqual({ id: 3 });
        done();
      });
      component.EditRecordCallBack.emit({ id: 3 });
    });

    it('should emit AddRecordCallBack', (done) => {
      component.AddRecordCallBack.subscribe(() => {
        done();
      });
      component.AddRecordCallBack.emit();
    });

    it('should emit RecordClickCallBack', (done) => {
      component.RecordClickCallBack.subscribe((record: any) => {
        expect(record).toEqual({ id: 4 });
        done();
      });
      component.RecordClickCallBack.emit({ id: 4 });
    });

    it('should emit DblClkRecordClickCallBack', (done) => {
      component.DblClkRecordClickCallBack.subscribe((record: any) => {
        expect(record).toEqual({ id: 5 });
        done();
      });
      component.DblClkRecordClickCallBack.emit({ id: 5 });
    });

    it('should emit FilterTextChange', (done) => {
      component.FilterTextChange.subscribe((text: string) => {
        expect(text).toBe('filter');
        done();
      });
      component.FilterTextChange.emit('filter');
    });
  });

  describe('ngOnChanges', () => {
    it('should handle TableData changes', () => {
      spyOn<any>(component, 'generateTableDisplayValues');
      
      component.ngOnChanges({
        TableData: new SimpleChange(null, [{ id: 1 }], false)
      });

      expect(component['generateTableDisplayValues']).toHaveBeenCalled();
    });

    it('should handle TableCols changes', () => {
      spyOn<any>(component, 'generateTableDisplayValues');
      
      component.ngOnChanges({
        TableCols: new SimpleChange(null, [], false)
      });

      expect(component['generateTableDisplayValues']).toHaveBeenCalled();
    });

    it('should handle ShowAddButton changes', () => {
      spyOn<any>(component, 'ShowButtonColumn');
      
      component.ngOnChanges({
        ShowAddButton: new SimpleChange(false, true, false)
      });

      expect(component['ShowButtonColumn']).toHaveBeenCalled();
    });

    it('should handle ShowEditButton changes', () => {
      spyOn<any>(component, 'ShowButtonColumn');
      
      component.ngOnChanges({
        ShowEditButton: new SimpleChange(false, true, false)
      });

      expect(component['ShowButtonColumn']).toHaveBeenCalled();
    });

    it('should handle TableDataButtons changes', () => {
      spyOn<any>(component, 'generateTableDisplayValues');
      
      component.ngOnChanges({
        TableDataButtons: new SimpleChange(null, [], false)
      });

      expect(component['generateTableDisplayValues']).toHaveBeenCalled();
    });

    it('should handle TriggerUpdate changes', () => {
      spyOn<any>(component, 'generateTableDisplayValues');
      
      component.ngOnChanges({
        TriggerUpdate: new SimpleChange(null, true, false)
      });

      expect(component['generateTableDisplayValues']).toHaveBeenCalled();
    });

    it('should handle multiple changes at once', () => {
      spyOn<any>(component, 'generateTableDisplayValues');
      spyOn<any>(component, 'ShowButtonColumn');
      
      component.ngOnChanges({
        TableData: new SimpleChange(null, [], false),
        ShowAddButton: new SimpleChange(false, true, false)
      });

      expect(component['generateTableDisplayValues']).toHaveBeenCalled();
      expect(component['ShowButtonColumn']).toHaveBeenCalled();
    });
  });

  describe('SetActiveRec', () => {
    it('should set ActiveRec', () => {
      const record = { id: 1, name: 'Test' };
      component.SetActiveRec = record;
      expect(component.ActiveRec).toEqual(record);
    });

    it('should allow null ActiveRec', () => {
      component.SetActiveRec = null;
      expect(component.ActiveRec).toBeNull();
    });
  });

  describe('Filtering and Sorting', () => {
    it('should support EnableRemovedFilter', () => {
      component.EnableRemovedFilter = true;
      expect(component.EnableRemovedFilter).toBe(true);
    });

    it('should accept RemovedFilterProperty', () => {
      component.RemovedFilterProperty = 'deleted';
      expect(component.RemovedFilterProperty).toBe('deleted');
    });

    it('should accept RemovedFilterPropertyValue', () => {
      component.RemovedFilterPropertyValue = false;
      expect(component.RemovedFilterPropertyValue).toBe(false);
    });

    it('should accept ApplyRemovedFilter', () => {
      component.ApplyRemovedFilter = false;
      expect(component.ApplyRemovedFilter).toBe(false);
    });
  });

  describe('Advanced Features', () => {
    it('should accept AllowActiveRecord', () => {
      component.AllowActiveRecord = true;
      expect(component.AllowActiveRecord).toBe(true);
    });

    it('should accept DisplayRecordInfo', () => {
      component.DisplayRecordInfo = true;
      expect(component.DisplayRecordInfo).toBe(true);
    });

    it('should accept Resizable', () => {
      component.Resizable = true;
      expect(component.Resizable).toBe(true);
    });

    it('should accept ButtonsFirstCol', () => {
      component.ButtonsFirstCol = true;
      expect(component.ButtonsFirstCol).toBe(true);
    });

    it('should accept DisableInputs', () => {
      component.DisableInputs = true;
      expect(component.DisableInputs).toBe(true);
    });

    it('should accept StrikeThroughFn', () => {
      const strikeFn = (rec: any) => rec.completed === true;
      component.StrikeThroughFn = strikeFn;
      expect(component.StrikeThroughFn).toBe(strikeFn);
      expect(component.StrikeThroughFn?.({ completed: true })).toBe(true);
    });

    it('should accept SymbolSize', () => {
      component.SymbolSize = '4rem';
      expect(component.SymbolSize).toBe('4rem');
    });
  });

  describe('TableDataButtons', () => {
    it('should accept custom button configurations', () => {
      const mockCallback = jasmine.createSpy('callback');
      const button = new TableButtonType('custom', mockCallback, 'Custom Action');
      component.TableDataButtons = [button];
      
      expect(component.TableDataButtons.length).toBe(1);
      expect(component.TableDataButtons[0].ButtonType).toBe('custom');
    });

    it('should handle multiple buttons', () => {
      const mockCallback = jasmine.createSpy('callback');
      const btn1 = new TableButtonType('edit', mockCallback);
      const btn2 = new TableButtonType('delete', mockCallback);
      const btn3 = new TableButtonType('view', mockCallback);
      
      component.TableDataButtons = [btn1, btn2, btn3];
      expect(component.TableDataButtons.length).toBe(3);
    });
  });

  describe('Window Resize Handling', () => {
    it('should call setSymbolSizeForButtons on resize', (done) => {
      spyOn<any>(component, 'setSymbolSizeForButtons');
      
      component.onResize({});
      
      // Wait for debounce
      setTimeout(() => {
        expect(component['setSymbolSizeForButtons']).toHaveBeenCalled();
        done();
      }, 250);
    });

    it('should debounce resize events', () => {
      spyOn<any>(component, 'SetTableContainerWidth');
      
      // Trigger multiple resize events
      component.onResize({});
      component.onResize({});
      component.onResize({});
      
      // SetTableContainerWidth should not be called immediately
      expect(component['SetTableContainerWidth']).not.toHaveBeenCalled();
    });
  });
});

describe('TableColType', () => {
  let col: TableColType;

  beforeEach(() => {
    col = new TableColType();
  });

  it('should create an instance', () => {
    expect(col).toBeTruthy();
  });

  it('should have default empty ColLabel', () => {
    expect(col.ColLabel).toBe('');
  });

  it('should have default Required as false', () => {
    expect(col.Required).toBe(false);
  });

  it('should allow setting ColLabel', () => {
    col.ColLabel = 'Test Column';
    expect(col.ColLabel).toBe('Test Column');
  });

  it('should allow setting PropertyName', () => {
    col.PropertyName = 'testProperty';
    expect(col.PropertyName).toBe('testProperty');
  });

  it('should allow setting Width', () => {
    col.Width = '200px';
    expect(col.Width).toBe('200px');
  });

  it('should allow setting Alignment', () => {
    col.Alignment = 'center';
    expect(col.Alignment).toBe('center');
  });

  it('should allow setting SelectList', () => {
    const selectList = [{ id: 1, name: 'Option 1' }, { id: 2, name: 'Option 2' }];
    col.SelectList = selectList;
    expect(col.SelectList).toEqual(selectList);
  });

  it('should allow setting BindingProperty', () => {
    col.BindingProperty = 'id';
    expect(col.BindingProperty).toBe('id');
  });

  it('should allow setting DisplayProperty', () => {
    col.DisplayProperty = 'name';
    expect(col.DisplayProperty).toBe('name');
  });

  it('should allow setting DisplayProperty2', () => {
    col.DisplayProperty2 = 'description';
    expect(col.DisplayProperty2).toBe('description');
  });

  it('should allow setting DisplayEmptyOption', () => {
    col.DisplayEmptyOption = true;
    expect(col.DisplayEmptyOption).toBe(true);
  });

  it('should allow setting TrueValue and FalseValue', () => {
    col.TrueValue = 'yes';
    col.FalseValue = 'no';
    expect(col.TrueValue).toBe('yes');
    expect(col.FalseValue).toBe('no');
  });

  it('should allow setting Type', () => {
    col.Type = 'text';
    expect(col.Type).toBe('text');
  });

  it('should allow setting FieldSize', () => {
    col.FieldSize = 50;
    expect(col.FieldSize).toBe(50);
  });

  it('should allow setting MinValue and MaxValue', () => {
    col.MinValue = 0;
    col.MaxValue = 100;
    expect(col.MinValue).toBe(0);
    expect(col.MaxValue).toBe(100);
  });

  it('should allow setting Rows for textarea', () => {
    col.Rows = 5;
    expect(col.Rows).toBe(5);
  });

  it('should allow setting Required flag', () => {
    col.Required = true;
    expect(col.Required).toBe(true);
  });

  it('should allow setting Href for links', () => {
    col.Href = 'https://example.com';
    expect(col.Href).toBe('https://example.com');
  });

  it('should allow setting ColValueFunction', () => {
    const valueFn = (val: any) => val.toString().toUpperCase();
    col.ColValueFunction = valueFn;
    expect(col.ColValueFunction).toBe(valueFn);
    expect(col.ColValueFunction?.('test')).toBe('TEST');
  });

  it('should allow setting FunctionCallBack', () => {
    const callbackFn = (val: any) => console.log(val);
    col.FunctionCallBack = callbackFn;
    expect(col.FunctionCallBack).toBe(callbackFn);
  });

  it('should allow setting ColorFunction', () => {
    const colorFn = (val: any) => val > 50 ? 'red' : 'green';
    col.ColorFunction = colorFn;
    expect(col.ColorFunction).toBe(colorFn);
    expect(col.ColorFunction?.(60)).toBe('red');
    expect(col.ColorFunction?.(30)).toBe('green');
  });

  it('should allow setting ColorFunctionRecAsParam flag', () => {
    col.ColorFunctionRecAsParam = true;
    expect(col.ColorFunctionRecAsParam).toBe(true);
  });

  it('should allow setting FontColorFunction', () => {
    const fontColorFn = (val: any) => val === 'error' ? 'red' : 'black';
    col.FontColorFunction = fontColorFn;
    expect(col.FontColorFunction).toBe(fontColorFn);
    expect(col.FontColorFunction?.('error')).toBe('red');
    expect(col.FontColorFunction?.('normal')).toBe('black');
  });

  it('should allow setting UnderlineFn', () => {
    const underlineFn = (rec: any, property?: any) => rec.important === true;
    col.UnderlineFn = underlineFn;
    expect(col.UnderlineFn).toBe(underlineFn);
    expect(col.UnderlineFn?.({ important: true })).toBe(true);
    expect(col.UnderlineFn?.({ important: false })).toBe(false);
  });

  it('should support chaining property assignments', () => {
    col.ColLabel = 'Name';
    col.PropertyName = 'name';
    col.Width = '150px';
    col.Type = 'text';
    col.Required = true;

    expect(col.ColLabel).toBe('Name');
    expect(col.PropertyName).toBe('name');
    expect(col.Width).toBe('150px');
    expect(col.Type).toBe('text');
    expect(col.Required).toBe(true);
  });

  it('should handle complex ColValueFunction transformations', () => {
    const data = { firstName: 'John', lastName: 'Doe' };
    col.ColValueFunction = (rec: any) => `${rec.firstName} ${rec.lastName}`;
    expect(col.ColValueFunction?.(data)).toBe('John Doe');
  });

  it('should handle null and undefined values in functions', () => {
    col.ColorFunction = (val: any) => val == null ? 'gray' : 'blue';
    expect(col.ColorFunction?.(null)).toBe('gray');
    expect(col.ColorFunction?.(undefined)).toBe('gray');
    expect(col.ColorFunction?.('value')).toBe('blue');
  });
});

describe('TableButtonType', () => {
  let button: TableButtonType;
  let mockCallback: jasmine.Spy;

  beforeEach(() => {
    mockCallback = jasmine.createSpy('callback');
    button = new TableButtonType('edit', mockCallback, 'Edit Record', 'primary', 'Edit');
  });

  it('should create an instance with all parameters', () => {
    expect(button).toBeTruthy();
    expect(button.ButtonType).toBe('edit');
    expect(button.RecordCallBack).toBe(mockCallback);
    expect(button.Title).toBe('Edit Record');
    expect(button.Type).toBe('primary');
    expect(button.Text).toBe('Edit');
  });

  it('should create an instance with minimal parameters', () => {
    const minButton = new TableButtonType('delete', mockCallback);
    expect(minButton).toBeTruthy();
    expect(minButton.ButtonType).toBe('delete');
    expect(minButton.RecordCallBack).toBe(mockCallback);
    expect(minButton.Title).toBeUndefined();
    expect(minButton.Type).toBeUndefined();
    expect(minButton.Text).toBeUndefined();
  });

  it('should execute RecordCallBack when called', () => {
    const testRecord = { id: 1, name: 'Test' };
    button.RecordCallBack(testRecord);
    expect(mockCallback).toHaveBeenCalledWith(testRecord);
  });

  it('should have default oneOfButtonTypeVisible as false', () => {
    expect(button.isOneOfButtonTypeVisible()).toBe(false);
  });

  it('should allow setting oneOfButtonTypeVisible to true', () => {
    button.setOneOfButtonTypeVisible(true);
    expect(button.isOneOfButtonTypeVisible()).toBe(true);
  });

  it('should allow setting oneOfButtonTypeVisible to false', () => {
    button.setOneOfButtonTypeVisible(true);
    expect(button.isOneOfButtonTypeVisible()).toBe(true);
    button.setOneOfButtonTypeVisible(false);
    expect(button.isOneOfButtonTypeVisible()).toBe(false);
  });

  it('should toggle oneOfButtonTypeVisible', () => {
    expect(button.isOneOfButtonTypeVisible()).toBe(false);
    button.setOneOfButtonTypeVisible(true);
    expect(button.isOneOfButtonTypeVisible()).toBe(true);
    button.setOneOfButtonTypeVisible(false);
    expect(button.isOneOfButtonTypeVisible()).toBe(false);
  });

  it('should allow setting HideFunction', () => {
    const hideFn = (rec: any) => rec.deleted === true;
    button.HideFunction = hideFn;
    expect(button.HideFunction).toBe(hideFn);
    expect(button.HideFunction?.({ deleted: true })).toBe(true);
    expect(button.HideFunction?.({ deleted: false })).toBe(false);
  });

  it('should support different button types', () => {
    const types = ['edit', 'delete', 'view', 'add', 'main', 'success', 'danger', 'warning'];
    types.forEach(type => {
      const btn = new TableButtonType(type, mockCallback);
      expect(btn.ButtonType).toBe(type);
    });
  });

  it('should handle complex HideFunction logic', () => {
    const hideFn = (rec: any) => rec.status === 'archived' || rec.permissions?.includes('hidden');
    button.HideFunction = hideFn;
    
    expect(button.HideFunction?.({ status: 'archived' })).toBe(true);
    expect(button.HideFunction?.({ status: 'active', permissions: ['hidden'] })).toBe(true);
    expect(button.HideFunction?.({ status: 'active', permissions: ['visible'] })).toBe(false);
  });

  it('should execute callback with different record types', () => {
    const numberRecord = 123;
    const stringRecord = 'test';
    const objectRecord = { id: 1, data: 'value' };
    const arrayRecord = [1, 2, 3];

    button.RecordCallBack(numberRecord);
    expect(mockCallback).toHaveBeenCalledWith(numberRecord);

    button.RecordCallBack(stringRecord);
    expect(mockCallback).toHaveBeenCalledWith(stringRecord);

    button.RecordCallBack(objectRecord);
    expect(mockCallback).toHaveBeenCalledWith(objectRecord);

    button.RecordCallBack(arrayRecord);
    expect(mockCallback).toHaveBeenCalledWith(arrayRecord);
  });

  it('should handle null and undefined in callback', () => {
    button.RecordCallBack(null);
    expect(mockCallback).toHaveBeenCalledWith(null);

    button.RecordCallBack(undefined);
    expect(mockCallback).toHaveBeenCalledWith(undefined);
  });

  it('should support creating buttons with different configurations', () => {
    const saveButton = new TableButtonType('save', mockCallback, 'Save Changes', 'success', 'Save');
    const cancelButton = new TableButtonType('cancel', mockCallback, 'Cancel', 'secondary', 'Cancel');
    const customButton = new TableButtonType('custom', mockCallback, undefined, undefined, undefined);

    expect(saveButton.ButtonType).toBe('save');
    expect(saveButton.Title).toBe('Save Changes');
    expect(saveButton.Type).toBe('success');
    expect(saveButton.Text).toBe('Save');

    expect(cancelButton.ButtonType).toBe('cancel');
    expect(customButton.ButtonType).toBe('custom');
  });

  it('should maintain independent visibility state for multiple buttons', () => {
    const button1 = new TableButtonType('btn1', mockCallback);
    const button2 = new TableButtonType('btn2', mockCallback);

    button1.setOneOfButtonTypeVisible(true);
    expect(button1.isOneOfButtonTypeVisible()).toBe(true);
    expect(button2.isOneOfButtonTypeVisible()).toBe(false);

    button2.setOneOfButtonTypeVisible(true);
    expect(button1.isOneOfButtonTypeVisible()).toBe(true);
    expect(button2.isOneOfButtonTypeVisible()).toBe(true);
  });

  it('should handle conditional visibility based on record properties', () => {
    const conditionalHide = (rec: any) => !rec.editable;
    button.HideFunction = conditionalHide;

    const editableRecord = { id: 1, editable: true };
    const nonEditableRecord = { id: 2, editable: false };

    expect(button.HideFunction?.(editableRecord)).toBe(false);
    expect(button.HideFunction?.(nonEditableRecord)).toBe(true);
  });
});
