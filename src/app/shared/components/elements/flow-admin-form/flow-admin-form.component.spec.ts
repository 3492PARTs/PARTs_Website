import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowAdminFormComponent } from './flow-admin-form.component';

describe('FlowAdminFormComponent', () => {
  let component: FlowAdminFormComponent;
  let fixture: ComponentFixture<FlowAdminFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowAdminFormComponent]
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
