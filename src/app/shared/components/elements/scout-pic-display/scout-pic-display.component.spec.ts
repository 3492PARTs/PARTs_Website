import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { ScoutPicDisplayComponent } from './scout-pic-display.component';

describe('ScoutPicDisplayComponent', () => {
  let component: ScoutPicDisplayComponent;
  let fixture: ComponentFixture<ScoutPicDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ScoutPicDisplayComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    fixture = TestBed.createComponent(ScoutPicDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
