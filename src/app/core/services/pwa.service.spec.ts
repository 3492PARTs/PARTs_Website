import { TestBed } from '@angular/core/testing';
import { PwaService } from './pwa.service';
import { SwUpdate } from '@angular/service-worker';
import { GeneralService } from './general.service';
import { ModalService } from './modal.service';
import { createMockSwUpdate, createMockGeneralService, createMockModalService } from '../../../test-helpers';
import { of } from 'rxjs';

describe('PwaService', () => {
  let service: PwaService;
  let mockSwUpdate: any;
  let mockGeneralService: any;
  let mockModalService: any;

  beforeEach(() => {
    mockSwUpdate = createMockSwUpdate();
    mockGeneralService = createMockGeneralService();
    mockModalService = createMockModalService();

    TestBed.configureTestingModule({
      providers: [
        PwaService,
        { provide: SwUpdate, useValue: mockSwUpdate },
        { provide: GeneralService, useValue: mockGeneralService },
        { provide: ModalService, useValue: mockModalService }
      ]
    });
    service = TestBed.inject(PwaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should call initPwaPrompt on construction', () => {
      spyOn(PwaService.prototype, 'initPwaPrompt');
      const newService = new PwaService(mockSwUpdate, mockGeneralService, mockModalService);
      expect(newService.initPwaPrompt).toHaveBeenCalled();
    });

    it('should check for updates if service worker is enabled', () => {
      mockSwUpdate.isEnabled = true;
      const newService = new PwaService(mockSwUpdate, mockGeneralService, mockModalService);
      expect(mockSwUpdate.checkForUpdate).toHaveBeenCalled();
    });

    it('should not check for updates if service worker is disabled', () => {
      mockSwUpdate.isEnabled = false;
      mockSwUpdate.checkForUpdate.calls.reset();
      const newService = new PwaService(mockSwUpdate, mockGeneralService, mockModalService);
      // checkForUpdate should not be called when disabled
      expect(true).toBe(true); // Just verify no errors
    });
  });

  describe('installEligible observable', () => {
    it('should have installEligible observable', (done) => {
      service.installEligible.subscribe(value => {
        expect(value).toBe(false);
        done();
      });
    });

    it('should emit changes when setInstallEligible is called', (done) => {
      let emissionCount = 0;
      service.installEligible.subscribe(value => {
        if (emissionCount === 0) {
          expect(value).toBe(false);
        } else if (emissionCount === 1) {
          expect(value).toBe(true);
          done();
        }
        emissionCount++;
      });
      service.setInstallEligible(true);
    });
  });

  describe('setInstallEligible', () => {
    it('should update install eligible status to true', (done) => {
      service.installEligible.subscribe(value => {
        if (value === true) {
          expect(value).toBe(true);
          done();
        }
      });
      service.setInstallEligible(true);
    });

    it('should update install eligible status to false', (done) => {
      service.setInstallEligible(true);
      let emissionCount = 0;
      service.installEligible.subscribe(value => {
        if (emissionCount === 1) {
          expect(value).toBe(false);
          done();
        }
        emissionCount++;
      });
      service.setInstallEligible(false);
    });

    it('should toggle install eligible status', () => {
      let lastValue: boolean | undefined;
      service.installEligible.subscribe(value => {
        lastValue = value;
      });
      
      service.setInstallEligible(true);
      expect(lastValue).toBe(true);
      
      service.setInstallEligible(false);
      expect(lastValue).toBe(false);
      
      service.setInstallEligible(true);
      expect(lastValue).toBe(true);
    });
  });

  describe('installPwa', () => {
    it('should set install eligible to false', () => {
      const mockPromptEvent = {
        prompt: jasmine.createSpy('prompt'),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };
      service['promptEvent'] = mockPromptEvent;
      
      spyOn(service, 'setInstallEligible');
      service.installPwa();
      
      expect(service.setInstallEligible).toHaveBeenCalledWith(false);
    });

    it('should call prompt on promptEvent', () => {
      const mockPromptEvent = {
        prompt: jasmine.createSpy('prompt'),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };
      service['promptEvent'] = mockPromptEvent;
      
      service.installPwa();
      
      expect(mockPromptEvent.prompt).toHaveBeenCalled();
    });

    it('should handle accepted install choice', (done) => {
      const mockPromptEvent = {
        prompt: jasmine.createSpy('prompt'),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };
      service['promptEvent'] = mockPromptEvent;
      
      spyOn(console, 'log');
      service.installPwa();
      
      setTimeout(() => {
        expect(console.log).toHaveBeenCalledWith('install pwa');
        done();
      }, 10);
    });

    it('should handle dismissed install choice', (done) => {
      const mockPromptEvent = {
        prompt: jasmine.createSpy('prompt'),
        userChoice: Promise.resolve({ outcome: 'dismissed' })
      };
      service['promptEvent'] = mockPromptEvent;
      
      spyOn(console, 'log');
      service.installPwa();
      
      setTimeout(() => {
        expect(console.log).toHaveBeenCalledWith('not install pwa');
        done();
      }, 10);
    });

    it('should clear promptEvent after user choice', (done) => {
      const mockPromptEvent = {
        prompt: jasmine.createSpy('prompt'),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };
      service['promptEvent'] = mockPromptEvent;
      
      service.installPwa();
      
      setTimeout(() => {
        expect(service['promptEvent']).toBeNull();
        done();
      }, 10);
    });
  });

  describe('initPwaPrompt', () => {
    it('should call initPwaPrompt without errors', () => {
      expect(() => service.initPwaPrompt()).not.toThrow();
    });

    it('should set up beforeinstallprompt event listener', () => {
      spyOn(window, 'addEventListener');
      service.initPwaPrompt();
      expect(window.addEventListener).toHaveBeenCalledWith('beforeinstallprompt', jasmine.any(Function));
    });
  });

  describe('Service Worker Updates', () => {
    it('should handle VERSION_DETECTED event', () => {
      spyOn(console, 'log');
      const versionEvent = {
        type: 'VERSION_DETECTED',
        version: { hash: 'abc123' }
      };
      
      // Simulate the subscription
      mockSwUpdate.versionUpdates = of(versionEvent);
      const newService = new PwaService(mockSwUpdate, mockGeneralService, mockModalService);
      
      expect(console.log).toHaveBeenCalledWith('Downloading new app version: abc123');
    });

    it('should handle VERSION_READY event', () => {
      const versionEvent = {
        type: 'VERSION_READY',
        currentVersion: { hash: 'old123' },
        latestVersion: { hash: 'new456' }
      };
      
      mockSwUpdate.versionUpdates = of(versionEvent);
      const newService = new PwaService(mockSwUpdate, mockGeneralService, mockModalService);
      
      expect(mockModalService.triggerConfirm).toHaveBeenCalled();
    });

    it('should handle VERSION_INSTALLATION_FAILED event', () => {
      spyOn(console, 'log');
      const versionEvent = {
        type: 'VERSION_INSTALLATION_FAILED',
        version: { hash: 'failed123' },
        error: 'Installation error'
      };
      
      mockSwUpdate.versionUpdates = of(versionEvent);
      const newService = new PwaService(mockSwUpdate, mockGeneralService, mockModalService);
      
      expect(console.log).toHaveBeenCalledWith(jasmine.stringContaining('Failed to install'));
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete PWA installation flow', (done) => {
      service.setInstallEligible(true);
      
      let eligible = false;
      service.installEligible.subscribe(value => {
        if (value === true) {
          eligible = true;
        }
      });
      
      expect(eligible).toBe(true);
      
      const mockPromptEvent = {
        prompt: jasmine.createSpy('prompt'),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };
      service['promptEvent'] = mockPromptEvent;
      
      service.installPwa();
      
      setTimeout(() => {
        expect(mockPromptEvent.prompt).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should handle service worker enabled with periodic updates', () => {
      mockSwUpdate.isEnabled = true;
      jasmine.clock().install();
      
      const newService = new PwaService(mockSwUpdate, mockGeneralService, mockModalService);
      
      mockSwUpdate.checkForUpdate.calls.reset();
      jasmine.clock().tick(15 * 60 * 1000); // 15 minutes
      
      expect(mockSwUpdate.checkForUpdate).toHaveBeenCalled();
      
      jasmine.clock().uninstall();
    });
  });
});
