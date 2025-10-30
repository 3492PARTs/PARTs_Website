import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { MatchPlanningComponent } from './match-planning.component';

describe('MatchPlanningComponent', () => {
  let component: MatchPlanningComponent;
  let fixture: ComponentFixture<MatchPlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchPlanningComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
