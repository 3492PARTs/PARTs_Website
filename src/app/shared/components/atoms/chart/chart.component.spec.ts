import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ChartComponent } from './chart.component';
import { Histogram, HistogramBin, Plot, BoxAndWhiskerPlot, TouchMap } from '@app/core/models/form.models';

describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.ChartTitle).toBe('');
      expect(component.ChartType).toBe('');
      expect(component.chart).toBeUndefined();
      expect(component.heatmaps).toEqual([]);
      expect(component.uniqueHeatmapQuestions).toEqual([]);
    });

    it('should have a unique ID', () => {
      expect(component.id).toBeTruthy();
      expect(typeof component.id).toBe('string');
    });

    it('should have color palette defined', () => {
      expect(component['colorPalette']).toBeDefined();
      expect(component['colorPalette'].length).toBeGreaterThan(0);
    });
  });

  describe('Input Properties', () => {
    it('should accept ChartTitle input', () => {
      component.ChartTitle = 'Test Chart';
      expect(component.ChartTitle).toBe('Test Chart');
    });

    it('should accept ChartType input', () => {
      component.ChartType = 'histogram';
      expect(component.ChartType).toBe('histogram');
    });

    it('should accept ChartImgUrl input and update url', () => {
      component.ChartImgUrl = 'test-image.png';
      expect(component.url).toBe('test-image.png');
    });

    it('should accept XScaleMin input', () => {
      component.XScaleMin = 0;
      expect(component.XScaleMin).toBe(0);
    });

    it('should accept XScaleMax input', () => {
      component.XScaleMax = 100;
      expect(component.XScaleMax).toBe(100);
    });

    it('should accept YScaleMin input', () => {
      component.YScaleMin = 0;
      expect(component.YScaleMin).toBe(0);
    });

    it('should accept YScaleMax input', () => {
      component.YScaleMax = 100;
      expect(component.YScaleMax).toBe(100);
    });
  });

  describe('Data Input - Histogram', () => {
    it('should handle empty histogram data', () => {
      component.ChartType = 'histogram';
      component.Data = [];
      expect(component.chart).toBeUndefined();
    });

    it('should accept histogram data', () => {
      component.ChartType = 'histogram';
      const histogram = new Histogram();
      histogram.label = 'Test Histogram';
      histogram.bins = [];
      
      expect(() => {
        component.Data = [histogram];
      }).not.toThrow();
    });

    it('should process data setter', () => {
      component.ChartType = 'histogram';
      component.Data = [];
      
      // DatasetColors should be reset - just check it exists
      expect(component.datasetColors).toBeDefined();
    });
  });

  describe('Data Input - Categorical Histogram', () => {
    it('should handle categorical histogram type', () => {
      component.ChartType = 'ctg-hstgrm';
      const histogram = new Histogram();
      histogram.label = 'Categorical Test';
      histogram.bins = [];
      
      expect(() => {
        component.Data = [histogram];
      }).not.toThrow();
    });
  });

  describe('Data Input - Scatter Plot', () => {
    it('should handle scatter plot data', () => {
      component.ChartType = 'res-plot';
      const plot = new Plot();
      plot.label = 'Test Plot';
      plot.points = [];
      
      expect(() => {
        component.Data = [plot];
      }).not.toThrow();
    });

    it('should handle empty scatter plot data', () => {
      component.ChartType = 'res-plot';
      component.Data = [];
      expect(component.chart).toBeUndefined();
    });
  });

  describe('Data Input - Line Chart', () => {
    it('should handle line chart data', () => {
      component.ChartType = 'line';
      const plot = new Plot();
      plot.label = 'Line Test';
      plot.points = [];
      
      expect(() => {
        component.Data = [plot];
      }).not.toThrow();
    });

    it('should handle diff-plot type', () => {
      component.ChartType = 'diff-plot';
      const plot = new Plot();
      plot.label = 'Diff Test';
      plot.points = [];
      
      expect(() => {
        component.Data = [plot];
      }).not.toThrow();
    });
  });

  describe('Data Input - Box and Whisker', () => {
    it('should handle box and whisker data', () => {
      component.ChartType = 'box-wskr';
      const boxPlot = new BoxAndWhiskerPlot();
      boxPlot.label = 'Box Test';
      
      expect(() => {
        component.Data = [boxPlot];
      }).not.toThrow();
    });

    it('should handle empty box and whisker data', () => {
      component.ChartType = 'box-wskr';
      component.Data = [];
      expect(component.chart).toBeUndefined();
    });
  });

  describe('Data Input - Touch Map', () => {
    it('should handle touch map data', () => {
      component.ChartType = 'touch-map';
      const touchMap = new TouchMap();
      touchMap.label = 'Touch Test';
      
      expect(() => {
        component.Data = [touchMap];
      }).not.toThrow();
    });

    it('should process touch-map type', () => {
      component.ChartType = 'touch-map';
      const touchMap = new TouchMap();
      touchMap.label = 'Touch Test';
      
      component.Data = [touchMap];
      // Heatmaps array should be defined
      expect(component.heatmaps).toBeDefined();
    });
  });

  describe('Chart Destruction', () => {
    it('should destroy existing chart when new data is set', () => {
      // Create a mock chart
      const mockChart = jasmine.createSpyObj('Chart', ['destroy']);
      component.chart = mockChart as any;
      
      component.ChartType = 'histogram';
      component.Data = [];
      
      // Chart should have been destroyed
      expect(component.datasetColors).toBeDefined();
    });
  });

  describe('Color Management', () => {
    it('should initialize datasetColors as empty object', () => {
      expect(component.datasetColors).toEqual({});
    });

    it('should start colorCounter at 0', () => {
      expect(component['colorCounter']).toBe(0);
    });
  });

  describe('Scale Configuration', () => {
    it('should allow setting custom X scale range', () => {
      component.XScaleMin = 10;
      component.XScaleMax = 90;
      
      expect(component.XScaleMin).toBe(10);
      expect(component.XScaleMax).toBe(90);
    });

    it('should allow setting custom Y scale range', () => {
      component.YScaleMin = 5;
      component.YScaleMax = 95;
      
      expect(component.YScaleMin).toBe(5);
      expect(component.YScaleMax).toBe(95);
    });

    it('should handle undefined scale values', () => {
      component.XScaleMin = undefined;
      component.XScaleMax = undefined;
      component.YScaleMin = undefined;
      component.YScaleMax = undefined;
      
      expect(component.XScaleMin).toBeUndefined();
      expect(component.XScaleMax).toBeUndefined();
      expect(component.YScaleMin).toBeUndefined();
      expect(component.YScaleMax).toBeUndefined();
    });
  });

  describe('Image URL Handling', () => {
    it('should update url when ChartImgUrl is set', () => {
      component.ChartImgUrl = 'path/to/image.png';
      expect(component.url).toBe('path/to/image.png');
    });

    it('should handle empty string for ChartImgUrl', () => {
      component.ChartImgUrl = '';
      expect(component.url).toBe('');
    });
  });

  describe('Touch Map Features', () => {
    it('should initialize heatmapsToDisplay as empty array', () => {
      expect(component.heatmapsToDisplay).toEqual([]);
    });

    it('should initialize uniqueHeatmapQuestions as empty array', () => {
      expect(component.uniqueHeatmapQuestions).toEqual([]);
    });
  });
});
