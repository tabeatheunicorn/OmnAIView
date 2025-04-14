// src/app/components/device-list/device-list.component.ts
import { Component, OnInit, Inject } from '@angular/core';
import { BackendAPIService } from '../backend-handling/backend-api.service';
import { DeviceListResponse } from '../../models/device.model';
import { CommonModule, NgIf } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
    selector: 'app-device-list',
    templateUrl: './devicelist.component.html',
    imports: [CommonModule],
    standalone: true
})
export class DeviceListComponent {
    deviceListResponse: DeviceListResponse | null = null;
    errorMessage: string | null = null;

    constructor(private backendApiService: BackendAPIService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    getDevicesList(): void {
        if (isPlatformBrowser(this.platformId)) { // check if angular already runs in browser so a window is available 
            this.backendApiService.getDevices().subscribe({
                next: (data: DeviceListResponse) => {
                    this.deviceListResponse = data;
                    console.log('Devices List:', data);
                },
                error: (error: any) => {
                    console.error('Error Loading the devices:', error);
                    this.errorMessage = `Error: ${error.message}`;
                }
            });
        } else {
            // If the app is in SSR mode 
            console.warn('Not in browser mode, cant load devices without electron context');
        }
    }
}
