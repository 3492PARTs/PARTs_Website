import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { PitResultDisplayComponent } from './pit-result-display.component';

describe('PitResultDisplayComponent', () => {
  let component: PitResultDisplayComponent;
  let fixture: ComponentFixture<PitResultDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ PitResultDisplayComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    fixture = TestBed.createComponent(PitResultDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
