import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoutingUsersComponent } from './scouting-users.component';

describe('ScoutingUsersComponent', () => {
  let component: ScoutingUsersComponent;
  let fixture: ComponentFixture<ScoutingUsersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScoutingUsersComponent]
    });
    fixture = TestBed.createComponent(ScoutingUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
