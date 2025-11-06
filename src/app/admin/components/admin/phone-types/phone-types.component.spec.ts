import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { PhoneTypesComponent } from './phone-types.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';

describe('PhoneTypesComponent', () => {
  let component: PhoneTypesComponent;
  let fixture: ComponentFixture<PhoneTypesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ PhoneTypesComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
      ]
    });
    fixture = TestBed.createComponent(PhoneTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
