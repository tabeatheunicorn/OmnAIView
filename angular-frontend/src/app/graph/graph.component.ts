import {
  Component,
  inject,
  signal,
  effect,
  viewChild,
  type ElementRef,
  computed,
} from '@angular/core';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { DataSourceService } from './graph-data.service';
import { ResizeObserverDirective } from '../shared/resize-observer.directive';
import { transition } from 'd3';

@Component({
  selector: 'app-graph',
  standalone: true,
  templateUrl: './graph.component.html',
  providers: [DataSourceService],
  styleUrls: ['./graph.component.css'],
  imports: [ResizeObserverDirective],
})
export class GraphComponent {
  readonly dataservice = inject(DataSourceService);
  readonly svgGraph = viewChild.required<ElementRef<SVGElement>>('graphContainer');
  readonly axesContainer = viewChild.required<ElementRef<SVGGElement>>('xAxis');
  readonly axesYContainer = viewChild.required<ElementRef<SVGGElement>>('yAxis');


  constructor() {
    queueMicrotask(() => {
      const rect = this.svgGraph().nativeElement.getBoundingClientRect(); if (rect.width > 0 && rect.height > 0) {
        this.dataservice.updateGraphDimensions({ width: rect.width, height: rect.height });
      }
    });

  }

  updateGraphDimensions(dimension: { width: number, height: number }) {
    this.dataservice.updateGraphDimensions(dimension)
  }

  marginTransform = computed(() => {
    return `translate(${this.dataservice.margin.left}, ${this.dataservice.margin.top})`
  })

  xAxisTransformString = computed(() => {
    const { width, height } = this.dataservice.graphDimensions();
    const yScale = this.dataservice.yScale();

    return `translate(0, ${yScale.range()[0]})`; // for d3, (0,0) is the upper left hand corner. When looking at data, the lower left hand corner is (0,0)
  });

  yAxisTransformString = computed(() => {
    const { width, height } = this.dataservice.graphDimensions();
    const xScale = this.dataservice.xScale();

    return `translate(${xScale.range()[0]}, 0)`;
  });


  updateXAxisInCanvas = effect(() => {
    const x = this.dataservice.xScale()
    const g = this.axesContainer().nativeElement;
    select(g).transition(transition()).duration(300).call(axisBottom(x));
  });

  updateYAxisInCanvas = effect(() => {
    const y = this.dataservice.yScale();
    const g = this.axesYContainer().nativeElement;
    select(g).transition(transition()).duration(300).call(axisLeft(y));
  });
}
