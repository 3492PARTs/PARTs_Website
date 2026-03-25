import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { TeamApplicationFormComponent } from './team-application-form.component';
import { GeneralService } from '@app/core/services/general.service';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush, createMockGeneralService } from '../../../../test-helpers';

describe('TeamApplicationFormComponent', () => {
  let component: TeamApplicationFormComponent;
  let fixture: ComponentFixture<TeamApplicationFormComponent>;

  beforeEach(() => {
    const mockGeneralService = {
      ...createMockGeneralService(),
      isMobile: jasmine.createSpy('isMobile').and.returnValue(false),
      incrementOutstandingCalls: jasmine.createSpy('incrementOutstandingCalls'),
      decrementOutstandingCalls: jasmine.createSpy('decrementOutstandingCalls'),
    };

    TestBed.configureTestingModule({
      imports: [TeamApplicationFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: GeneralService, useValue: mockGeneralService },
      ]
    });
    fixture = TestBed.createComponent(TeamApplicationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defines teamApplicationResponsesCols with 3 columns', () => {
    expect(component.teamApplicationResponsesCols.length).toBe(3);
  });

  it('has ID column as first column', () => {
    expect(component.teamApplicationResponsesCols[0].PropertyName).toBe('id');
    expect(component.teamApplicationResponsesCols[0].ColLabel).toBe('ID');
  });

  it('has Name column as second column', () => {
    expect(component.teamApplicationResponsesCols[1].PropertyName).toBe('questionanswer_set[0].answer');
    expect(component.teamApplicationResponsesCols[1].ColLabel).toBe('Name');
  });

  it('has Time column as third column', () => {
    expect(component.teamApplicationResponsesCols[2].PropertyName).toBe('time');
    expect(component.teamApplicationResponsesCols[2].ColLabel).toBe('Time');
  });
});
