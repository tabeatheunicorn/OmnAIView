import { Component, inject } from '@angular/core';
import { DataSourceService } from './graph-data.service';

@Component({
  selector: 'app-graph',
  imports: [],
  templateUrl: './graph.component.html',
  providers: [DataSourceService]
})
export class GraphComponent {
  readonly #dataservice = inject(DataSourceService);
}
