import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFieldFlowConditionsComponent } from './manage-field-flow-conditions.component';

describe('ManageFieldFlowConditionsComponent', () => {
  let component: ManageFieldFlowConditionsComponent;
  let fixture: ComponentFixture<ManageFieldFlowConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFieldFlowConditionsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ManageFieldFlowConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
