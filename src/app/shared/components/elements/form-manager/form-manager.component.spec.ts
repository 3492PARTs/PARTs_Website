import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { FormManagerComponent } from './form-manager.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';

describe('FormManagerComponent', () => {
  let component: FormManagerComponent;
  let fixture: ComponentFixture<FormManagerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ FormManagerComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
      ]
    });
    fixture = TestBed.createComponent(FormManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
