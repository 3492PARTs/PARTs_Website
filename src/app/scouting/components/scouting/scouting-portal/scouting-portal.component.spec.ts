import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScoutingPortalComponent } from './scouting-portal.component';

describe('ScoutPortalComponent', () => {
  let component: ScoutingPortalComponent;
  let fixture: ComponentFixture<ScoutingPortalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ ScoutingPortalComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoutingPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
