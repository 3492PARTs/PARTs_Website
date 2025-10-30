import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { TeamApplicationComponent } from './team-application.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';

describe('TeamApplicationComponent', () => {
  let component: TeamApplicationComponent;
  let fixture: ComponentFixture<TeamApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ TeamApplicationComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
      ]
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
