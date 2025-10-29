import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FieldScoutingComponent } from './field-scouting.component';

describe('FieldScoutingComponent', () => {
  let component: FieldScoutingComponent;
  let fixture: ComponentFixture<FieldScoutingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FieldScoutingComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldScoutingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
