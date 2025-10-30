import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowConditionAdminFormComponent } from './flow-condition-admin-form.component';

describe('FlowConditionAdminFormComponent', () => {
  let component: FlowConditionAdminFormComponent;
  let fixture: ComponentFixture<FlowConditionAdminFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowConditionAdminFormComponent]
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
