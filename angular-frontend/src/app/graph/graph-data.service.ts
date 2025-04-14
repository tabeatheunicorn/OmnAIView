import { Injectable, signal, linkedSignal } from '@angular/core';
import { scaleUtc as d3ScaleUtc, scaleLinear as d3ScaleLinear } from 'd3-scale';

@Injectable()
export class DataSourceService {
  private readonly $graphDimensions = signal({ width: 0, height: 0 });
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
}