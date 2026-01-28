import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { SubNavigationComponent } from './sub-navigation.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../test-helpers';
import { NavigationService } from '@app/navigation/services/navigation.service';
import { Link } from '@app/core/models/navigation.models';

describe('SubNavigationComponent', () => {
  let component: SubNavigationComponent;
  let fixture: ComponentFixture<SubNavigationComponent>;
  let navigationService: NavigationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubNavigationComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SubNavigationComponent);
    component = fixture.componentInstance;
    navigationService = TestBed.inject(NavigationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.navExpanded).toBe(false);
    expect(component.hideNavExpander).toBe(false);
    expect(component.page).toBeDefined();
    expect(component.navItems).toBeDefined();
  });

  it('should set navExpanded through input setter', () => {
    component.setNavExpanded = true;
    expect(component.navExpanded).toBe(true);

    component.setNavExpanded = false;
    expect(component.navExpanded).toBe(false);
  });

  it('should accept hideNavExpander input', () => {
    component.hideNavExpander = true;
    fixture.detectChanges();
    expect(component.hideNavExpander).toBe(true);
  });

  it('should accept navItems input', () => {
    const testLinks: Link[] = [
      new Link('Test 1', '/test1', 'icon1'),
      new Link('Test 2', '/test2', 'icon2')
    ];

    component.navItems = testLinks;
    fixture.detectChanges();
    expect(component.navItems.length).toBe(2);
  });

  it('should subscribe to navigation service subPages on init', () => {
    navigationService.setSubPages('/admin/admin-users');

    expect(component.navItems.length).toBeGreaterThan(0);
  });

  it('should subscribe to navigation service subPage on init', () => {
    navigationService.setSubPage('/test-page');

    expect(component.page).toBe('/test-page');
  });

  it('should call navigation service setSubPage when setPage is called', () => {
    spyOn(navigationService, 'setSubPage');

    component.setPage('new-page');

    expect(navigationService.setSubPage).toHaveBeenCalledWith('new-page');
  });

  it('should update page when navigation service broadcasts new page', () => {
    navigationService.setSubPage('page-one');
    expect(component.page).toBe('page-one');

    navigationService.setSubPage('page-two');
    expect(component.page).toBe('page-two');
  });

  it('should update navItems when navigation service broadcasts new pages', () => {
    navigationService.setSubPages('/admin/users');
    const items1Length = component.navItems.length;
    expect(items1Length).toBeGreaterThan(0);

    navigationService.setSubPages('/scouting/admin/activity');
    const items2Length = component.navItems.length;
    expect(items2Length).toBeGreaterThan(0);
  });
});
