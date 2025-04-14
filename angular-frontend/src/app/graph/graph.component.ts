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

@Component({
  selector: 'app-graph',
  standalone: true,
  templateUrl: './graph.component.html',
  providers: [DataSourceService],
  styleUrls: ['./graph.component.css'],
  imports: [],
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

    effect(() => {
      const { width } = this.graphDimensions();
      if (width === 0) return;

      const x = this.dataservice.xScale().range([40, width - 30]);
      const g = this.axesContainer().nativeElement;
      select(g).call(axisBottom(x));
    });

    setTimeout(() => {
      const current = this.graphDimensions();
      this.graphDimensions.set({ width: current.width / 2, height: current.height });
    }, 10_000);
  }
}
