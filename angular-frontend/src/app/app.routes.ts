import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
  {
    path: 'graph',
    children: [
      {
        path: 'main',
        loadComponent: () =>
          import('./graph/graph.component').then(m => m.GraphComponent)
      }
    ]
  },
  {
  path: '**',
  redirectTo: 'graph/main'
}

];
