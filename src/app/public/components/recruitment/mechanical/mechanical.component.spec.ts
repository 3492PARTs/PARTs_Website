import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';
import { MechanicalComponent } from './mechanical.component';

describe('MechanicalComponent', () => {
  let component: MechanicalComponent;
  let fixture: ComponentFixture<MechanicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MechanicalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MechanicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
