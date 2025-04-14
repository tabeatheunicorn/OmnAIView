import { Component, inject } from '@angular/core';
import { GraphDataService } from './graph-data.service';

@Component({
  selector: 'app-graph',
  imports: [],
  templateUrl: './graph.component.html',
  providers: [GraphDataService]
})
export class GraphComponent {
  readonly #dataservice = inject(GraphDataService);
}
