import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFieldFormComponent } from './manage-field-form.component';

describe('ManageFieldFormComponent', () => {
  let component: ManageFieldFormComponent;
  let fixture: ComponentFixture<ManageFieldFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageFieldFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageFieldFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
