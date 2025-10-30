import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamContactFormComponent } from './team-contact-form.component';

describe('TeamContactFormComponent', () => {
  let component: TeamContactFormComponent;
  let fixture: ComponentFixture<TeamContactFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamContactFormComponent]
    });
    fixture = TestBed.createComponent(TeamContactFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
