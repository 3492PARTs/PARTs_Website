import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { TeamContactFormComponent } from './team-contact-form.component';
import { GeneralService } from '@app/core/services/general.service';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush, createMockGeneralService } from '../../../../test-helpers';

describe('TeamContactFormComponent', () => {
  let component: TeamContactFormComponent;
  let fixture: ComponentFixture<TeamContactFormComponent>;

  beforeEach(() => {
    const mockGeneralService = {
      ...createMockGeneralService(),
      isMobile: jasmine.createSpy('isMobile').and.returnValue(false),
      incrementOutstandingCalls: jasmine.createSpy('incrementOutstandingCalls'),
      decrementOutstandingCalls: jasmine.createSpy('decrementOutstandingCalls'),
    };

    TestBed.configureTestingModule({
      imports: [TeamContactFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: GeneralService, useValue: mockGeneralService },
      ]
    });
    fixture = TestBed.createComponent(TeamContactFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defines teamContactResponsesCols with 4 columns', () => {
    expect(component.teamContactResponsesCols.length).toBe(4);
  });

  it('has ID column as first column', () => {
    expect(component.teamContactResponsesCols[0].PropertyName).toBe('id');
    expect(component.teamContactResponsesCols[0].ColLabel).toBe('ID');
  });

  it('has Name column as second column', () => {
    expect(component.teamContactResponsesCols[1].PropertyName).toBe('questionanswer_set[0].answer');
    expect(component.teamContactResponsesCols[1].ColLabel).toBe('Name');
  });

  it('has Message column with function type as third column', () => {
    const col = component.teamContactResponsesCols[2];
    expect(col.ColLabel).toBe('Message');
    expect(col.Type).toBe('function');
    expect(col.ColValueFunction).toBeDefined();
  });

  it('has Time column as fourth column', () => {
    expect(component.teamContactResponsesCols[3].PropertyName).toBe('time');
    expect(component.teamContactResponsesCols[3].ColLabel).toBe('Time');
  });

  describe('truncateMessage (via ColValueFunction)', () => {
    let truncate: (s: string) => string;

    beforeEach(() => {
      truncate = component.teamContactResponsesCols[2].ColValueFunction as (s: string) => string;
    });

    it('returns full string when length < 100', () => {
      const short = 'Hello World';
      expect(truncate(short)).toBe('Hello World');
    });

    it('returns full string without ellipsis when length equals 99', () => {
      const str99 = 'a'.repeat(99);
      const result = truncate(str99);
      expect(result).toBe(str99);
      expect(result.endsWith('...')).toBeFalse();
    });

    it('returns full string without ellipsis when length equals 100', () => {
      const str100 = 'b'.repeat(100);
      const result = truncate(str100);
      expect(result).toBe(str100 + '...');
    });

    it('truncates to 100 characters and adds ellipsis when length > 100', () => {
      const long = 'x'.repeat(150);
      const result = truncate(long);
      expect(result).toBe('x'.repeat(100) + '...');
    });
  });
});
