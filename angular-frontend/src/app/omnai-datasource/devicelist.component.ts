// src/app/components/device-list/device-list.component.ts
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Inject, PLATFORM_ID, signal } from '@angular/core';
import { DeviceListResponse } from '../../models/device.model';
import { OmnAIScopeAPIService } from './backend-handling/backend-api.service';

@Component({
    selector: 'app-device-list',
    templateUrl: './devicelist.component.html',
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceListComponent {
    deviceListResponse = signal<DeviceListResponse | null>(null);
    errorMessage = signal<string | null>(null);

    private readonly backendApiService = inject(OmnAIScopeAPIService);
    private readonly platformID = inject(PLATFORM_ID);

    getDevicesList(): void {
        if (isPlatformBrowser(this.platformID)) { // check if angular already runs in browser so a window is available 
            this.backendApiService.getDevices().subscribe({
                next: (data: DeviceListResponse) => {
                    this.deviceListResponse.set(data);
                    console.log('Devices List:', data);
                },
                error: (error: any) => {
                    console.error('Error Loading the devices:', error);
                    this.errorMessage.set(`Error: ${error.message}`);
                }
            });
        } else {
            // If the app is in SSR mode 
            console.warn('Not in browser mode, cant load devices without electron context');
        }
    }
}
