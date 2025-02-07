import { Component, Input, OnInit } from '@angular/core';
import Chart, { ChartConfiguration, ChartData, ChartType, ChartTypeRegistry } from 'chart.js/auto';
import { Histogram } from '../../../models/form.models';

@Component({
  selector: 'app-chart',
  imports: [],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent implements OnInit {
  title = 'ng-chart';
  chart: Chart<any> | undefined = undefined;

  @Input() set Data(d: any) {
    let chartStatus = Chart.getChart('canvas'); // <canvas> id
    if (chartStatus != undefined) {
      chartStatus.destroy();
    }

    console.log(d);
    console.log(JSON.stringify(d));

    const histograms = d as Histogram[];

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
            title: { display: true, text: 'Month' }, // Your x-axis label
          },
          y: {
            title: { display: true, text: 'Value' }, // Your y-axis label
            beginAtZero: true,
          },
        },
      },
    };


    this.chart = new Chart('canvas', chartConfig);
  }

  constructor() { }

  ngOnInit() {/*
    this.chart = new Chart('canvas', {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
          {
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });*/
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

}
