import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';


import { PaginationComponent } from './pagination.component';
import { Page } from '@app/core/utils/utils.functions';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ PaginationComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component._pageInfo).toBeDefined();
    expect(component._page).toBe(1);
    expect(component.pages).toEqual([]);
  });

  describe('buildPages', () => {
    it('should build pages array for 10 total pages starting at page 1', () => {
      const pageInfo = new Page();
      pageInfo.count = 10;
      component.PageInfo = pageInfo;
      component.Page = 1;
      
      expect(component.pages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should build pages array for 5 total pages', () => {
      const pageInfo = new Page();
      pageInfo.count = 5;
      component.PageInfo = pageInfo;
      component.Page = 1;
      
      expect(component.pages).toEqual([1, 2, 3, 4, 5]);
    });

    it('should build pages array when current page is 7', () => {
      const pageInfo = new Page();
      pageInfo.count = 15;
      component.PageInfo = pageInfo;
      component.Page = 7;
      
      expect(component.pages).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });

    it('should build pages array when near the end (page 12 of 15)', () => {
      const pageInfo = new Page();
      pageInfo.count = 15;
      component.PageInfo = pageInfo;
      component.Page = 12;
      
      expect(component.pages).toEqual([6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    });

    it('should build pages array when on last page', () => {
      const pageInfo = new Page();
      pageInfo.count = 10;
      component.PageInfo = pageInfo;
      component.Page = 10;
      
      expect(component.pages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should handle when total pages is less than 10', () => {
      const pageInfo = new Page();
      pageInfo.count = 3;
      component.PageInfo = pageInfo;
      component.Page = 2;
      
      expect(component.pages.length).toBe(3);
      expect(component.pages).toEqual([1, 2, 3]);
    });

    it('should handle single page', () => {
      const pageInfo = new Page();
      pageInfo.count = 1;
      component.PageInfo = pageInfo;
      component.Page = 1;
      
      expect(component.pages).toEqual([1]);
    });

    it('should handle when at page 3 of 20', () => {
      const pageInfo = new Page();
      pageInfo.count = 20;
      component.PageInfo = pageInfo;
      component.Page = 3;
      
      expect(component.pages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should handle when at page 6 of 20', () => {
      const pageInfo = new Page();
      pageInfo.count = 20;
      component.PageInfo = pageInfo;
      component.Page = 6;
      
      expect(component.pages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });

  describe('getPage', () => {
    it('should emit page number when getPage is called', () => {
      spyOn(component.FunctionCallBack, 'emit');
      
      component.getPage(5);
      
      expect(component.FunctionCallBack.emit).toHaveBeenCalledWith(5);
    });

    it('should emit correct page number for multiple calls', () => {
      spyOn(component.FunctionCallBack, 'emit');
      
      component.getPage(1);
      component.getPage(10);
      component.getPage(3);
      
      expect(component.FunctionCallBack.emit).toHaveBeenCalledTimes(3);
      expect(component.FunctionCallBack.emit).toHaveBeenCalledWith(1);
      expect(component.FunctionCallBack.emit).toHaveBeenCalledWith(10);
      expect(component.FunctionCallBack.emit).toHaveBeenCalledWith(3);
    });
  });

  describe('Input setters', () => {
    it('should update PageInfo and rebuild pages', () => {
      spyOn(component, 'buildPages');
      
      const pageInfo = new Page();
      pageInfo.count = 5;
      component.PageInfo = pageInfo;
      
      expect(component._pageInfo).toBe(pageInfo);
      expect(component.buildPages).toHaveBeenCalled();
    });

    it('should update Page and rebuild pages', () => {
      spyOn(component, 'buildPages');
      
      component.Page = 7;
      
      expect(component._page).toBe(7);
      expect(component.buildPages).toHaveBeenCalled();
    });
  });
});
