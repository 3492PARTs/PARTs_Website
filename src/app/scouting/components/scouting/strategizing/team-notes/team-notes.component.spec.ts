import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { TeamNotesComponent } from './team-notes.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../../test-helpers';

describe('TeamNotesComponent', () => {
  let component: TeamNotesComponent;
  let fixture: ComponentFixture<TeamNotesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ TeamNotesComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
      ]
    });
    fixture = TestBed.createComponent(TeamNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
