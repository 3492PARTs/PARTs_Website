import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { ReturnLinkComponent } from './return-link.component';

describe('ReturnLinkComponent', () => {
  let component: ReturnLinkComponent;
  let fixture: ComponentFixture<ReturnLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnLinkComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
