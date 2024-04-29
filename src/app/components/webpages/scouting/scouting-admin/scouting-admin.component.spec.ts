import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScoutingAdminComponent } from './scouting-admin.component';

describe('ScoutAdminComponent', () => {
  let component: ScoutingAdminComponent;
  let fixture: ComponentFixture<ScoutingAdminComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ScoutingAdminComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoutingAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
