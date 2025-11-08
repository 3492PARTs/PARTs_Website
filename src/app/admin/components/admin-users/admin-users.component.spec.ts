import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { AdminUsersComponent } from './admin-users.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../test-helpers';

describe('AdminUsersComponent', () => {
  let component: AdminUsersComponent;
  let fixture: ComponentFixture<AdminUsersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ AdminUsersComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
      ]
    });
    fixture = TestBed.createComponent(AdminUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty users array', () => {
    expect(component.users).toEqual([]);
  });

  it('should initialize with empty phoneTypes array', () => {
    expect(component.phoneTypes).toEqual([]);
  });

  it('should initialize with empty groups array', () => {
    expect(component.groups).toEqual([]);
  });

  it('should have user table columns configured', () => {
    expect(component.userTableCols.length).toBe(6);
    expect(component.userTableCols[0].PropertyName).toBe('name');
    expect(component.userTableCols[1].PropertyName).toBe('username');
    expect(component.userTableCols[2].PropertyName).toBe('email');
  });

  it('should have userOption set to 1 by default', () => {
    expect(component.userOption).toBe(1);
  });

  it('should have adminOption set to 1 by default', () => {
    expect(component.adminOption).toBe(1);
  });

  it('should have manageUserModalVisible set to false initially', () => {
    expect(component.manageUserModalVisible).toBe(false);
  });

  it('should have empty filterText initially', () => {
    expect(component.filterText).toBe('');
  });

  it('should have userOptions configured with Active and Inactive', () => {
    expect(component.userOptions.length).toBe(2);
    expect(component.userOptions[0].property).toBe('Active');
    expect(component.userOptions[1].property).toBe('Inactive');
  });
});
