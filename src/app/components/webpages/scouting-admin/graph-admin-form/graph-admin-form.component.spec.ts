import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphAdminFormComponent } from './graph-admin-form.component';

describe('GraphAdminFormComponent', () => {
  let component: GraphAdminFormComponent;
  let fixture: ComponentFixture<GraphAdminFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphAdminFormComponent]
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
