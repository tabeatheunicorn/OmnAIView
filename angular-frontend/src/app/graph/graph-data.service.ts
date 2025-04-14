import { Injectable, signal } from '@angular/core';
import type { GraphComponent } from './graph.component';
import { scaleUtc as d3ScaleUtc, scaleLinear as d3ScaleLinear } from 'd3-scale';


/**
 * provide in {@link GraphComponent}
 * Requests and transforms data from a datasource into something that
 * can be understood and displayed be the Graph COmponent.
 * This includes calculating the axis and path elements
 */
@Injectable()
export class DataSourceService {

  xAxis = signal(d3ScaleUtc())
  yAxis = signal(d3ScaleLinear())


}
