import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamApplicationFormComponent } from './team-application-form.component';

describe('TeamApplicationFormComponent', () => {
  let component: TeamApplicationFormComponent;
  let fixture: ComponentFixture<TeamApplicationFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ TeamApplicationFormComponent ]
    });
    fixture = TestBed.createComponent(TeamApplicationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
