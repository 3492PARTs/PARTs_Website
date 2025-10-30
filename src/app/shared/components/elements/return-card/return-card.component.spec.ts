import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnCardComponent } from './return-card.component';

describe('ReturnCardComponent', () => {
  let component: ReturnCardComponent;
  let fixture: ComponentFixture<ReturnCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ReturnCardComponent ]
    });
    fixture = TestBed.createComponent(ReturnCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
