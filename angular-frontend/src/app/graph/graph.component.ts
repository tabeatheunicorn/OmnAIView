import {
  Component,
  inject,
  signal,
  effect,
  viewChild,
  type ElementRef,
} from '@angular/core';
import { axisBottom } from 'd3-axis';
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
  readonly axesContainer = viewChild.required<ElementRef<SVGGElement>>('xAxes');

  readonly graphDimensions = signal({ width: 0, height: 0 });

  constructor() {
    queueMicrotask(() => {
      const rect = this.svgGraph().nativeElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        this.graphDimensions.set({ width: rect.width, height: rect.height });
      }
    });

  }

  updateXAxisInCanvas = effect(() => {
    const { width } = this.graphDimensions();
    if (width === 0) return;

    const x = this.dataservice.xScale().range([40, width - 30]);
    const g = this.axesContainer().nativeElement;
    select(g).transition(transition()).duration(300).call(axisBottom(x));
  });
}
