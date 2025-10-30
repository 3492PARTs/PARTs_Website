import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { BlueBannersComponent } from './blue-banners.component';

describe('BlueBannerComponent', () => {
  let component: BlueBannersComponent;
  let fixture: ComponentFixture<BlueBannersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlueBannersComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BlueBannersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
