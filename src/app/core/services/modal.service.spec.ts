import { TestBed } from '@angular/core/testing';
import { ModalService } from './modal.service';
import { GeneralService } from './general.service';
import { Banner } from '../models/api.models';
import { createMockGeneralService } from '../../../test-helpers';

describe('ModalService', () => {
  let service: ModalService;
  let mockGeneralService: any;

  beforeEach(() => {
    mockGeneralService = createMockGeneralService();

    TestBed.configureTestingModule({
      providers: [
        ModalService,
        { provide: GeneralService, useValue: mockGeneralService }
      ]
    });
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Error Modal', () => {
    it('should initially have error modal hidden', (done) => {
      service.showErrorModal$.subscribe(value => {
        expect(value).toBe(false);
        done();
      });
    });

    it('should show error modal when triggered', () => {
      service.triggerError('Test error message');
      expect(service.showErrorModal).toBe(true);
    });

    it('should set error message when triggered', () => {
      service.triggerError('Test error message');
      expect(service.errorMessage).toBe('Test error message');
    });

    it('should handle object with message property', () => {
      service.triggerError({ message: 'Object error message' });
      expect(service.errorMessage).toBe('Object error message');
    });

    it('should handle object with retMessage property', () => {
      service.triggerError({ retMessage: 'Return message' });
      expect(service.errorMessage).toBe('Return message');
    });

    it('should hide error modal when accepted', () => {
      service.triggerError('Test error');
      service.acceptError();
      expect(service.showErrorModal).toBe(false);
    });

    it('should clear error message when accepted', () => {
      service.triggerError('Test error');
      service.acceptError();
      expect(service.errorMessage).toBe('');
    });

    it('should emit error modal visibility changes', (done) => {
      let emissionCount = 0;
      service.showErrorModal$.subscribe(value => {
        if (emissionCount === 0) {
          expect(value).toBe(false);
        } else if (emissionCount === 1) {
          expect(value).toBe(true);
          done();
        }
        emissionCount++;
      });
      service.triggerError('Test');
    });

    it('should emit error message changes', (done) => {
      let emissionCount = 0;
      service.errorMessage$.subscribe(value => {
        if (emissionCount === 0) {
          expect(value).toBe('');
        } else if (emissionCount === 1) {
          expect(value).toBe('New error');
          done();
        }
        emissionCount++;
      });
      service.triggerError('New error');
    });
  });

  describe('Confirm Modal', () => {
    it('should initially have confirm modal hidden', (done) => {
      service.showConfirmModal$.subscribe(value => {
        expect(value).toBe(false);
        done();
      });
    });

    it('should show confirm modal when triggered', () => {
      service.triggerConfirm('Confirm this?', () => {});
      expect(service.showConfirmModal).toBe(true);
    });

    it('should set confirm message when triggered', () => {
      service.triggerConfirm('Confirm this action?', () => {});
      expect(service.confirmMessage).toBe('Confirm this action?');
    });

    it('should execute confirm callback when accepted', () => {
      let callbackExecuted = false;
      service.triggerConfirm('Confirm?', () => {
        callbackExecuted = true;
      });
      service.acceptConfirm();
      expect(callbackExecuted).toBe(true);
    });

    it('should hide confirm modal when accepted', () => {
      service.triggerConfirm('Confirm?', () => {});
      service.acceptConfirm();
      expect(service.showConfirmModal).toBe(false);
    });

    it('should execute reject callback when rejected', () => {
      let rejectCallbackExecuted = false;
      service.triggerConfirm('Confirm?', () => {}, () => {
        rejectCallbackExecuted = true;
      });
      service.rejectConfirm();
      expect(rejectCallbackExecuted).toBe(true);
    });

    it('should hide confirm modal when rejected', () => {
      service.triggerConfirm('Confirm?', () => {});
      service.rejectConfirm();
      expect(service.showConfirmModal).toBe(false);
    });

    it('should not error if reject callback not provided', () => {
      service.triggerConfirm('Confirm?', () => {});
      expect(() => service.rejectConfirm()).not.toThrow();
    });

    it('should clear previous callbacks when new confirmation triggered', () => {
      let firstCallbackExecuted = false;
      let secondCallbackExecuted = false;
      
      service.triggerConfirm('First?', () => {
        firstCallbackExecuted = true;
      });
      
      service.triggerConfirm('Second?', () => {
        secondCallbackExecuted = true;
      });
      
      service.acceptConfirm();
      expect(firstCallbackExecuted).toBe(false);
      expect(secondCallbackExecuted).toBe(true);
    });
  });

  describe('Response Checking', () => {
    it('should return true for valid response', () => {
      const response = { retMessage: 'Success', error: false };
      const result = service.checkResponse(response);
      expect(result).toBe(true);
    });

    it('should return false for error response', () => {
      const response = { retMessage: 'Error occurred', error: true };
      const result = service.checkResponse(response);
      expect(result).toBe(false);
    });

    it('should add banner for error response', () => {
      const response = { retMessage: 'Error occurred', error: true };
      service.checkResponse(response);
      expect(mockGeneralService.addBanner).toHaveBeenCalled();
    });

    it('should handle error response with errorMessage', () => {
      const errorObj = { field: 'error details' };
      const response = { 
        retMessage: 'Error', 
        error: true,
        errorMessage: JSON.stringify(errorObj)
      };
      service.checkResponse(response);
      expect(mockGeneralService.addBanner).toHaveBeenCalled();
    });

    it('should return true for response without error flag', () => {
      const response = { retMessage: 'Success' };
      const result = service.checkResponse(response);
      expect(result).toBe(true);
    });
  });

  describe('Success Banner', () => {
    it('should show banner for successful response with message', () => {
      const response = { retMessage: 'Operation successful' };
      service.successfulResponseBanner(response);
      expect(mockGeneralService.addBanner).toHaveBeenCalled();
    });

    it('should not show banner for empty message', () => {
      const response = { retMessage: '' };
      service.successfulResponseBanner(response);
      expect(mockGeneralService.addBanner).not.toHaveBeenCalled();
    });

    it('should not show banner for null message', () => {
      const response = {};
      service.successfulResponseBanner(response);
      expect(mockGeneralService.addBanner).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation Banner', () => {
    it('should show banner with invalid field names', () => {
      const invalidFields = ['Email', 'Password'];
      service.triggerFormValidationBanner(invalidFields);
      expect(mockGeneralService.addBanner).toHaveBeenCalled();
    });

    it('should handle single invalid field', () => {
      const invalidFields = ['Username'];
      service.triggerFormValidationBanner(invalidFields);
      expect(mockGeneralService.addBanner).toHaveBeenCalled();
    });

    it('should handle empty invalid fields array', () => {
      const invalidFields: string[] = [];
      service.triggerFormValidationBanner(invalidFields);
      expect(mockGeneralService.addBanner).toHaveBeenCalled();
    });
  });

  describe('HTTP Error Handling', () => {
    it('should trigger error modal for HTTP error', () => {
      const error = { 
        statusText: 'Not Found',
        error: 'Resource not found'
      };
      service.handleHTTPError(error);
      expect(service.showErrorModal).toBe(true);
    });

    it('should handle object error details', () => {
      const error = {
        statusText: 'Bad Request',
        error: {
          field1: 'Error message 1',
          field2: 'Error message 2'
        }
      };
      service.handleHTTPError(error);
      expect(service.errorMessage).toContain('Error message 1');
      expect(service.errorMessage).toContain('Error message 2');
    });

    it('should use statusText when error is not an object', () => {
      const error = {
        statusText: 'Internal Server Error',
        error: 'Some error string'
      };
      service.handleHTTPError(error);
      expect(service.errorMessage).toBe('Internal Server Error');
    });

    it('should call decrementCallsFn when provided', () => {
      const decrementFn = jasmine.createSpy('decrementFn');
      const error = { statusText: 'Error', error: 'error' };
      service.handleHTTPError(error, decrementFn);
      expect(decrementFn).toHaveBeenCalled();
    });

    it('should not error if decrementCallsFn not provided', () => {
      const error = { statusText: 'Error', error: 'error' };
      expect(() => service.handleHTTPError(error)).not.toThrow();
    });
  });

  describe('Modal Visibility Count', () => {
    it('should start with zero visible modals', () => {
      expect(service.getModalVisibleCount()).toBe(0);
    });

    it('should increment modal count', () => {
      const count = service.incrementModalVisibleCount();
      expect(count).toBe(1);
      expect(service.getModalVisibleCount()).toBe(1);
    });

    it('should decrement modal count', () => {
      service.incrementModalVisibleCount();
      service.incrementModalVisibleCount();
      const count = service.decrementModalVisibleCount();
      expect(count).toBe(1);
      expect(service.getModalVisibleCount()).toBe(1);
    });

    it('should emit modal count changes on increment', (done) => {
      let emissionCount = 0;
      service.currentModalVisible.subscribe(value => {
        if (emissionCount === 0) {
          expect(value).toBe(0);
        } else if (emissionCount === 1) {
          expect(value).toBe(1);
          done();
        }
        emissionCount++;
      });
      service.incrementModalVisibleCount();
    });

    it('should emit modal count changes on decrement', (done) => {
      service.incrementModalVisibleCount();
      let emissionCount = 0;
      service.currentModalVisible.subscribe(value => {
        if (emissionCount === 0) {
          expect(value).toBe(1);
        } else if (emissionCount === 1) {
          expect(value).toBe(0);
          done();
        }
        emissionCount++;
      });
      service.decrementModalVisibleCount();
    });

    it('should handle multiple increments', () => {
      service.incrementModalVisibleCount();
      service.incrementModalVisibleCount();
      service.incrementModalVisibleCount();
      expect(service.getModalVisibleCount()).toBe(3);
    });

    it('should handle mixed increment and decrement', () => {
      service.incrementModalVisibleCount();
      service.incrementModalVisibleCount();
      service.decrementModalVisibleCount();
      service.incrementModalVisibleCount();
      expect(service.getModalVisibleCount()).toBe(2);
    });
  });
});
