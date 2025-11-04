import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { CalendarComponent } from './calendar.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../test-helpers';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the calendar wrapper', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const calendarWrapper = compiled.querySelector('#calendarWrapper');
    expect(calendarWrapper).toBeTruthy();
  });

  it('should render Google Calendar iframe', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const iframe = compiled.querySelector('iframe#calendar');
    expect(iframe).toBeTruthy();
  });

  it('should have correct Google Calendar embed URL', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const iframe = compiled.querySelector('iframe#calendar') as HTMLIFrameElement;
    expect(iframe.src).toContain('calendar.google.com/calendar/embed');
    expect(iframe.src).toContain('6n20ln0u5pcpg2d98fk9o7bkhg%40group.calendar.google.com');
  });

  it('should set iframe timezone to America/New_York', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const iframe = compiled.querySelector('iframe#calendar') as HTMLIFrameElement;
    expect(iframe.src).toContain('ctz=America/New_York');
  });

  it('should have iframe with no border', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const iframe = compiled.querySelector('iframe#calendar') as HTMLIFrameElement;
    expect(iframe.style.border).toContain('0');
  });

  it('should have iframe with frameborder set to 0', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const iframe = compiled.querySelector('iframe#calendar') as HTMLIFrameElement;
    expect(iframe.getAttribute('frameborder')).toBe('0');
  });

  it('should have iframe with scrolling disabled', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const iframe = compiled.querySelector('iframe#calendar') as HTMLIFrameElement;
    expect(iframe.getAttribute('scrolling')).toBe('no');
  });
});
