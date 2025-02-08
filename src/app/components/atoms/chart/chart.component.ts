import { Component, Input, OnInit } from '@angular/core';
import Chart, { ChartConfiguration, ChartData, ChartType, ChartTypeRegistry } from 'chart.js/auto';
import { Histogram, HistogramBin, Plot } from '../../../models/form.models';

@Component({
  selector: 'app-chart',
  imports: [],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent implements OnInit {
  title = 'ng-chart';
  chart: Chart<any> | undefined = undefined;
  @Input() GraphType = '';

  @Input() set Data(d: any) {
    let chartStatus = Chart.getChart('canvas'); // <canvas> id
    if (chartStatus != undefined) {
      chartStatus.destroy();
    }
    let chartConfig: ChartConfiguration | undefined = undefined;

    switch (this.GraphType) {
      case 'histogram':
        const histograms = d as Histogram[];
        if (histograms && histograms.length > 0) {
          const chartData: ChartData = {
            labels: histograms.map(h => h.label), // Labels for the x-axis (e.g., 'Jan', 'Feb')
            datasets: this.createDatasets(histograms), // Create datasets dynamically
          };

          chartConfig = {
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
        }
        break;
      case 'ctg-histgrm':
        chartConfig = this.createCategoricalHistogramChartConfig(d as HistogramBin[]);
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
    }


    if (chartConfig)
      this.chart = new Chart('canvas', chartConfig);
  }

  constructor() { }

  ngOnInit() {
  }

  private createDatasets(histograms: Histogram[]): any[] { // any[] because of dynamic dataset structure
    const datasetLabels = this.getUniqueBinLabels(histograms); // Get all unique bin labels (e.g., 'Net Sales', 'COGS', 'GM')
    return datasetLabels.map(label => ({
      label: label,
      data: histograms.map(histogram => {
        const bin = histogram.bins.find(b => b.bin === label);
        return bin ? bin.count : 0; // Return count or 0 if bin is missing
      }),
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
          backgroundColor: 'rgba(54, 162, 235, 0.5)', // Customize colors
          borderColor: 'rgba(54, 162, 235, 1)',
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
    let counter = 1; // Initialize a counter for linear mapping

    const chartData: ChartData = {
      datasets: plots.map(plot => ({
        label: plot.label,
        data: plot.points.map(point => ({
          x: counter++, // Increment counter for each point
          y: point.point,
        })),
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointRadius: 5,
        showLine: false,
      })),
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
    let counter = 1; // Initialize a counter for linear mapping

    const chartData: ChartData = {
      datasets: plots.map(plot => ({
        label: plot.label,
        data: plot.points.map(point => ({
          x: counter++, // Increment counter for each point
          y: point.point,
        })),
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointRadius: 5,
        showLine: true,
      })),
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

}
