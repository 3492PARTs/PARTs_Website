import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabContainerComponent, TabElement } from './tab-container.component';
import { TabComponent } from '../tab/tab.component';
import { GeneralService } from '@app/core/services/general.service';
import { createMockGeneralService } from '../../../../../test-helpers';
import { QueryList } from '@angular/core';

describe('TabContainerComponent', () => {
  let component: TabContainerComponent;
  let fixture: ComponentFixture<TabContainerComponent>;
  let mockGeneralService: any;

  beforeEach(async () => {
    mockGeneralService = createMockGeneralService();

    await TestBed.configureTestingModule({
      imports: [TabContainerComponent],
      providers: [
        { provide: GeneralService, useValue: mockGeneralService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should initialize tabs as empty array', () => {
      expect(component.tabs).toEqual([]);
    });

    it('should initialize activeTab as undefined', () => {
      expect(component.activeTab).toBeUndefined();
    });

    it('should accept ActiveTab input', () => {
      component.ActiveTab = 'Test Tab';
      expect(component.tabs.length).toBe(0); // No tabs added yet
    });
  });

  describe('showTab', () => {
    it('should set tab as active', () => {
      const mockTab = new TabComponent();
      mockTab.TabName = 'Test';
      const tabElement: TabElement = { name: 'Test', element: mockTab, active: false };
      
      component.showTab(tabElement);
      
      expect(tabElement.active).toBe(true);
      expect(mockTab.visible).toBe(true);
      expect(component.activeTab).toBe(tabElement);
    });

    it('should hide previous active tab when showing new tab', () => {
      const mockTab1 = new TabComponent();
      mockTab1.TabName = 'Tab 1';
      const tabElement1: TabElement = { name: 'Tab 1', element: mockTab1, active: false };
      
      const mockTab2 = new TabComponent();
      mockTab2.TabName = 'Tab 2';
      const tabElement2: TabElement = { name: 'Tab 2', element: mockTab2, active: false };
      
      component.showTab(tabElement1);
      expect(mockTab1.visible).toBe(true);
      expect(tabElement1.active).toBe(true);
      
      component.showTab(tabElement2);
      expect(mockTab1.visible).toBe(false);
      expect(tabElement1.active).toBe(false);
      expect(mockTab2.visible).toBe(true);
      expect(tabElement2.active).toBe(true);
    });

    it('should handle tab with no element gracefully', () => {
      const tabElement: TabElement = { name: 'Test', element: undefined, active: false };
      expect(() => component.showTab(tabElement)).not.toThrow();
    });

    it('should update activeTab reference', () => {
      const mockTab = new TabComponent();
      const tabElement: TabElement = { name: 'Test', element: mockTab, active: false };
      
      component.showTab(tabElement);
      expect(component.activeTab).toBe(tabElement);
    });
  });

  describe('setActiveTab', () => {
    beforeEach(() => {
      const mockTab1 = new TabComponent();
      mockTab1.TabName = 'Tab 1';
      const mockTab2 = new TabComponent();
      mockTab2.TabName = 'Tab 2';
      
      component.tabs = [
        { name: 'Tab 1', element: mockTab1, active: false },
        { name: 'Tab 2', element: mockTab2, active: false }
      ];
    });

    it('should show tab matching the name', () => {
      spyOn(component, 'showTab');
      component.setActiveTab('Tab 1');
      expect(component.showTab).toHaveBeenCalledWith(component.tabs[0]);
    });

    it('should not call showTab for empty string', () => {
      spyOn(component, 'showTab');
      component.setActiveTab('');
      expect(component.showTab).not.toHaveBeenCalled();
    });

    it('should only show matching tab', () => {
      spyOn(component, 'showTab');
      component.setActiveTab('Tab 2');
      expect(component.showTab).toHaveBeenCalledTimes(1);
      expect(component.showTab).toHaveBeenCalledWith(component.tabs[1]);
    });

    it('should handle non-existent tab name gracefully', () => {
      spyOn(component, 'showTab');
      component.setActiveTab('Non-existent');
      expect(component.showTab).not.toHaveBeenCalled();
    });
  });

  describe('getTabs', () => {
    it('should populate tabs array from tabContainerTabs', () => {
      const mockTab = new TabComponent();
      mockTab.TabName = 'Test Tab';
      
      const queryList = new QueryList<TabComponent>();
      queryList.reset([mockTab]);
      component.tabContainerTabs = queryList;
      
      component.getTabs();
      
      expect(component.tabs.length).toBeGreaterThan(0);
    });

    it('should show first tab if no active tab title is set', (done) => {
      const mockTab = new TabComponent();
      mockTab.TabName = 'First Tab';
      
      const queryList = new QueryList<TabComponent>();
      queryList.reset([mockTab]);
      component.tabContainerTabs = queryList;
      
      spyOn(component, 'showTab');
      component.getTabs();
      
      setTimeout(() => {
        expect(component.showTab).toHaveBeenCalled();
        done();
      }, 10);
    });
  });

  describe('ngAfterContentInit', () => {
    it('should call getTabs', () => {
      spyOn(component, 'getTabs');
      component.ngAfterContentInit();
      expect(component.getTabs).toHaveBeenCalled();
    });

    it('should subscribe to tabContainerTabs changes', () => {
      spyOn(component.tabContainerTabs.changes, 'subscribe');
      component.ngAfterContentInit();
      expect(component.tabContainerTabs.changes.subscribe).toHaveBeenCalled();
    });
  });

  describe('TabElement class', () => {
    it('should create TabElement instance', () => {
      const tabElement = new TabElement();
      expect(tabElement).toBeDefined();
    });

    it('should allow setting name property', () => {
      const tabElement = new TabElement();
      tabElement.name = 'Test';
      expect(tabElement.name).toBe('Test');
    });

    it('should allow setting element property', () => {
      const tabElement = new TabElement();
      const mockTab = new TabComponent();
      tabElement.element = mockTab;
      expect(tabElement.element).toBe(mockTab);
    });

    it('should allow setting active property', () => {
      const tabElement = new TabElement();
      tabElement.active = true;
      expect(tabElement.active).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle switching between multiple tabs', () => {
      const mockTab1 = new TabComponent();
      mockTab1.TabName = 'Tab 1';
      const mockTab2 = new TabComponent();
      mockTab2.TabName = 'Tab 2';
      const mockTab3 = new TabComponent();
      mockTab3.TabName = 'Tab 3';
      
      component.tabs = [
        { name: 'Tab 1', element: mockTab1, active: false },
        { name: 'Tab 2', element: mockTab2, active: false },
        { name: 'Tab 3', element: mockTab3, active: false }
      ];
      
      component.showTab(component.tabs[0]);
      expect(mockTab1.visible).toBe(true);
      
      component.showTab(component.tabs[1]);
      expect(mockTab1.visible).toBe(false);
      expect(mockTab2.visible).toBe(true);
      
      component.showTab(component.tabs[2]);
      expect(mockTab2.visible).toBe(false);
      expect(mockTab3.visible).toBe(true);
    });

    it('should set active tab via ActiveTab input', () => {
      const mockTab1 = new TabComponent();
      mockTab1.TabName = 'Tab 1';
      const mockTab2 = new TabComponent();
      mockTab2.TabName = 'Tab 2';
      
      component.tabs = [
        { name: 'Tab 1', element: mockTab1, active: false },
        { name: 'Tab 2', element: mockTab2, active: false }
      ];
      
      spyOn(component, 'showTab');
      component.ActiveTab = 'Tab 2';
      
      expect(component.showTab).toHaveBeenCalledWith(component.tabs[1]);
    });
  });
});
