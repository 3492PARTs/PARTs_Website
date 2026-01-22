import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { ModalService } from '@app/core/services/modal.service';
import { GeneralService } from '@app/core/services/general.service';
import { AppSize } from '@app/core/utils/utils.functions';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let mockModalService: any;
  let mockGeneralService: any;

  beforeEach(async () => {
    mockModalService = {
      incrementModalVisibleCount: jasmine.createSpy('incrementModalVisibleCount'),
      decrementModalVisibleCount: jasmine.createSpy('decrementModalVisibleCount'),
      getModalVisibleCount: jasmine.createSpy('getModalVisibleCount').and.returnValue(1)
    };

    mockGeneralService = {
      getAppSize: jasmine.createSpy('getAppSize').and.returnValue(AppSize.LG)
    };

    await TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [
        { provide: ModalService, useValue: mockModalService },
        { provide: GeneralService, useValue: mockGeneralService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should set modal size on init', () => {
      spyOn(component, 'setModalSize');
      component.ngOnInit();
      expect(component.setModalSize).toHaveBeenCalled();
    });

    it('should set ButtonType to main if ButtonText exists and ButtonType is empty', () => {
      component.ButtonText = 'Click me';
      component.ButtonType = '';
      component.ngOnInit();
      expect(component.ButtonType).toBe('main');
    });

    it('should not set ButtonType if ButtonText is empty', () => {
      component.ButtonText = '';
      component.ButtonType = '';
      component.ngOnInit();
      expect(component.ButtonType).toBe('');
    });
  });

  describe('Modal Size', () => {
    it('should set width to 90% for 3XLG screens when Width is empty', () => {
      mockGeneralService.getAppSize.and.returnValue(AppSize._3XLG);
      component.Width = '';
      component.setModalSize();
      expect(component._Width).toBe('90%');
    });

    it('should set width to 80% for LG screens when Width is empty', () => {
      mockGeneralService.getAppSize.and.returnValue(AppSize.LG);
      component.Width = '';
      component.setModalSize();
      expect(component._Width).toBe('80%');
    });

    it('should set width to 100% for small screens when Width is empty', () => {
      mockGeneralService.getAppSize.and.returnValue(AppSize.SM);
      component.Width = '';
      component.setModalSize();
      expect(component._Width).toBe('100%');
    });

    it('should use custom Width if provided', () => {
      component.Width = '50%';
      component.setModalSize();
      expect(component._Width).toBe('50%');
    });

    it('should handle resize event', (done) => {
      spyOn(component, 'setModalSize');
      component.onResize(null);

      setTimeout(() => {
        expect(component.setModalSize).toHaveBeenCalled();
        done();
      }, 250);
    });
  });

  describe('Visible Input', () => {
    it('should open modal when Visible is set to true', () => {
      spyOn(component, 'open');
      component['openTime'] = undefined;
      component.Visible = true;
      expect(component.open).toHaveBeenCalled();
    });

    it('should close modal when Visible is set to false', () => {
      spyOn(component, 'close');
      component['openTime'] = Date.now();
      component.Visible = false;
      expect(component.close).toHaveBeenCalled();
    });

    it('should not open if already open', () => {
      spyOn(component, 'open');
      component['openTime'] = Date.now();
      component.Visible = true;
      expect(component.open).not.toHaveBeenCalled();
    });

    it('should not close if already closed', () => {
      spyOn(component, 'close');
      component['openTime'] = undefined;
      component.Visible = false;
      expect(component.close).not.toHaveBeenCalled();
    });
  });

  describe('open', () => {
    it('should set openTime', () => {
      component.open();
      expect(component['openTime']).toBeDefined();
    });

    it('should increment modal visible count', () => {
      component.open();
      expect(mockModalService.incrementModalVisibleCount).toHaveBeenCalled();
    });

    it('should get and set modal number', () => {
      mockModalService.getModalVisibleCount.and.returnValue(5);
      component.open();
      expect(component['modalNumber']).toBe(5);
    });

    it('should emit VisibleChange event', () => {
      spyOn(component.VisibleChange, 'emit');
      component.open();
      expect(component.VisibleChange.emit).toHaveBeenCalledWith(true);
    });

    it('should set page scrolling', () => {
      spyOn(component, 'setPageScrolling');
      component.open();
      expect(component.setPageScrolling).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    beforeEach(() => {
      component['openTime'] = Date.now();
    });

    it('should clear openTime', () => {
      component.close();
      expect(component['openTime']).toBeUndefined();
    });

    it('should decrement modal visible count', () => {
      component.close();
      expect(mockModalService.decrementModalVisibleCount).toHaveBeenCalled();
    });

    it('should emit VisibleChange event', () => {
      spyOn(component.VisibleChange, 'emit');
      component.close();
      expect(component.VisibleChange.emit).toHaveBeenCalledWith(false);
    });

    it('should set page scrolling', () => {
      spyOn(component, 'setPageScrolling');
      component.close();
      expect(component.setPageScrolling).toHaveBeenCalled();
    });

    it('should reset forms', () => {
      const mockForm = jasmine.createSpyObj('FormComponent', ['reset']);
      component.form = {
        forEach: (callback: any) => callback(mockForm)
      } as any;

      component.close();
      expect(mockForm.reset).toHaveBeenCalled();
    });
  });

  /*
  describe('clickOutsideClose', () => {
    it('should not close if modal is not open', () => {
      component['openTime'] = undefined;
      spyOn(window, 'setTimeout');
      component.clickOutsideClose();
      expect(window.setTimeout).not.toHaveBeenCalled();
    });

    it('should not close if not the top modal', () => {
      component['openTime'] = Date.now();
      component['modalNumber'] = 1;
      mockModalService.getModalVisibleCount.and.returnValue(2);
      spyOn(window, 'setTimeout');
      component.clickOutsideClose();
      expect(window.setTimeout).not.toHaveBeenCalled();
    });

    it('should close after delay if top modal and enough time elapsed', (done) => {
      component['openTime'] = Date.now() - 100;
      component['modalNumber'] = 1;
      mockModalService.getModalVisibleCount.and.returnValue(1);
      spyOn(component, 'close');
      
      component.clickOutsideClose();
      
      setTimeout(() => {
        expect(component.close).toHaveBeenCalled();
        done();
      }, 20);
    });

    it('should not close if modal just opened (delta < 10ms)', () => {
      component['openTime'] = Date.now();
      component['modalNumber'] = 1;
      mockModalService.getModalVisibleCount.and.returnValue(1);
      spyOn(window, 'setTimeout');
      component.clickOutsideClose();
      expect(window.setTimeout).not.toHaveBeenCalled();
    });
  });
  */

  describe('setPageScrolling', () => {
    it('should hide scrolling when modal is open', () => {
      component['openTime'] = Date.now();
      component.setPageScrolling();
      expect(document.documentElement.style.overflow).toBe('hidden');
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore scrolling when modal is closed', () => {
      component['openTime'] = undefined;
      component.setPageScrolling();
      expect(document.documentElement.style.overflow).toBe('initial');
      expect(document.body.style.overflow).toBe('initial');
    });
  });

  describe('Input properties', () => {
    it('should accept ButtonType input', () => {
      component.ButtonType = 'secondary';
      expect(component.ButtonType).toBe('secondary');
    });

    it('should accept ButtonText input', () => {
      component.ButtonText = 'Submit';
      expect(component.ButtonText).toBe('Submit');
    });

    it('should accept Title input', () => {
      component.Title = 'My Modal';
      expect(component.Title).toBe('My Modal');
    });

    it('should accept Width input', () => {
      component.Width = '60%';
      expect(component.Width).toBe('60%');
    });

    it('should accept MinWidth input', () => {
      component.MinWidth = '300px';
      expect(component.MinWidth).toBe('300px');
    });

    it('should accept MaxWidth input', () => {
      component.MaxWidth = '800px';
      expect(component.MaxWidth).toBe('800px');
    });

    it('should accept zIndex input', () => {
      component.zIndex = 20;
      expect(component.zIndex).toBe(20);
    });

    it('should have default zIndex of 17', () => {
      expect(component.zIndex).toBe(17);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete open and close cycle', () => {
      expect(component['openTime']).toBeUndefined();

      component.open();
      expect(component['openTime']).toBeDefined();
      expect(mockModalService.incrementModalVisibleCount).toHaveBeenCalled();

      component.close();
      expect(component['openTime']).toBeUndefined();
      expect(mockModalService.decrementModalVisibleCount).toHaveBeenCalled();
    });

    it('should handle multiple modals', () => {
      mockModalService.getModalVisibleCount.and.returnValue(1);
      component.open();
      expect(component['modalNumber']).toBe(1);

      mockModalService.getModalVisibleCount.and.returnValue(2);
      const component2 = new ModalComponent(mockModalService, mockGeneralService);
      component2.open();
      expect(component2['modalNumber']).toBe(2);
    });

    it('should resize modal on window resize', (done) => {
      const initialWidth = component._Width;
      mockGeneralService.getAppSize.and.returnValue(AppSize._3XLG);

      component.onResize(null);

      setTimeout(() => {
        expect(component._Width).not.toBe(initialWidth);
        done();
      }, 250);
    });
  });
});
