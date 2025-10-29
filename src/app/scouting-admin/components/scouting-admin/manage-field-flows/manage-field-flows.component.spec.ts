import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFieldFlowsComponent } from './manage-field-flows.component';

describe('ManageFieldFlowsComponent', () => {
  let component: ManageFieldFlowsComponent;
  let fixture: ComponentFixture<ManageFieldFlowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFieldFlowsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFieldFlowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
