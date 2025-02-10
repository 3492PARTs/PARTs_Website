import { Component, ElementRef, HostListener, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartData, LinearScale, CategoryScale, LineController, LineElement, PointElement, ScatterController, BarController, BarElement, Tooltip, Legend } from 'chart.js';
import { BoxPlotController, BoxAndWiskers } from '@sgratzl/chartjs-chart-boxplot';
import { BoxAndWhiskerPlot, Heatmap, Histogram, HistogramBin, Plot } from '../../../models/form.models';
import { GeneralService } from '../../../services/general.service';
import { HeaderComponent } from "../header/header.component";
import { CommonModule } from '@angular/common';
import { DisplayQuestionSvgComponent } from "../../elements/display-question-svg/display-question-svg.component";

Chart.register(BoxPlotController, BoxAndWiskers, LinearScale, CategoryScale, LineController, LineElement, PointElement, ScatterController, BarController, BarElement, Tooltip, Legend);

@Component({
  selector: 'app-chart',
  imports: [HeaderComponent, CommonModule, DisplayQuestionSvgComponent],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent implements OnInit {
  id = '';
  @Input() ChartTitle = '';
  chart: Chart<any> | undefined = undefined;
  @Input() ChartType = '';
  @Input() set ChartImgUrl(s: string) {
    this.url = s;
    this.gs.triggerChange(() => this.adjustImage());
  }

  private colorPalette: string[] = [ // Define a color palette
    'rgba(54, 162, 235, 0.5)', // Blue
    'rgba(255, 99, 132, 0.5)', // Red
    'rgba(255, 206, 86, 0.5)', // Yellow
    'rgba(75, 192, 192, 0.5)', // Teal
    'rgba(153, 102, 255, 0.5)', // Purple
    'rgba(255, 159, 64, 0.5)', // Orange
    'rgba(128, 0, 128, 0.5)', // Maroon
    'rgba(0, 128, 0, 0.5)',   // Green
    'rgba(0, 0, 128, 0.5)',   // Navy
    'rgba(192, 192, 192, 0.5)' // Silver
  ];
  datasetColors: { [label: string]: { backgroundColor: string, borderColor: string } } = {}; // Store assigned colors

  url = '';

  heatmaps: Heatmap[] = [];

  private resizeTimer: number | null | undefined;
  @ViewChild('backgroundImage', { static: false }) image!: ElementRef<HTMLImageElement>; // For image

  @Input() set Data(d: any) {
    let chartStatus = Chart.getChart(this.id); // <canvas> id
    if (chartStatus != undefined) {
      chartStatus.destroy();
    }
    let chartConfig: ChartConfiguration | undefined = undefined;

    switch (this.ChartType) {
      case 'histogram':
        const histograms = d as Histogram[];
        if (histograms && histograms.length > 0) {
          chartConfig = this.createHistogramChartConfig(histograms);
        }
        break;
      case 'ctg-hstgrm':
        const ctgHist = d as HistogramBin[];
        if (ctgHist && ctgHist.length > 0)
          chartConfig = this.createCategoricalHistogramChartConfig(ctgHist);
        break;
      case 'res-plot':
        const plots = d as Plot[];
        if (plots && plots.length > 0)
          chartConfig = this.createScatterChartConfig(plots);
        break;
      case 'diff-plot':
        const diffPlots = d as Plot[];
        if (diffPlots && diffPlots.length > 0)
          chartConfig = this.createLineChartConfig(diffPlots);
        break;
      case 'box-wskr':
        const boxWhiskerPlots = d as BoxAndWhiskerPlot[];
        if (boxWhiskerPlots && boxWhiskerPlots.length > 0)
          chartConfig = this.createBoxAndWhiskerChartConfig(boxWhiskerPlots);
        break;
      case 'ht-map':
        this.heatmaps = d as Heatmap[];
        this.heatmaps.forEach(h => this.getDatasetColor(h.question.question));
        break;
    }


    if (chartConfig)
      this.chart = new Chart(this.id, chartConfig);
  }

  constructor(private gs: GeneralService, private renderer: Renderer2) {
    this.id = this.gs.getNextGsId();
  }

  ngOnInit() {
    //TODO: registe onlt what is needed
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.resizeTimer != null) {
      window.clearTimeout(this.resizeTimer);
    }

    this.resizeTimer = window.setTimeout(() => {
      this.adjustImage();
    }, 200);
  }


  private createHistogramChartConfig(histograms: Histogram[]): ChartConfiguration {
    const chartData: ChartData = {
      labels: histograms.map(h => h.label), // Labels for the x-axis (e.g., 'Jan', 'Feb')
      datasets: this.createDatasets(histograms), // Create datasets dynamically
    };

    const chartConfig: ChartConfiguration = {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        scales: {
          x: {
            title: { display: true, text: 'Question' }, // Your x-axis label
          },
          y: {
            title: { display: true, text: 'Occurances' }, // Your y-axis label
            beginAtZero: true,
          },
        },
      },
    };

    return chartConfig;
  }

  private createDatasets(histograms: Histogram[]): any[] { // any[] because of dynamic dataset structure
    const datasetLabels = this.getUniqueBinLabels(histograms); // Get all unique bin labels (e.g., 'Net Sales', 'COGS', 'GM')
    return datasetLabels.map(label => ({
      label: label,
      data: histograms.map(histogram => {
        const bin = histogram.bins.find(b => b.bin === label);
        return bin ? bin.count : 0; // Return count or 0 if bin is missing
      }),
      backgroundColor: this.getDatasetColor(label).backgroundColor, // Assign color from palette
      borderColor: this.getDatasetColor(label).borderColor, // Slightly darker border
      borderWidth: 1,
    }));
  }

  private getUniqueBinLabels(histograms: Histogram[]): string[] {
    const allLabels = new Set<string>();
    histograms.forEach(histogram => {
      histogram.bins.forEach(bin => allLabels.add(bin.bin));
    });
    return Array.from(allLabels);
  }

  private createCategoricalHistogramChartConfig(bins: HistogramBin[]): ChartConfiguration {
    const chartData: ChartData = {
      labels: bins.map(bin => bin.bin), // Bin values as labels
      datasets: [
        {
          label: 'Frequency', // Or a dynamic label if needed
          data: bins.map(bin => bin.count),
          backgroundColor: this.getDatasetColor('Frequency').backgroundColor, // Customize colors
          borderColor: this.getDatasetColor('Frequency').borderColor,
          borderWidth: 1,
          barPercentage: 1.0,  // Makes bars touch each other
          categoryPercentage: 1.0, // Makes bars take up full category width
        },
      ],
    };

    const chartConfig: ChartConfiguration = {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        scales: {
          x: {
            title: { display: true, text: 'Bin Value' },
            type: 'category', // Use 'category' for string labels
          },
          y: {
            title: { display: true, text: 'Frequency' },
            beginAtZero: true,
          },
        },
      },
    };

    return chartConfig;
  }

  private createScatterChartConfig(plots: Plot[]): ChartConfiguration {
    const chartData: ChartData = {
      datasets: plots.map(plot => {
        let counter = 0; // Initialize a counter for linear mapping
        return {
          label: plot.label,
          data: plot.points.map(point => ({
            x: counter++, // Increment counter for each point
            y: point.point,
          })),
          pointBackgroundColor: this.getDatasetColor(plot.label).backgroundColor, // Use getDatasetColor
          pointBorderColor: this.getDatasetColor(plot.label).borderColor,
          pointRadius: 5,
          showLine: false,
        }
      }),
    };

    const chartConfig: ChartConfiguration = {
      type: 'scatter',
      data: chartData,
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'linear',  // Use a linear scale
            title: { display: true, text: 'Point Count' }, // Label appropriately
            beginAtZero: true, // Start x-axis at 0 (or adjust as needed)
          },
          y: {
            title: { display: true, text: 'Distance' },
            beginAtZero: true,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const dataPoint = context.dataset.data[context.dataIndex] as { x: number; y: number };
                return `${context.dataset.label}: ${context.formattedValue} (Point ${dataPoint.x})`; // Show point number in tooltip
              },
            },
          },
        },
      },
    };

    return chartConfig;
  }

  private createLineChartConfig(plots: Plot[]): ChartConfiguration {


    const chartData: ChartData = {
      datasets: plots.map(plot => {
        let counter = 0; // Initialize a counter for linear mapping
        const color = this.getDatasetColor(plot.label); // Get color *once* per dataset
        const borderColor = color.borderColor;

        return {
          label: plot.label,
          data: plot.points.map(point => ({ x: counter++, y: point.point })),
          pointBackgroundColor: color.backgroundColor, // Use the same color for points
          pointBorderColor: borderColor,
          pointRadius: 5,
          showLine: true,
          borderColor: borderColor, // And for the line
          //tension: 0.4, // Add some curve if you like
          fill: false // To prevent area fill under the line if you don't want it.
        };
      }),
    };

    const chartConfig: ChartConfiguration = {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'linear',  // Use a linear scale
            title: { display: true, text: 'Point Count' }, // Label appropriately
            beginAtZero: true, // Start x-axis at 0 (or adjust as needed)
          },
          y: {
            title: { display: true, text: 'Distance' },
            beginAtZero: true,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const dataPoint = context.dataset.data[context.dataIndex] as { x: number; y: number };
                return `${context.dataset.label}: ${context.formattedValue} (Point ${dataPoint.x})`; // Show point number in tooltip
              },
            },
          },
        },
      },
    };

    return chartConfig;
  }

  private createBoxAndWhiskerChartConfig(plots: BoxAndWhiskerPlot[]): ChartConfiguration<'boxplot'> {
    const data: ChartConfiguration<'boxplot'>['data'] = {
      labels: plots.map(p => p.label),
      datasets: [
        {
          label: 'Dataset 1',
          borderWidth: 1,
          itemRadius: 2,
          itemStyle: 'circle',
          itemBackgroundColor: '#000',
          outlierBackgroundColor: '#000',
          data: plots.map(p => {
            return {
              min: p.min,
              q1: p.q1,
              median: p.q2,
              q3: p.q3,
              max: p.max,
            }
          }),
          borderColor: this.getDatasetColor('Dataset 1').borderColor,
          backgroundColor: this.getDatasetColor('Dataset 1').backgroundColor,
        },
      ],
    };

    const cfg: ChartConfiguration<'boxplot'> = {
      type: 'boxplot',
      data,
    };

    return cfg;
  }

  private adjustImage(): void {
    if (this.image) {
      if (window.innerWidth > window.innerHeight) {
        this.renderer.setStyle(this.image.nativeElement, 'width', 'auto');
        this.renderer.setStyle(this.image.nativeElement, 'height', '70vh');
      }
      else {
        this.renderer.setStyle(this.image.nativeElement, 'width', '100%');
        this.renderer.setStyle(this.image.nativeElement, 'height', 'auto');
      }
    }
  }

  private getDatasetColor(label: string): { backgroundColor: string, borderColor: string } {
    if (!this.datasetColors[label]) {
      const availableColors = this.colorPalette.filter(color => !Object.values(this.datasetColors).map(c => c.backgroundColor).includes(color));
      if (availableColors.length > 0) {
        this.datasetColors[label] = { backgroundColor: availableColors[0], borderColor: availableColors[0].replace('0.5', '1') };
      } else {
        // If all colors are used, reset and start over
        this.datasetColors = {};
        this.datasetColors[label] = { backgroundColor: this.colorPalette[0], borderColor: this.colorPalette[0].replace('0.5', '1') }; // Start from the first color
      }
    }
    return this.datasetColors[label];
  }
}
