import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlueBannersComponent } from './blue-banners.component';

describe('BlueBannerComponent', () => {
  let component: BlueBannersComponent;
  let fixture: ComponentFixture<BlueBannersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlueBannersComponent]
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
