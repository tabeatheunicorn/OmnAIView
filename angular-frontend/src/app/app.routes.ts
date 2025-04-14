import { Routes } from '@angular/router';
import { GraphComponent } from './graph/graph.component';

export const routes: Routes = [
  {
    path: 'graph',
    children: [
      {
        path: 'main',
        // loadComponent: () =>
        //   import('./graph/graph.component').then(m => m.GraphComponent)
        component: GraphComponent
      }
    ]
  },
  {
  path: '**',
  redirectTo: 'graph/main'
}

];
