import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageFieldResponsesComponent } from './manage-field-responses.component';

describe('ManageFieldResponsesComponent', () => {
  let component: ManageFieldResponsesComponent;
  let fixture: ComponentFixture<ManageFieldResponsesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ManageFieldResponsesComponent ]
    });
    fixture = TestBed.createComponent(ManageFieldResponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
