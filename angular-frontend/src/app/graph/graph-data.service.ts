import { Injectable, signal, linkedSignal, inject, effect, untracked } from '@angular/core';
import { scaleUtc as d3ScaleUtc, scaleLinear as d3ScaleLinear } from 'd3-scale'; import { line as d3Line } from 'd3-shape';
import { DownsampledData, LiveDataService } from '../omnai-datasource/backend-handling/live-data.service';

@Injectable()
export class DataSourceService {
  private readonly $graphDimensions = signal({ width: 800, height: 600 });
  graphDimensions = this.$graphDimensions.asReadonly();

  private readonly $xDomain = signal([new Date(2020), new Date()]);
  private readonly $yDomain = signal([0, 100]);
  readonly margin = { top: 20, right: 30, bottom: 40, left: 60 };

  xScale = linkedSignal({
    source: () => ({
      dimensions: this.$graphDimensions(),
      xDomain: this.$xDomain(),
    }),
    computation: ({ dimensions, xDomain }) => {
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const width = dimensions.width - margin.left - margin.right;
      return d3ScaleUtc()
        .domain(xDomain)
        .range([0, width]);
    },
  });

  yScale = linkedSignal({
    source: () => ({
      dimensions: this.$graphDimensions(),
      yDomain: this.$yDomain(),
    }),
    computation: ({ dimensions, yDomain }) => {
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const height = dimensions.height - margin.top - margin.bottom;
      return d3ScaleLinear()
        .domain(yDomain)
        .range([height, 0]);
    },
  });

  updateGraphDimensions(settings: { width: number; height: number }) {
    const currentSettings = this.$graphDimensions();
    if (
      currentSettings.width !== settings.width ||
      currentSettings.height !== settings.height
    ) {
      this.$graphDimensions.set({ width: settings.width, height: settings.height });
    }
  }

  readonly dummySeries = inject(LiveDataService).dataSignal

  updateScalesWhenDataChanges = effect(() => {
    const data = this.dummySeries();
    untracked(() => this.scaleAxisToData(data))
  })

  scaleAxisToData(data: DownsampledData) {
    // 10% expansion factor in both directions
    const expandBy = 0.1; // 10% expansion

    // Find the min and max timestamp for xDomain
    const xMin = Math.min(...data.flatMap(series => series.map(([timestamp]) => new Date(timestamp).getTime())));
    const xMax = Math.max(...data.flatMap(series => series.map(([timestamp]) => new Date(timestamp).getTime())));

    // Expand xDomain by 10% on both sides
    const xDomainRange = xMax - xMin;
    const xExpansion = xDomainRange * expandBy;

    this.$xDomain.set([
      new Date(xMin - xExpansion), // Expand the left side (min)
      new Date(xMax + xExpansion), // Expand the right side (max)
    ]);

    // Find the min and max value for yDomain
    const yMin = Math.min(...data.flatMap(series => series.map(([_timestamp, value]) => value)));
    const yMax = Math.max(...data.flatMap(series => series.map(([_timestamp, value]) => value)));

    // Expand yDomain by 10% on both sides
    const yDomainRange = yMax - yMin;
    const yExpansion = yDomainRange * expandBy;

    this.$yDomain.set([
      yMin - yExpansion, // Expand the bottom side (min)
      yMax + yExpansion, // Expand the top side (max)
    ]);
  }

  readonly paths = linkedSignal({
    source: () => ({
      xScale: this.xScale(),
      yScale: this.yScale(),
      series: this.dummySeries(),
    }),
    computation: ({ xScale, yScale, series }) => {
      const lineGen = d3Line<{ time: Date; value: number }>()
        .x(d => xScale(d.time))
        .y(d => yScale(d.value));

      return series.map((s, i) => {
        const parsedValues = s.map(([timestamp, value]) => ({
          time: new Date(timestamp),
          value,
        }));

        return {
          id: `series-${i}`,
          d: lineGen(parsedValues) ?? '', // fallback für leere Kurve
        };
      });
    },
  });


}