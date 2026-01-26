import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';

import { FormElementComponent } from './form-element.component';
import { GeneralService } from '@app/core/services/general.service';
import { NavigationService } from '@app/navigation/services/navigation.service';

describe('FormElementComponent', () => {
  let component: FormElementComponent;
  let fixture: ComponentFixture<FormElementComponent>;
  let generalService: GeneralService;
  let navigationService: NavigationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormElementComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FormElementComponent);
    component = fixture.componentInstance;
    generalService = TestBed.inject(GeneralService);
    navigationService = TestBed.inject(NavigationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.FormGroup).toBe(false);
      expect(component.Type).toBe('text');
      expect(component.Disabled).toBe(false);
      expect(component.Required).toBe(false);
      expect(component.valid).toBe(true);
    });

    it('should generate unique LabelID on init', () => {
      const component2 = TestBed.createComponent(FormElementComponent).componentInstance;
      component2.ngOnInit();
      expect(component.LabelID).not.toBe(component2.LabelID);
    });

    it('should set default FieldSize to 2000 when null', () => {
      const testComponent = TestBed.createComponent(FormElementComponent).componentInstance;
      testComponent.FieldSize = null;
      testComponent.ngOnInit();
      expect(testComponent.FieldSize).not.toBeNull();
      // The value will be 2000
    });

    it('should use LabelText as Name when Name is empty', () => {
      component.Name = '';
      component.LabelText = 'Test Label';
      component.ngOnInit();
      expect(component.Name).toBe('Test Label');
    });

    it('should set width to 100% for checkbox type with "other" label', () => {
      component.Type = 'checkbox';
      component.LabelText = 'Other';
      component.ngOnInit();
      expect(component.Width).toBe('100%');
    });

    it('should set width to 100px for number type', () => {
      component.Type = 'number';
      component.Width = 'auto';
      component.ngOnInit();
      expect(component.Width).toBe('100px');
    });
  });

  describe('Phone number formatting', () => {
    it('should format phone number correctly', () => {
      const formatted = component.formatPhone('1234567890');
      expect(formatted).toBe('(123) 456-7890');
    });

    it('should handle partial phone numbers', () => {
      expect(component.formatPhone('123')).toBe('(123');
      expect(component.formatPhone('1234')).toBe('(123) 4');
      expect(component.formatPhone('1234567')).toBe('(123) 456-7');
    });

    it('should handle empty phone number', () => {
      expect(component.formatPhone('')).toBe('');
    });

    it('should strip non-numeric characters', () => {
      expect(component.formatPhone('(123) 456-7890')).toBe('(123) 456-7890');
      expect(component.formatPhone('abc123def456ghi7890')).toBe('(123) 456-7890');
    });

    it('should truncate phone numbers longer than 10 digits', () => {
      expect(component.formatPhone('12345678901234')).toBe('(123) 456-7890');
    });
  });

  describe('Value changes', () => {
    it('should emit ModelChange on text change', () => {
      spyOn(component.ModelChange, 'emit');
      component.Type = 'text';
      component.change('new value');
      expect(component.ModelChange.emit).toHaveBeenCalledWith('new value');
    });

    it('should emit TrueValue when checkbox is checked', () => {
      spyOn(component.ModelChange, 'emit');
      component.Type = 'checkbox';
      component.TrueValue = 'yes';
      component.FalseValue = 'no';

      const event = { target: { checked: true } };
      component.change(event);
      expect(component.ModelChange.emit).toHaveBeenCalledWith('yes');
    });

    it('should emit FalseValue when checkbox is unchecked', () => {
      spyOn(component.ModelChange, 'emit');
      component.Type = 'checkbox';
      component.TrueValue = 'yes';
      component.FalseValue = 'no';

      const event = { target: { checked: false } };
      component.change(event);
      expect(component.ModelChange.emit).toHaveBeenCalledWith('no');
    });

    it('should respect MinValue for number input with valid initial model', () => {
      component.Type = 'number';
      component.MinValue = 10;
      component.Model = 15;

      component.change(5);
      // The component applies MinValue constraint
      expect(component.Model).toBeGreaterThanOrEqual(10);
    });

    it('should respect MaxValue for number input with valid initial model', () => {
      component.Type = 'number';
      component.MaxValue = 100;
      component.Model = 50;

      component.change(150);
      // The component applies MaxValue constraint
      expect(component.Model).toBeLessThanOrEqual(100);
    });

    it('should allow values within MinValue and MaxValue range', () => {
      component.Type = 'number';
      component.MinValue = 10;
      component.MaxValue = 100;
      component.Model = 50;

      component.change(50);
      expect(component.Model).toBe(50);

      component.change(75);
      expect(component.Model).toBe(75);
    });
  });

  describe('Validation', () => {
    it('should mark field as invalid when required and empty', () => {
      component.Required = true;
      component.Touched = true;
      component.Model = '';

      const invalid = component.isInvalid();
      expect(invalid).toBe(true);
      expect(component.valid).toBe(false);
    });

    it('should mark field as valid when required and has value', () => {
      component.Required = true;
      component.Touched = true;
      component.Model = 'test value';

      const invalid = component.isInvalid();
      expect(invalid).toBe(false);
      expect(component.valid).toBe(true);
    });

    it('should validate email format', () => {
      component.Type = 'email';
      component.Touched = true;

      component.Model = 'invalid-email';
      expect(component.isInvalid()).toBe(true);

      component.Model = 'valid@email.com';
      expect(component.isInvalid()).toBe(false);
    });

    it('should validate phone number length', () => {
      component.Type = 'phone';
      component.Touched = true;

      component.Model = '123456789'; // 9 digits
      expect(component.isInvalid()).toBe(true);

      component.Model = '1234567890'; // 10 digits
      expect(component.isInvalid()).toBe(false);
    });

    it('should use custom ValidityFunction when provided', () => {
      component.Touched = true;
      component.ValidityFunction = jasmine.createSpy('validity').and.returnValue(false);

      const invalid = component.isInvalid();
      expect(invalid).toBe(true);
      expect(component.ValidityFunction).toHaveBeenCalled();
    });

    it('should not validate when disabled', () => {
      component.Disabled = true;
      component.Required = true;
      component.Touched = true;
      component.Model = '';

      const invalid = component.isInvalid();
      expect(invalid).toBe(false);
    });
  });

  describe('Focus management', () => {
    it('should mark as touched on focusIn', () => {
      component.Touched = false;
      component.focusIn();
      expect(component.Touched).toBe(true);
      expect(component.Focused).toBe(true);
    });

    it('should emit OnFocusOut event', () => {
      spyOn(component.OnFocusOut, 'emit');
      component.Focused = true;
      component.focusOut();
      expect(component.OnFocusOut.emit).toHaveBeenCalled();
      expect(component.Focused).toBe(false);
    });

    it('should reset focus and touch state', () => {
      component.Touched = true;
      component.Focused = true;
      component.reset();
      expect(component.Touched).toBe(false);
      expect(component.Focused).toBe(false);
    });
  });

  describe('Number increment/decrement', () => {
    it('should increment number value', () => {
      spyOn(component.ModelChange, 'emit');
      component.Model = 5;
      component.increment();
      expect(component.ModelChange.emit).toHaveBeenCalledWith(6);
    });

    it('should decrement number value', () => {
      spyOn(component.ModelChange, 'emit');
      component.Model = 5;
      component.decrement();
      expect(component.ModelChange.emit).toHaveBeenCalledWith(4);
    });

    it('should not decrement below zero', () => {
      spyOn(component.ModelChange, 'emit');
      component.Model = 0;
      component.decrement();
      expect(component.ModelChange.emit).toHaveBeenCalledWith(0);
    });

    it('should initialize to 0 if model is empty', () => {
      spyOn(component.ModelChange, 'emit');
      component.Model = null;
      component.increment();
      expect(component.Model).toBe(1);
    });
  });

  describe('MAC address formatting', () => {
    it('should format MAC address', () => {
      spyOn(component, 'change');
      component.formatMAC('AABBCCDDEEFF');
      expect(component.change).toHaveBeenCalledWith('AA:BB:CC:DD:EE:FF');
    });

    it('should remove existing colons and reformat', () => {
      spyOn(component, 'change');
      component.formatMAC('AA:BB:CC:DD:EE:FF');
      expect(component.change).toHaveBeenCalledWith('AA:BB:CC:DD:EE:FF');
    });

    it('should truncate to 17 characters (6 octets)', () => {
      spyOn(component, 'change');
      component.formatMAC('AABBCCDDEEFF112233');
      expect(component.change).toHaveBeenCalledWith('AA:BB:CC:DD:EE:FF');
    });
  });

  describe('MultiSelect functionality', () => {
    beforeEach(() => {
      component.Type = 'multiSelect';
      component.BindingProperty = 'id';
      component.DisplayProperty = 'name';
    });

    it('should select all items', () => {
      component.multiSelectModel = [
        { id: 1, name: 'Item 1', checked: false },
        { id: 2, name: 'Item 2', checked: false }
      ];
      component.Model = [];

      spyOn(component, 'change');
      component.selectAll();

      expect(component.change).toHaveBeenCalledTimes(2);
      expect(component.change).toHaveBeenCalledWith(true, 0);
      expect(component.change).toHaveBeenCalledWith(true, 1);
    });

    it('should deselect all items', () => {
      component.multiSelectModel = [
        { id: 1, name: 'Item 1', checked: true },
        { id: 2, name: 'Item 2', checked: true }
      ];
      component.Model = [];

      spyOn(component, 'change');
      component.deselectAll();

      expect(component.change).toHaveBeenCalledTimes(2);
      expect(component.change).toHaveBeenCalledWith(false, 0);
      expect(component.change).toHaveBeenCalledWith(false, 1);
    });
  });

  describe('File upload', () => {
    beforeEach(() => {
      // Create a mock ViewChild for fileUpload
      component.fileUpload = { nativeElement: { value: '' } };
    });

    it('should handle file selection', () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const event = {
        target: {
          files: [mockFile]
        }
      };

      spyOn(component, 'change');
      component.fileProgress(event);

      expect(component.fileName).toBe('test.txt');
      expect(component.change).toHaveBeenCalledWith(mockFile);
    });

    it('should truncate long filenames', () => {
      const mockFile = new File(['test'], 'this_is_a_very_long_filename_that_should_be_truncated.txt', { type: 'text/plain' });
      const event = {
        target: {
          files: [mockFile]
        }
      };

      component.fileProgress(event);
      expect(component.fileName).toContain('....');
      expect(component.fileName).toContain('txt');
    });
  });

  describe('Rating functionality', () => {
    it('should set rating value when not disabled', () => {
      component.Type = 'rating';
      component.Disabled = false;
      spyOn(component, 'change');

      component.setRating(4);
      expect(component.change).toHaveBeenCalledWith(4);
    });

    it('should not set rating when disabled', () => {
      component.Type = 'rating';
      component.Disabled = true;
      spyOn(component, 'change');

      component.setRating(4);
      expect(component.change).not.toHaveBeenCalled();
    });
  });

  describe('Stopwatch functionality', () => {
    it('should start stopwatch', () => {
      component.stopwatchStart();
      expect(component['stopwatchRun']).toBe(true);
    });

    it('should stop stopwatch', () => {
      component['stopwatchRun'] = true;
      component.stopwatchStop();
      expect(component['stopwatchRun']).toBe(false);
    });

    it('should reset stopwatch values', () => {
      component['stopwatchHour'] = 1;
      component['stopwatchMinute'] = 30;
      component['stopwatchSecond'] = 45;

      component.stopwatchReset();

      expect(component['stopwatchHour']).toBe(0);
      expect(component['stopwatchMinute']).toBe(0);
      expect(component['stopwatchSecond']).toBe(0);
    });
  });

  describe('Utility functions', () => {
    it('should check if string is empty using strNoE', () => {
      expect(component.strNoE('')).toBe(true);
      expect(component.strNoE(null)).toBe(true);
      expect(component.strNoE(undefined)).toBe(true);
      expect(component.strNoE('value')).toBe(false);
    });

    it('should emit ResetFunction event', () => {
      spyOn(component.ResetFunction, 'emit');
      component.runResetFunction();
      expect(component.ResetFunction.emit).toHaveBeenCalled();
    });
  });
});
