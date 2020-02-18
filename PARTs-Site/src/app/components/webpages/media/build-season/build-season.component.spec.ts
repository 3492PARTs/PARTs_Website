import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildSeasonComponent } from './build-season.component';

describe('BuildSeasonComponent', () => {
  let component: BuildSeasonComponent;
  let fixture: ComponentFixture<BuildSeasonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildSeasonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildSeasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
