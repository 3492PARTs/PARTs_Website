import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SponsoringComponent } from './sponsoring.component';

describe('SponsoringComponent', () => {
  let component: SponsoringComponent;
  let fixture: ComponentFixture<SponsoringComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SponsoringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SponsoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
