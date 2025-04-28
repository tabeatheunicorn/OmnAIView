import { effect, inject, Injectable, linkedSignal, signal, untracked } from '@angular/core';
import { scaleLinear as d3ScaleLinear, scaleUtc as d3ScaleUtc } from 'd3-scale';
import { line as d3Line } from 'd3-shape';
import {  OmnAIScopeDataService } from '../omnai-datasource/omnai-scope-server/live-data.service';
import { type GraphComponent } from './graph.component';

type UnwrapSignal<T> = T extends import('@angular/core').Signal<infer U> ? U : never;

/**
 * Provide the data to be displayed in the {@link GraphComponent}
 */
@Injectable()
export class DataSourceService {
  private readonly $graphDimensions = signal({ width: 800, height: 600 });
  private readonly $xDomain = signal([new Date(2020), new Date()]);
  private readonly $yDomain = signal([0, 100]);
  // This is the currently selected datasource to be displayed 
  private readonly dummySeries = inject(OmnAIScopeDataService).data;


  readonly margin = { top: 20, right: 30, bottom: 40, left: 60 };
  graphDimensions = this.$graphDimensions.asReadonly();

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

  private readonly updateScalesWhenDataChanges = effect(() => {
    const data = this.dummySeries();
    untracked(() => this.scaleAxisToData(data))
  })

  private scaleAxisToData(data: UnwrapSignal<typeof this.dummySeries>) {
    if (Object.keys(data).length === 0) return;

    const expandBy = 0.1;

    const initial = {
      minTimestamp: Number.POSITIVE_INFINITY,
      maxTimestamp: Number.NEGATIVE_INFINITY,
      minValue: Number.POSITIVE_INFINITY,
      maxValue: Number.NEGATIVE_INFINITY
    };

    const result = Object.values(data).reduce((acc, deviceData) => {
      return deviceData.reduce((innerAcc, point) => ({
        minTimestamp: Math.min(innerAcc.minTimestamp, point.timestamp),
        maxTimestamp: Math.max(innerAcc.maxTimestamp, point.timestamp),
        minValue: Math.min(innerAcc.minValue, point.value),
        maxValue: Math.max(innerAcc.maxValue, point.value),
      }), acc);
    }, initial);

    if (!isFinite(result.minTimestamp) || !isFinite(result.minValue)) return;

    const xDomainRange = result.maxTimestamp - result.minTimestamp;
    const xExpansion = xDomainRange * expandBy;

    this.$xDomain.set([
      new Date(result.minTimestamp - xExpansion),
      new Date(result.maxTimestamp + xExpansion),
    ]);

    const yDomainRange = result.maxValue - result.minValue;
    const yExpansion = yDomainRange * expandBy;

    this.$yDomain.set([
      result.minValue - yExpansion,
      result.maxValue + yExpansion,
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

      return Object.entries(series).map(([key, points]) => {
        const parsedValues = points.map(({ timestamp, value }) => ({
          time: new Date(timestamp),
          value,
        }));

        const pathData = lineGen(parsedValues) ?? ''; 
        return {
          id: key,
          d: pathData,
        };
      });
    },
  });



}