import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent, TableButtonType, TableColType } from './table.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

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
