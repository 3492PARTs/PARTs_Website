import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BuildSeasonComponent } from './build-season.component';

describe('BuildSeasonComponent', () => {
  let component: BuildSeasonComponent;
  let fixture: ComponentFixture<BuildSeasonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ BuildSeasonComponent ]
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
