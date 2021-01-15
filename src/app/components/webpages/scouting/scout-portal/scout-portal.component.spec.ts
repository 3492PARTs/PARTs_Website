import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScoutPortalComponent } from './scout-portal.component';

describe('ScoutPortalComponent', () => {
  let component: ScoutPortalComponent;
  let fixture: ComponentFixture<ScoutPortalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ScoutPortalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoutPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
