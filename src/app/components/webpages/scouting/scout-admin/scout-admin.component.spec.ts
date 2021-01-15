import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScoutAdminComponent } from './scout-admin.component';

describe('ScoutAdminComponent', () => {
  let component: ScoutAdminComponent;
  let fixture: ComponentFixture<ScoutAdminComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ScoutAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoutAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
