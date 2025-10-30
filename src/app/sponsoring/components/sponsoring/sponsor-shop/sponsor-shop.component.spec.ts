import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorShopComponent } from './sponsor-shop.component';

describe('SponsorShopComponent', () => {
  let component: SponsorShopComponent;
  let fixture: ComponentFixture<SponsorShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SponsorShopComponent]
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
