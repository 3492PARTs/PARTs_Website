import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSeasonComponent } from './manage-season.component';

describe('ManageSeasonComponent', () => {
  let component: ManageSeasonComponent;
  let fixture: ComponentFixture<ManageSeasonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageSeasonComponent]
    });
    fixture = TestBed.createComponent(ManageSeasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
