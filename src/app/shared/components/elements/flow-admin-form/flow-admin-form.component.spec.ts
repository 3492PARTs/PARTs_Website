import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { FlowAdminFormComponent } from './flow-admin-form.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';

describe('FlowAdminFormComponent', () => {
  let component: FlowAdminFormComponent;
  let fixture: ComponentFixture<FlowAdminFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowAdminFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowAdminFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
