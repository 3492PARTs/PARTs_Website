import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { ManagePitQuestionsComponent } from './manage-pit-questions.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';

describe('ManagePitQuestionsComponent', () => {
  let component: ManagePitQuestionsComponent;
  let fixture: ComponentFixture<ManagePitQuestionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ManagePitQuestionsComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
      ]
    });
    fixture = TestBed.createComponent(ManagePitQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
