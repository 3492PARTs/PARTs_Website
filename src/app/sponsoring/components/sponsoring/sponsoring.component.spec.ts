import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../test-helpers';
import { SponsoringComponent } from './sponsoring.component';

describe('SponsoringComponent', () => {
  let component: SponsoringComponent;
  let fixture: ComponentFixture<SponsoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SponsoringComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SponsoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize test flag', () => {
    expect(typeof component.test).toBe('boolean');
  });
});
