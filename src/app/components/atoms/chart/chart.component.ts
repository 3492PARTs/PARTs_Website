import { Component, Input, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartData } from 'chart.js';
import { BoxPlotController, BoxAndWiskers } from '@sgratzl/chartjs-chart-boxplot';
import { LinearScale, CategoryScale } from 'chart.js'; // Import scales
import { BoxAndWhiskerPlot, Histogram, HistogramBin, Plot } from '../../../models/form.models';
Chart.register(BoxPlotController, BoxAndWiskers, LinearScale, CategoryScale);
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
      case 'box-wskr':
        const boxWhiskerPlots = d as BoxAndWhiskerPlot[];
        if (boxWhiskerPlots && boxWhiskerPlots.length > 0)
          chartConfig = this.createBoxAndWhiskerChartConfig(boxWhiskerPlots);

        const randomValues = (count: number, min: number, max: number, extra: number[] = []): number[] => {
          const delta = max - min;
          return [...Array.from({ length: count }).map(() => Math.random() * delta + min), ...extra];
        }

        const data: ChartConfiguration<'boxplot'>['data'] = {
          labels: ['array', '{boxplot values}', 'with items', 'as outliers'],
          datasets: [
            {
              label: 'Dataset 1',
              borderWidth: 1,
              itemRadius: 2,
              itemStyle: 'circle',
              itemBackgroundColor: '#000',
              outlierBackgroundColor: '#000',
              data: [
                [1, 2, 3, 4, 5, 11],
                {
                  min: 1,
                  q1: 2,
                  median: 3,
                  q3: 4,
                  max: 5,
                },
                {
                  min: 1,
                  q1: 2,
                  median: 3,
                  q3: 4,
                  max: 5,
                  items: [1, 2, 3, 4, 5],
                },
                {
                  min: 1,
                  q1: 2,
                  median: 3,
                  q3: 4,
                  max: 5,
                  outliers: [11],
                },
              ],
            },
          ],
        };

        const cfg: ChartConfiguration<'boxplot'> = {
          type: 'boxplot',
          data,
        };
        chartConfig = cfg;
        break;
    }


    if (chartConfig)
      this.chart = new Chart('canvas', chartConfig);
  }

  constructor() {

  }

  ngOnInit() {
    //TODO: registe onlt what is needed
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

  private createBoxAndWhiskerChartConfig(plots: BoxAndWhiskerPlot[]): ChartConfiguration<'boxplot'> {
    const data = [ // Example Data. Replace with your data
      new BoxAndWhiskerPlot(),
      new BoxAndWhiskerPlot()
    ];

    // ... (Populate your data as in the previous example) ...
    data[0].label = "Sample 1";
    data[0].min = 20;
    data[0].q1 = 30;
    data[0].q2 = 40;
    data[0].q3 = 50;
    data[0].max = 60;
    data[0].outliers = [15, 70];

    data[1].label = "Sample 2";
    data[1].min = 25;
    data[1].q1 = 35;
    data[1].q2 = 45;
    data[1].q3 = 55;
    data[1].max = 65;
    data[1].outliers = [22, 68];

    const chartData = data.map(item => ({
      label: item.label,
      data: {
        min: item.min,
        q1: item.q1,
        median: item.q2, // Chart.js uses 'median'
        q3: item.q3,
        max: item.max,
        outliers: item.outliers || [] // Store outliers for later use
      }
    }));

    console.log(chartData);

    const chartConfig: ChartConfiguration<'boxplot'> = {
      type: 'boxplot', // Important: Use 'boxplot' chart type
      data: {
        datasets: chartData.map(dataset => ({ // Map over the prepared data
          label: dataset.label,
          data: [dataset.data], // Boxplot expects an array of data points (even if just one box)
          borderColor: 'black',
          backgroundColor: 'rgba(54, 162, 235, 0.2)', // Customize colors
          borderWidth: 1,
          outlierBackgroundColor: 'red', // Style for outliers
          outlierBorderColor: 'red',
          // ... other styling options
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Set to false to allow resizing
        scales: {
          y: {
            beginAtZero: false, // Adjust as needed
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const datasetIndex = context.datasetIndex;
                const dataPoint = chartData[datasetIndex].data;
                const label = chartData[datasetIndex].label;
                const value = context.parsed.y;

                // Find if it's an outlier:
                const isOutlier = chartData[datasetIndex].data.outliers.includes(value);

                if (isOutlier) {
                  return `${label}: Outlier ${value}`;
                } else {
                  return `${label}: ${value}`;
                }

              }
            }
          }
        }
      }
    };

    return chartConfig;
  }

}
