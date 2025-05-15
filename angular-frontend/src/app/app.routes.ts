import { Routes } from '@angular/router';
import { GraphComponent } from './graph/graph.component';
import { RenderMode } from '@angular/ssr';
import { TestComponent } from './test/test.component';

export const routes: Routes = [
  {
    path: 'graph',
    children: [
      {
        path: 'main',
        component: GraphComponent,
        
      }
    ],
  },
  {
    path: "lieblingszahl",
    component: TestComponent
  },
  {
  path: '**',
  redirectTo: 'graph/main'
}

];
