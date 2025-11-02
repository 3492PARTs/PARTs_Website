import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Renderer2, ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { SideNavComponent } from './side-nav.component';

/**
 * Test suite for SideNavComponent
 * 
 * This suite verifies the side navigation component's functionality including:
 * - Component initialization and configuration
 * - Responsive behavior for wide and narrow screens
 * - Collapse/expand functionality
 * - Window resize handling with debouncing
 * - Input property handling (Width, HideSideNav, Title)
 * - Initial state validation
 * 
 * The component provides a responsive side navigation that adapts to screen size
 * and user interactions. Tests ensure proper DOM manipulation and state management.
 */
describe('SideNavComponent', () => {
  let component: SideNavComponent;
  let fixture: ComponentFixture<SideNavComponent>;
  let mockRenderer: jasmine.SpyObj<Renderer2>;

  beforeEach(async () => {
    mockRenderer = jasmine.createSpyObj('Renderer2', ['setStyle', 'removeStyle']);

    await TestBed.configureTestingModule({
      imports: [SideNavComponent],
      providers: [
        { provide: Renderer2, useValue: mockRenderer }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SideNavComponent);
    component = fixture.componentInstance;
    
    // Replace the component's renderer with our mock
    (component as any).renderer = mockRenderer;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set starting width from input', () => {
      component.Width = '300px';
      component.ngOnInit();
      
      expect(component.startingWidth).toBe('300px');
    });

    it('should configure for wide screen', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(1200);
      
      component.ngOnInit();
      
      expect(component.hide).toBe(true);
    });

    it('should configure for narrow screen', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(800);
      
      component.ngOnInit();
      
      expect(component.hide).toBe(false);
    });
  });

  describe('collapseCard', () => {
    it('should expand when collapsed', () => {
      component.collapsed = true;
      component.navContainer = new ElementRef({
        scrollHeight: 500,
        nativeElement: document.createElement('div')
      });
      
      component.collapseCard();
      
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(
        component.navContainer.nativeElement,
        'height',
        '500px'
      );
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(
        component.navContainer.nativeElement,
        'overflow',
        'auto'
      );
      expect(component.collapsed).toBe(false);
    });

    it('should collapse when expanded', () => {
      component.collapsed = false;
      component.navContainer = new ElementRef({
        nativeElement: document.createElement('div')
      });
      
      component.collapseCard();
      
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(
        component.navContainer.nativeElement,
        'height',
        '0px'
      );
      expect(mockRenderer.setStyle).toHaveBeenCalledWith(
        component.navContainer.nativeElement,
        'overflow',
        'hidden'
      );
      expect(component.collapsed).toBe(true);
    });
  });

  describe('onResize', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should set mobile mode for narrow screens', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(800);
      
      component.onResize(null);
      jasmine.clock().tick(250);
      
      expect(component.mobile).toBe(true);
    });

    it('should set desktop mode for wide screens', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(1200);
      
      component.onResize(null);
      jasmine.clock().tick(250);
      
      expect(component.mobile).toBe(false);
    });

    it('should clear previous resize timeout', () => {
      spyOn(window, 'clearTimeout');
      component['resizeTimeout'] = 123;
      
      component.onResize(null);
      
      expect(window.clearTimeout).toHaveBeenCalledWith(123);
    });
  });

  describe('Input properties', () => {
    it('should accept Width input', () => {
      component.Width = '250px';
      
      expect(component.Width).toBe('250px');
    });

    it('should accept HideSideNav input', () => {
      component.HideSideNav = true;
      
      expect(component.HideSideNav).toBe(true);
    });

    it('should accept Title input', () => {
      component.Title = 'Test Title';
      
      expect(component.Title).toBe('Test Title');
    });
  });

  describe('Initial state', () => {
    it('should have collapsed set to false', () => {
      expect(component.collapsed).toBe(false);
    });

    it('should have hide set to true', () => {
      expect(component.hide).toBe(true);
    });

    it('should have mobile set to false', () => {
      expect(component.mobile).toBe(false);
    });
  });
});
