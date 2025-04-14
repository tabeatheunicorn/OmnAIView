import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DeviceListComponent } from './device-handling/devicelist.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DeviceListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'OmnAIView';
}
