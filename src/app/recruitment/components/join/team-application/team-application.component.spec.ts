import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamApplicationComponent } from './team-application.component';

describe('TeamApplicationComponent', () => {
  let component: TeamApplicationComponent;
  let fixture: ComponentFixture<TeamApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamApplicationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
