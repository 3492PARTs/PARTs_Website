import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { ReturnCardComponent } from './return-card.component';

describe('ReturnCardComponent', () => {
  let component: ReturnCardComponent;
  let fixture: ComponentFixture<ReturnCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ReturnCardComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    fixture = TestBed.createComponent(ReturnCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
