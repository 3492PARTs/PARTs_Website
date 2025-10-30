import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamNotesComponent } from './team-notes.component';

describe('TeamNotesComponent', () => {
  let component: TeamNotesComponent;
  let fixture: ComponentFixture<TeamNotesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamNotesComponent]
    });
    fixture = TestBed.createComponent(TeamNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
