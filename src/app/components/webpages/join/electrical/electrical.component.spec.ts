import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ElectricalComponent } from './electrical.component';

describe('ElectricalComponent', () => {
  let component: ElectricalComponent;
  let fixture: ComponentFixture<ElectricalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ElectricalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElectricalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
