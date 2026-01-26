import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavigationService, NavigationState } from '../../core/services/navigation.service';
import { GeneralService } from '../../core/services/general.service';
import { createMockGeneralService, createMockRouter } from '../../../test-helpers';
import { Link } from '../../core/models/navigation.models';

describe('NavigationService', () => {
  let service: NavigationService;
  let mockGeneralService: any;
  let mockRouter: any;

  beforeEach(() => {
    mockGeneralService = createMockGeneralService();
    mockRouter = createMockRouter();

    TestBed.configureTestingModule({
      providers: [
        NavigationService,
        { provide: GeneralService, useValue: mockGeneralService },
        { provide: Router, useValue: mockRouter }
      ]
    });
    service = TestBed.inject(NavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Application Menu', () => {
    it('should have predefined application menu', () => {
      expect(service.applicationMenu).toBeDefined();
      expect(service.applicationMenu.length).toBeGreaterThan(0);
    });

    it('should have Join PARTs in menu', () => {
      const joinLink = service.applicationMenu.find(link => link.menu_name === 'Join PARTs');
      expect(joinLink).toBeDefined();
    });

    it('should have Contact Us in menu', () => {
      const contactLink = service.applicationMenu.find(link => link.menu_name === 'Contact Us');
      expect(contactLink).toBeDefined();
      expect(contactLink?.routerlink).toBe('contact');
    });

    it('should have Members section in menu', () => {
      const membersLink = service.applicationMenu.find(link => link.menu_name === 'Members');
      expect(membersLink).toBeDefined();
      expect(membersLink?.menu_items.length).toBeGreaterThan(0);
    });
  });

  describe('Sub Pages', () => {
    it('should have admin sub pages', () => {
      expect(service.allSubPages[0]).toBeDefined();
      expect(service.allSubPages[0].length).toBeGreaterThan(0);
    });

    it('should have scouting admin sub pages', () => {
      expect(service.allSubPages[1]).toBeDefined();
      expect(service.allSubPages[1].length).toBeGreaterThan(0);
    });

    it('should have strategizing sub pages', () => {
      expect(service.allSubPages[2]).toBeDefined();
      expect(service.allSubPages[2].length).toBeGreaterThan(0);
    });
  });

  describe('setSubPage', () => {
    it('should set sub page', (done) => {
      const testLink = '/admin/users';
      service.subPage.subscribe(value => {
        if (value === testLink) {
          expect(value).toBe(testLink);
          done();
        }
      });
      service.setSubPage(testLink);
    });

    it('should not emit if same sub page is set again', () => {
      const testLink = '/admin/users';
      let emissionCount = 0;
      service.subPage.subscribe(() => {
        emissionCount++;
      });
      service.setSubPage(testLink);
      service.setSubPage(testLink);
      // Should only emit twice: initial empty value + first setSubPage
      expect(emissionCount).toBe(2);
    });

    it('should emit when different sub page is set', () => {
      let emissionCount = 0;
      service.subPage.subscribe(() => {
        emissionCount++;
      });
      service.setSubPage('/admin/users');
      service.setSubPage('/admin/meetings');
      // Should emit 3 times: initial + 2 different values
      expect(emissionCount).toBe(3);
    });
  });

  describe('setSubPages', () => {
    it('should set admin sub pages for admin route', () => {
      service.setSubPages('/admin/users');
      service.subPages.subscribe(pages => {
        expect(pages.length).toBeGreaterThan(0);
        expect(pages.some(p => p.menu_name === 'Users')).toBe(true);
      });
    });

    it('should set scouting admin sub pages for scouting-admin route', () => {
      service.setSubPages('/scouting-admin/activity');
      service.subPages.subscribe(pages => {
        expect(pages.length).toBeGreaterThan(0);
        expect(pages.some(p => p.menu_name === 'Scouting Activity')).toBe(true);
      });
    });

    it('should set strategizing sub pages for scouting/strategizing route', () => {
      service.setSubPages('/scouting/strategizing/matches');
      service.subPages.subscribe(pages => {
        expect(pages.length).toBeGreaterThan(0);
        expect(pages.some(p => p.menu_name === 'Matches')).toBe(true);
      });
    });

    it('should set active sub page to matching route', () => {
      service.setSubPages('/admin/users');
      service.subPage.subscribe(page => {
        if (page !== '') {
          expect(page).toBe('/admin/admin-users');
        }
      });
    });

    it('should navigate to first sub page if route not found', () => {
      service.setSubPages('/admin/nonexistent');
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should set first sub page as active if no match found', () => {
      service.setSubPages('/admin/nonexistent');
      service.subPage.subscribe(page => {
        if (page !== '') {
          expect(page).toBe('/admin/admin-users');
        }
      });
    });

    it('should handle route without sub pages', () => {
      service.setSubPages('/home');
      service.subPages.subscribe(pages => {
        expect(pages.length).toBe(0);
      });
    });

    it('should set empty sub page for routes without sub pages', () => {
      service.setSubPages('/home');
      service.subPage.subscribe(page => {
        expect(page).toBe('');
      });
    });
  });

  describe('Navigation State', () => {
    it('should start with expanded navigation state', (done) => {
      service.currentNavigationState.subscribe(state => {
        expect(state).toBe(NavigationState.expanded);
        done();
      });
    });

    it('should set navigation state to collapsed', (done) => {
      let emissionCount = 0;
      service.currentNavigationState.subscribe(state => {
        if (emissionCount === 1) {
          expect(state).toBe(NavigationState.collapsed);
          done();
        }
        emissionCount++;
      });
      service.setNavigationState(NavigationState.collapsed);
    });

    it('should set navigation state to hidden', (done) => {
      let emissionCount = 0;
      service.currentNavigationState.subscribe(state => {
        if (emissionCount === 1) {
          expect(state).toBe(NavigationState.hidden);
          done();
        }
        emissionCount++;
      });
      service.setNavigationState(NavigationState.hidden);
    });

    it('should emit navigation state changes', () => {
      let emissionCount = 0;
      service.currentNavigationState.subscribe(() => {
        emissionCount++;
      });
      service.setNavigationState(NavigationState.collapsed);
      service.setNavigationState(NavigationState.hidden);
      service.setNavigationState(NavigationState.expanded);
      expect(emissionCount).toBe(4); // initial + 3 changes
    });
  });

  describe('Pages with Navigation', () => {
    it('should have admin in pages with navigation', () => {
      expect(service.pagesWithNavigation).toContain('admin');
    });

    it('should have scouting admin in pages with navigation', () => {
      expect(service.pagesWithNavigation).toContain('scouting admin');
    });

    it('should have strategizing in pages with navigation', () => {
      expect(service.pagesWithNavigation).toContain('strategizing');
    });
  });

  describe('NavigationState enum', () => {
    it('should have expanded state', () => {
      expect(NavigationState.expanded).toBeDefined();
    });

    it('should have collapsed state', () => {
      expect(NavigationState.collapsed).toBeDefined();
    });

    it('should have hidden state', () => {
      expect(NavigationState.hidden).toBeDefined();
    });

    it('should have different values for each state', () => {
      expect(NavigationState.expanded).not.toBe(NavigationState.collapsed);
      expect(NavigationState.collapsed).not.toBe(NavigationState.hidden);
      expect(NavigationState.hidden).not.toBe(NavigationState.expanded);
    });
  });

  describe('Nested scouting routes', () => {
    it('should set scouting admin pages for nested scouting/scouting-admin route', () => {
      service.setSubPages('/scouting/scouting-admin/activity');
      service.subPages.subscribe(pages => {
        if (pages.length > 0) {
          expect(pages.some(p => p.menu_name === 'Scouting Activity')).toBe(true);
        }
      });
    });
  });
});
