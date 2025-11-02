import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Renderer2, ElementRef, QueryList } from '@angular/core';
import { BoxSideNavWrapperComponent } from './box-side-nav-wrapper.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { BoxComponent } from '../box/box.component';

describe('BoxSideNavWrapperComponent', () => {
  let component: BoxSideNavWrapperComponent;
  let fixture: ComponentFixture<BoxSideNavWrapperComponent>;
  let mockRenderer: jasmine.SpyObj<Renderer2>;

  beforeEach(async () => {
    mockRenderer = jasmine.createSpyObj('Renderer2', ['setStyle']);

    await TestBed.configureTestingModule({
      imports: [BoxSideNavWrapperComponent],
      providers: [
        { provide: Renderer2, useValue: mockRenderer }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BoxSideNavWrapperComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ShowSideNavigation input', () => {
    it('should set HideSideNav when sideNav exists', () => {
      const mockSideNav = {
        HideSideNav: false,
        sideNav: new ElementRef(document.createElement('div')),
        startingWidth: '300px',
        Width: '300px'
      } as any;
      
      component.sideNav = mockSideNav;
      component.ShowSideNavigation = true;
      
      expect(mockSideNav.HideSideNav).toBe(true);
    });

    it('should not throw error when sideNav does not exist', () => {
      component.sideNav = undefined;
      
      expect(() => {
        component.ShowSideNavigation = true;
      }).not.toThrow();
    });
  });

  describe('ngAfterContentInit', () => {
    it('should call checkBoxesTimeout', (done) => {
      spyOn<any>(component, 'checkBoxesTimeout');
      
      component.ngAfterContentInit();
      
      setTimeout(() => {
        expect(component['checkBoxesTimeout']).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should subscribe to boxes changes', () => {
      const mockQueryList = new QueryList<BoxComponent>();
      component.boxes = mockQueryList;
      
      spyOn<any>(component, 'checkBoxesTimeout');
      
      component.ngAfterContentInit();
      
      // Trigger changes
      (mockQueryList as any).notifyOnChanges();
      
      expect(component['checkBoxesTimeout']).toHaveBeenCalled();
    });
  });

  describe('onResize', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should clear existing resize timer', () => {
      spyOn(window, 'clearTimeout');
      component['resizeTimer'] = 123;
      
      component.onResize(null);
      
      expect(window.clearTimeout).toHaveBeenCalledWith(123);
    });

    it('should call checkBoxes after timeout', () => {
      spyOn<any>(component, 'checkBoxes');
      
      component.onResize(null);
      jasmine.clock().tick(250);
      
      expect(component['checkBoxes']).toHaveBeenCalled();
    });
  });

  describe('shrinkBoxes for wide screen', () => {
    beforeEach(() => {
      spyOnProperty(window, 'innerWidth').and.returnValue(1200);
    });

    it('should style sideNav for wide screen', () => {
      const mockElement = document.createElement('div');
      const mockSideNav = {
        sideNav: new ElementRef(mockElement),
        startingWidth: '300px',
        Width: '250px'
      } as any;
      
      component.sideNav = mockSideNav;
      component['checkBoxes']();
      
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(mockElement, 'float', 'left');
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(mockElement, 'margin', '1em');
      expect(mockSideNav.Width).toBe('300px');
    });

    it('should style boxes for wide screen without hiding sideNav', () => {
      const mockElement = document.createElement('div');
      const mockSideNav = {
        sideNav: new ElementRef(document.createElement('div')),
        startingWidth: '300px',
        Width: '300px'
      } as any;
      
      const mockBox = {
        box: new ElementRef(mockElement)
      } as any;
      
      const mockQueryList = new QueryList<BoxComponent>();
      (mockQueryList as any)._results = [mockBox];
      (mockQueryList as any)._emitDistinctChangesOnly = false;
      
      component.sideNav = mockSideNav;
      component.boxes = mockQueryList;
      component['HideSideNav'] = false;
      
      component['checkBoxes']();
      
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(
        mockElement,
        'max-width',
        'calc(100% - 300px - 3em)'
      );
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(mockElement, 'float', 'right');
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(mockElement, 'margin', '1em 1em 0 0');
    });

    it('should style boxes for wide screen with hiding sideNav', () => {
      const mockElement = document.createElement('div');
      const mockSideNav = {
        sideNav: new ElementRef(document.createElement('div')),
        startingWidth: '300px',
        Width: '300px'
      } as any;
      
      const mockBox = {
        box: new ElementRef(mockElement)
      } as any;
      
      const mockQueryList = new QueryList<BoxComponent>();
      (mockQueryList as any)._results = [mockBox];
      (mockQueryList as any)._emitDistinctChangesOnly = false;
      
      component.sideNav = mockSideNav;
      component.boxes = mockQueryList;
      component['HideSideNav'] = true;
      
      component['checkBoxes']();
      
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(mockElement, 'max-width', '100%');
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(mockElement, 'float', 'none');
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(mockElement, 'margin', '1em auto 0 auto');
    });
  });

  describe('expandBoxes for narrow screen', () => {
    beforeEach(() => {
      spyOnProperty(window, 'innerWidth').and.returnValue(800);
    });

    it('should style boxes for narrow screen', () => {
      const mockElement = document.createElement('div');
      const mockBox = {
        box: new ElementRef(mockElement)
      } as any;
      
      const mockQueryList = new QueryList<BoxComponent>();
      (mockQueryList as any)._results = [mockBox];
      (mockQueryList as any)._emitDistinctChangesOnly = false;
      
      component.boxes = mockQueryList;
      
      component['checkBoxes']();
      
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(mockElement, 'max-width', '100%');
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(mockElement, 'margin', '1em auto 0 auto');
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(mockElement, 'float', 'none');
    });

    it('should style sideNav for narrow screen', () => {
      const mockElement = document.createElement('div');
      const mockSideNav = {
        sideNav: new ElementRef(mockElement),
        startingWidth: '300px',
        Width: '300px'
      } as any;
      
      component.sideNav = mockSideNav;
      
      component['checkBoxes']();
      
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(mockElement, 'float', 'none');
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(mockElement, 'margin', '01em 0 0 0');
      expect(mockSideNav.Width).toBe('100%');
    });
  });

  describe('checkBoxesTimeout', () => {
    it('should call checkBoxes after timeout', (done) => {
      spyOn<any>(component, 'checkBoxes');
      
      component['checkBoxesTimeout']();
      
      setTimeout(() => {
        expect(component['checkBoxes']).toHaveBeenCalled();
        done();
      }, 10);
    });
  });
});
