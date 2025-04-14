import {
  Component,
  inject,
  signal,
  effect,
  viewChild,
  type ElementRef,
  computed,
  ChangeDetectionStrategy,
  PLATFORM_ID,
} from '@angular/core';
import { axisBottom, axisLeft } from 'd3-axis';
import { select } from 'd3-selection';
import { DataSourceService } from './graph-data.service';
import { ResizeObserverDirective } from '../shared/resize-observer.directive';
import { transition } from 'd3';
import { isPlatformBrowser, JsonPipe } from '@angular/common';
import { LiveDataService } from '../omnai-datasource/backend-handling/live-data.service';

@Component({
  selector: 'app-graph',
  standalone: true,
  templateUrl: './graph.component.html',
  providers: [DataSourceService],
  styleUrls: ['./graph.component.css'],
  imports: [ResizeObserverDirective, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphComponent {
  readonly dataservice = inject(DataSourceService);
  readonly svgGraph = viewChild.required<ElementRef<SVGElement>>('graphContainer');
  readonly axesContainer = viewChild.required<ElementRef<SVGGElement>>('xAxis');
  readonly axesYContainer = viewChild.required<ElementRef<SVGGElement>>('yAxis');

  private readonly platform = inject(PLATFORM_ID);
  isInBrowser = isPlatformBrowser(this.platform);

  constructor() {
    if(this.isInBrowser){
      queueMicrotask(() => {
        const rect = this.svgGraph().nativeElement.getBoundingClientRect(); if (rect.width > 0 && rect.height > 0) {
          this.dataservice.updateGraphDimensions({ width: rect.width, height: rect.height });
        }
      });
    }
  }

  updateGraphDimensions(dimension: { width: number, height: number }) {
    this.dataservice.updateGraphDimensions(dimension)
  }

  marginTransform = computed(() => {
    return `translate(${this.dataservice.margin.left}, ${this.dataservice.margin.top})`
  })

  xAxisTransformString = computed(() => {
    const yScale = this.dataservice.yScale();
    return `translate(0, ${yScale.range()[0]})`; // for d3, (0,0) is the upper left hand corner. When looking at data, the lower left hand corner is (0,0)
  });

  yAxisTransformString = computed(() => {
    const xScale = this.dataservice.xScale();
    return `translate(${xScale.range()[0]}, 0)`;
  });


  updateXAxisInCanvas = effect(() => {
    if (!this.isInBrowser) return;
    const x = this.dataservice.xScale()
    const g = this.axesContainer().nativeElement;
    select(g).transition(transition()).duration(300).call(axisBottom(x));
  });

  updateYAxisInCanvas = effect(() => {
    if(!this.isInBrowser) return;
    const y = this.dataservice.yScale();
    const g = this.axesYContainer().nativeElement;
    select(g).transition(transition()).duration(300).call(axisLeft(y));
  });

  private readonly livedata = inject(LiveDataService);
  startData(){
    // TODO this should redirect somewhere where the user cann select datasources
    this.livedata.connect();
    const timeslcie = this.livedata.getLast30MinutesRange();
    this.livedata.getDownsampledInRange(timeslcie.tmin, timeslcie.tmax, 1000)

  }
}
