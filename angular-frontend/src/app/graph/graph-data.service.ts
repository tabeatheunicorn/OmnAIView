import { Injectable, signal } from '@angular/core';
import type { GraphComponent } from './graph.component';
import { scaleUtc as d3ScaleUtc, scaleLinear as d3ScaleLinear } from 'd3-scale';


/**
 * provide in {@link GraphComponent}
 */
@Injectable()
export class GraphDataService {

  xAxis = signal(d3ScaleUtc())
  yAxis = signal(d3ScaleLinear())


}
