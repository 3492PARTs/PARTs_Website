import { Component, Input, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartData, LinearScale, CategoryScale, LineController, LineElement, PointElement, ScatterController, BarController, BarElement } from 'chart.js';
import { BoxPlotController, BoxAndWiskers } from '@sgratzl/chartjs-chart-boxplot';
import { BoxAndWhiskerPlot, Histogram, HistogramBin, Plot } from '../../../models/form.models';
import { GeneralService } from '../../../services/general.service';
import { HeaderComponent } from "../header/header.component";

Chart.register(BoxPlotController, BoxAndWiskers, LinearScale, CategoryScale, LineController, LineElement, PointElement, ScatterController, BarController, BarElement);

@Component({
  selector: 'app-chart',
  imports: [HeaderComponent],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent implements OnInit {
  id = '';
  @Input() ChartTitle = '';
  chart: Chart<any> | undefined = undefined;
  @Input() ChartType = '';

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
    }


    if (chartConfig)
      this.chart = new Chart(this.id, chartConfig);
  }

  constructor(private gs: GeneralService) {
    this.id = this.gs.getNextGsId();
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
        },
      ],
    };

    const cfg: ChartConfiguration<'boxplot'> = {
      type: 'boxplot',
      data,
    };

    return cfg;
  }

}
