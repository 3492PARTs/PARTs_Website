import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QueryList } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { FormComponent } from './form.component';
import { FormElementComponent } from '../form-element/form-element.component';
import { TableComponent } from '../table/table.component';
import { GeneralService } from '@app/core/services/general.service';
import { Banner } from '@app/core/models/api.models';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let mockGeneralService: jasmine.SpyObj<GeneralService>;
  let mockFormElement: jasmine.SpyObj<FormElementComponent>;
  let mockTable: jasmine.SpyObj<TableComponent>;

  beforeEach(async () => {
    mockGeneralService = jasmine.createSpyObj('GeneralService', ['addBanner']);
    
    await TestBed.configureTestingModule({
      imports: [FormComponent, FormsModule],
      providers: [
        { provide: GeneralService, useValue: mockGeneralService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    
    // Create mock form elements
    mockFormElement = jasmine.createSpyObj('FormElementComponent', ['reset', 'touchIt', 'isInvalid'], {
      Name: 'Test Field',
      Touched: false
    });
    mockFormElement.isInvalid.and.returnValue(false);
    
    // Create mock table
    mockTable = jasmine.createSpyObj('TableComponent', [], {
      TableName: 'Test Table',
      formElements: new QueryList<FormElementComponent>()
    });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('reset', () => {
    it('should reset all form elements', () => {
      const formElements = new QueryList<FormElementComponent>();
      formElements.reset([mockFormElement]);
      component.formElements = formElements;
      
      const inputFormElements = new QueryList<FormElementComponent>();
      const mockFormElement2 = jasmine.createSpyObj('FormElementComponent', ['reset']);
      inputFormElements.reset([mockFormElement2]);
      component.FormElements = inputFormElements;

      component.reset();

      expect(mockFormElement.reset).toHaveBeenCalled();
      expect(mockFormElement2.reset).toHaveBeenCalled();
    });

    it('should handle empty form elements', () => {
      component.formElements = new QueryList<FormElementComponent>();
      component.FormElements = new QueryList<FormElementComponent>();

      expect(() => component.reset()).not.toThrow();
    });
  });

  describe('validateAllFelids', () => {
    it('should return empty string when all fields are valid', () => {
      const formElements = new QueryList<FormElementComponent>();
      formElements.reset([mockFormElement]);
      component.formElements = formElements;
      component.FormElements = new QueryList<FormElementComponent>();
      component.tables = new QueryList<TableComponent>();

      const result = component.validateAllFelids();

      expect(result).toBe('');
      expect(mockFormElement.touchIt).toHaveBeenCalled();
      expect(mockFormElement.isInvalid).toHaveBeenCalled();
    });

    it('should return error message when field is invalid', () => {
      mockFormElement.isInvalid.and.returnValue(true);
      const formElements = new QueryList<FormElementComponent>();
      formElements.reset([mockFormElement]);
      component.formElements = formElements;
      component.FormElements = new QueryList<FormElementComponent>();
      component.tables = new QueryList<TableComponent>();

      const result = component.validateAllFelids();

      expect(result).toContain('Test Field is invalid');
    });

    it('should validate input form elements', () => {
      const inputFormElements = new QueryList<FormElementComponent>();
      const mockFormElement2 = jasmine.createSpyObj('FormElementComponent', ['reset', 'touchIt', 'isInvalid'], {
        Name: 'Input Field',
        Touched: false
      });
      mockFormElement2.isInvalid.and.returnValue(true);
      inputFormElements.reset([mockFormElement2]);
      component.FormElements = inputFormElements;
      component.formElements = new QueryList<FormElementComponent>();
      component.tables = new QueryList<TableComponent>();

      const result = component.validateAllFelids();

      expect(result).toContain('Input Field is invalid');
    });

    it('should validate table form elements', () => {
      const tableFormElement = jasmine.createSpyObj('FormElementComponent', ['touchIt', 'isInvalid'], {
        Name: 'Table Field'
      });
      tableFormElement.isInvalid.and.returnValue(true);
      
      const tableFormElements = new QueryList<FormElementComponent>();
      tableFormElements.reset([tableFormElement]);
      
      const mockTableWithElements = jasmine.createSpyObj('TableComponent', [], {
        TableName: 'Data Table',
        formElements: tableFormElements
      });
      
      const tables = new QueryList<TableComponent>();
      tables.reset([mockTableWithElements]);
      
      component.formElements = new QueryList<FormElementComponent>();
      component.FormElements = new QueryList<FormElementComponent>();
      component.tables = tables;

      const result = component.validateAllFelids();

      expect(result).toContain('Data Table');
      expect(result).toContain('Table Field is invalid');
    });

    it('should handle multiple invalid fields', () => {
      const mockFormElement1 = jasmine.createSpyObj('FormElementComponent', ['touchIt', 'isInvalid'], {
        Name: 'Field 1'
      });
      const mockFormElement2 = jasmine.createSpyObj('FormElementComponent', ['touchIt', 'isInvalid'], {
        Name: 'Field 2'
      });
      mockFormElement1.isInvalid.and.returnValue(true);
      mockFormElement2.isInvalid.and.returnValue(true);
      
      const formElements = new QueryList<FormElementComponent>();
      formElements.reset([mockFormElement1, mockFormElement2]);
      component.formElements = formElements;
      component.FormElements = new QueryList<FormElementComponent>();
      component.tables = new QueryList<TableComponent>();

      const result = component.validateAllFelids();

      expect(result).toContain('Field 1 is invalid');
      expect(result).toContain('Field 2 is invalid');
    });
  });

  describe('onSubmit', () => {
    it('should emit SubmitFunction and reset when form is valid', () => {
      const mockForm = {} as NgForm;
      const validFormElement = {
        Name: 'Valid Field',
        Touched: false,
        reset: jasmine.createSpy('reset'),
        touchIt: jasmine.createSpy('touchIt'),
        isInvalid: jasmine.createSpy('isInvalid').and.returnValue(false)
      } as unknown as FormElementComponent;
      
      const formElements = new QueryList<FormElementComponent>();
      formElements.reset([validFormElement]);
      component.formElements = formElements;
      component.FormElements = new QueryList<FormElementComponent>();
      component.tables = new QueryList<TableComponent>();

      spyOn(component.SubmitFunction, 'emit');

      component.onSubmit(mockForm);

      expect(validFormElement.Touched).toBe(true);
      expect(component.SubmitFunction.emit).toHaveBeenCalled();
      expect(validFormElement.reset).toHaveBeenCalled();
      expect(mockGeneralService.addBanner).not.toHaveBeenCalled();
    });

    it('should add banner when form is invalid', () => {
      const mockForm = {} as NgForm;
      const invalidFormElement = {
        Name: 'Invalid Field',
        Touched: false,
        reset: jasmine.createSpy('reset'),
        touchIt: jasmine.createSpy('touchIt'),
        isInvalid: jasmine.createSpy('isInvalid').and.returnValue(true)
      } as unknown as FormElementComponent;
      
      const formElements = new QueryList<FormElementComponent>();
      formElements.reset([invalidFormElement]);
      component.formElements = formElements;
      component.FormElements = new QueryList<FormElementComponent>();
      component.tables = new QueryList<TableComponent>();

      spyOn(component.SubmitFunction, 'emit');

      component.onSubmit(mockForm);

      expect(mockGeneralService.addBanner).toHaveBeenCalledWith(jasmine.any(Banner));
      expect(component.SubmitFunction.emit).not.toHaveBeenCalled();
      expect(invalidFormElement.reset).not.toHaveBeenCalled();
    });

    it('should set Touched property on all form elements', () => {
      const mockForm = {} as NgForm;
      const mockFormElement1 = {
        Name: 'Field 1',
        Touched: false,
        reset: jasmine.createSpy('reset'),
        touchIt: jasmine.createSpy('touchIt'),
        isInvalid: jasmine.createSpy('isInvalid').and.returnValue(false)
      } as unknown as FormElementComponent;
      const mockFormElement2 = {
        Name: 'Field 2',
        Touched: false,
        reset: jasmine.createSpy('reset'),
        touchIt: jasmine.createSpy('touchIt'),
        isInvalid: jasmine.createSpy('isInvalid').and.returnValue(false)
      } as unknown as FormElementComponent;
      
      const formElements = new QueryList<FormElementComponent>();
      formElements.reset([mockFormElement1, mockFormElement2]);
      component.formElements = formElements;
      component.FormElements = new QueryList<FormElementComponent>();
      component.tables = new QueryList<TableComponent>();

      component.onSubmit(mockForm);

      expect(mockFormElement1.Touched).toBe(true);
      expect(mockFormElement2.Touched).toBe(true);
    });

    it('should handle empty form elements on submit', () => {
      const mockForm = {} as NgForm;
      component.formElements = new QueryList<FormElementComponent>();
      component.FormElements = new QueryList<FormElementComponent>();
      component.tables = new QueryList<TableComponent>();

      spyOn(component.SubmitFunction, 'emit');

      expect(() => component.onSubmit(mockForm)).not.toThrow();
      expect(component.SubmitFunction.emit).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle null form element gracefully in validation', () => {
      const formElements = new QueryList<FormElementComponent>();
      formElements.reset([null as any]);
      component.formElements = formElements;
      component.FormElements = new QueryList<FormElementComponent>();
      component.tables = new QueryList<TableComponent>();

      const result = component.validateAllFelids();

      expect(result).toBe('');
    });

    it('should handle undefined FormElements', () => {
      component.FormElements = new QueryList<FormElementComponent>();
      component.formElements = new QueryList<FormElementComponent>();
      component.tables = new QueryList<TableComponent>();

      expect(() => component.reset()).not.toThrow();
      expect(() => component.validateAllFelids()).not.toThrow();
    });
  });
});
