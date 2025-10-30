import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { SponsorShopComponent } from './sponsor-shop.component';

describe('SponsorShopComponent', () => {
  let component: SponsorShopComponent;
  let fixture: ComponentFixture<SponsorShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SponsorShopComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SponsorShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
