import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { FormManagerComponent } from './form-manager.component';

describe('FormManagerComponent', () => {
  let component: FormManagerComponent;
  let fixture: ComponentFixture<FormManagerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ FormManagerComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
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
