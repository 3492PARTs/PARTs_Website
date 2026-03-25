import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';
import { ManageFieldFlowsComponent } from './manage-field-flows.component';

describe('ManageFieldFlowsComponent', () => {
  let component: ManageFieldFlowsComponent;
  let fixture: ComponentFixture<ManageFieldFlowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFieldFlowsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageFieldFlowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have formType set to field', () => {
    expect(component.formType).toBe('field');
  });
});
