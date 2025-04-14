import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DeviceListComponent } from './omnai-datasource/devicelist.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DeviceListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true
})
export class AppComponent {
  title = 'OmnAIView';
  
}
