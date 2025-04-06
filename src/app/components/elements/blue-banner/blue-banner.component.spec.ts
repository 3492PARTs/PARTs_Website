import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlueBannerComponent } from './blue-banner.component';

describe('BlueBannerComponent', () => {
  let component: BlueBannerComponent;
  let fixture: ComponentFixture<BlueBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlueBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlueBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
