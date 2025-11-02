import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QueryList } from '@angular/core';
import { FormElementGroupComponent } from './form-element-group.component';
import { FormElementComponent } from '../form-element/form-element.component';
import { QuestionFormElementComponent } from '@app/shared/components/elements/question-form-element/question-form-element.component';
import { GeneralService } from '@app/core/services/general.service';

describe('FormElementGroupComponent', () => {
  let component: FormElementGroupComponent;
  let fixture: ComponentFixture<FormElementGroupComponent>;

  beforeEach(async () => {
    const generalServiceStub = jasmine.createSpyObj('GeneralService', ['getNextGsId']);

    await TestBed.configureTestingModule({
      imports: [FormElementGroupComponent],
      providers: [
        { provide: GeneralService, useValue: generalServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormElementGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inputs', () => {
    it('should accept Inline input', () => {
      component.Inline = true;
      expect(component.Inline).toBe(true);
    });

    it('should accept MaxWidth input', () => {
      component.MaxWidth = true;
      expect(component.MaxWidth).toBe(true);
    });

    it('should accept LabelText input', () => {
      component.LabelText = 'Test Label';
      expect(component.LabelText).toBe('Test Label');
    });

    it('should accept InlineElements input', () => {
      component.InlineElements = true;
      expect(component.InlineElements).toBe(true);
    });

    it('should accept RemoveBorder input', () => {
      component.RemoveBorder = true;
      expect(component.RemoveBorder).toBe(true);
    });

    it('should accept MarginTop input', () => {
      component.MarginTop = '2em';
      expect(component.MarginTop).toBe('2em');
    });
  });

  describe('ngOnInit', () => {
    it('should set FormGroupInline on form elements when InlineElements is true', () => {
      const mockFormElement1: any = { FormGroupInline: false };
      const mockFormElement2: any = { FormGroupInline: false };
      
      component.formElements = new QueryList<FormElementComponent>();
      (component.formElements as any)._results = [mockFormElement1, mockFormElement2];
      component.InlineElements = true;
      
      component.ngOnInit();
      
      expect(mockFormElement1.FormGroupInline).toBe(true);
      expect(mockFormElement2.FormGroupInline).toBe(true);
    });

    it('should set FormGroupInline on question form elements when InlineElements is true', () => {
      const mockFormElement: any = { FormGroupInline: false };
      const mockQuestionFormElement = { formElement: mockFormElement } as QuestionFormElementComponent;
      
      component.questionFormElements = new QueryList<QuestionFormElementComponent>();
      (component.questionFormElements as any)._results = [mockQuestionFormElement];
      component.InlineElements = true;
      
      component.ngOnInit();
      
      expect(mockFormElement.FormGroupInline).toBe(true);
    });

    it('should not set FormGroupInline when InlineElements is false', () => {
      const mockFormElement: any = { FormGroupInline: false };
      
      component.formElements = new QueryList<FormElementComponent>();
      (component.formElements as any)._results = [mockFormElement];
      component.InlineElements = false;
      
      component.ngOnInit();
      
      expect(mockFormElement.FormGroupInline).toBe(false);
    });
  });

  describe('setFormGroup', () => {
    it('should set FormGroup to true on form elements when InlineElements is false', (done) => {
      const mockFormElement: any = { 
        FormGroup: false,
        FormGroupInline: false
      };
      
      component.formElements = new QueryList<FormElementComponent>();
      (component.formElements as any)._results = [mockFormElement];
      component.InlineElements = false;
      
      component.setFormGroup();
      
      setTimeout(() => {
        expect(mockFormElement.FormGroup).toBe(true);
        done();
      }, 10);
    });

    it('should set FormGroupInline to true on form elements when InlineElements is true', (done) => {
      const mockFormElement: any = { 
        FormGroup: false,
        FormGroupInline: false
      };
      
      component.formElements = new QueryList<FormElementComponent>();
      (component.formElements as any)._results = [mockFormElement];
      component.InlineElements = true;
      
      component.setFormGroup();
      
      setTimeout(() => {
        expect(mockFormElement.FormGroupInline).toBe(true);
        done();
      }, 10);
    });

    it('should set FormGroup on question form element form elements when InlineElements is false', (done) => {
      const mockFormElement: any = { 
        FormGroup: false,
        FormGroupInline: false
      };
      const mockQuestionFormElement = { formElement: mockFormElement } as QuestionFormElementComponent;
      
      component.questionFormElements = new QueryList<QuestionFormElementComponent>();
      (component.questionFormElements as any)._results = [mockQuestionFormElement];
      component.InlineElements = false;
      
      component.setFormGroup();
      
      setTimeout(() => {
        expect(mockFormElement.FormGroup).toBe(true);
        done();
      }, 10);
    });

    it('should set FormGroupInline on question form element form elements when InlineElements is true', (done) => {
      const mockFormElement: any = { 
        FormGroup: false,
        FormGroupInline: false
      };
      const mockQuestionFormElement = { formElement: mockFormElement } as QuestionFormElementComponent;
      
      component.questionFormElements = new QueryList<QuestionFormElementComponent>();
      (component.questionFormElements as any)._results = [mockQuestionFormElement];
      component.InlineElements = true;
      
      component.setFormGroup();
      
      setTimeout(() => {
        expect(mockFormElement.FormGroupInline).toBe(true);
        done();
      }, 10);
    });
  });

  describe('setFormElements', () => {
    it('should reset FormElements with form elements only', () => {
      const mockFormElement1: any = {};
      const mockFormElement2: any = {};
      
      component.formElements = new QueryList<FormElementComponent>();
      (component.formElements as any)._results = [mockFormElement1, mockFormElement2];
      component.questionFormElements = new QueryList<QuestionFormElementComponent>();
      component.FormElements = new QueryList<FormElementComponent>();
      
      component.setFormElements();
      
      expect(component.FormElements.length).toBe(2);
    });

    it('should reset FormElements with question form elements included', () => {
      const mockFormElement1: any = {};
      const mockFormElement2: any = {};
      const mockQuestionFormElement = { formElement: mockFormElement2 } as QuestionFormElementComponent;
      
      component.formElements = new QueryList<FormElementComponent>();
      (component.formElements as any)._results = [mockFormElement1];
      component.questionFormElements = new QueryList<QuestionFormElementComponent>();
      (component.questionFormElements as any)._results = [mockQuestionFormElement];
      component.FormElements = new QueryList<FormElementComponent>();
      
      component.setFormElements();
      
      expect(component.FormElements.length).toBe(2);
    });

    it('should emit FormElementsChange event', () => {
      spyOn(component.FormElementsChange, 'emit');
      const mockFormElement: any = {};
      
      component.formElements = new QueryList<FormElementComponent>();
      (component.formElements as any)._results = [mockFormElement];
      component.questionFormElements = new QueryList<QuestionFormElementComponent>();
      component.FormElements = new QueryList<FormElementComponent>();
      
      component.setFormElements();
      
      expect(component.FormElementsChange.emit).toHaveBeenCalledWith(component.FormElements);
    });
  });

  describe('ngAfterViewInit', () => {
    it('should call setFormGroup on init', () => {
      spyOn(component, 'setFormGroup');
      
      component.ngAfterViewInit();
      
      expect(component.setFormGroup).toHaveBeenCalled();
    });

    it('should call setFormElements on init', () => {
      spyOn(component, 'setFormElements');
      
      component.ngAfterViewInit();
      
      expect(component.setFormElements).toHaveBeenCalled();
    });

    it('should subscribe to formElements changes', () => {
      spyOn(component.formElements.changes, 'subscribe');
      
      component.ngAfterViewInit();
      
      expect(component.formElements.changes.subscribe).toHaveBeenCalled();
    });

    it('should subscribe to questionFormElements changes', () => {
      spyOn(component.questionFormElements.changes, 'subscribe');
      
      component.ngAfterViewInit();
      
      expect(component.questionFormElements.changes.subscribe).toHaveBeenCalled();
    });
  });
});
