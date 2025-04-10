import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, switchMap } from "rxjs";
import { map, from } from "rxjs";
import { Device, DeviceListResponse } from "../../models/device.model";
import { BackendPortService } from "./port.service";

@Injectable({
    providedIn: 'root'
})
export class BackendAPIService {
    constructor(
        private backendPortService: BackendPortService,
        private httpClient: HttpClient) { }

    getDevices(): Observable<DeviceListResponse> { // returns the Raw DeviceListResponse 

        const portObservable = from(this.backendPortService.loadOmnAIScopeBackendPort());

        const devicesObservable = portObservable.pipe(
            switchMap(port => {
                console.log("Using port", port, " for the local Backend in angular");
                const url = `http://127.0.0.1:${port}/UUID`;
                return this.httpClient.get<DeviceListResponse>(url);
            })
        );

        return devicesObservable;
    }
}