import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { GraphAdminFormComponent } from './graph-admin-form.component';
import { SwPush } from '@angular/service-worker';
import { createMockSwPush } from '../../../../../test-helpers';

describe('GraphAdminFormComponent', () => {
  let component: GraphAdminFormComponent;
  let fixture: ComponentFixture<GraphAdminFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphAdminFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GraphAdminFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
