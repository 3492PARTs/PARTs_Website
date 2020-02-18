import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoutFieldComponent } from './scout-field.component';

describe('ScoutFieldComponent', () => {
  let component: ScoutFieldComponent;
  let fixture: ComponentFixture<ScoutFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScoutFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoutFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
