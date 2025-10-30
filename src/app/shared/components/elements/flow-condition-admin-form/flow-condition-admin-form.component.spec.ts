import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { FlowConditionAdminFormComponent } from './flow-condition-admin-form.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';

describe('FlowConditionAdminFormComponent', () => {
  let component: FlowConditionAdminFormComponent;
  let fixture: ComponentFixture<FlowConditionAdminFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowConditionAdminFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FlowConditionAdminFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
