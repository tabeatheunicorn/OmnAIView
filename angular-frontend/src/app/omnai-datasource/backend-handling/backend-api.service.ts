import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, switchMap } from "rxjs";
import { map, from } from "rxjs";
import { Device, DeviceListResponse } from "../../../models/device.model";
import { OmnAIScopePortService } from "./port.service";

@Injectable({
    providedIn: 'root'
})
export class OmnAIScopeAPIService {
    private readonly port = inject(OmnAIScopePortService);
    private readonly httpClient = inject(HttpClient);

    getDevices(): Observable<DeviceListResponse> {
        const portObservable = from(this.port.loadOmnAIScopeBackendPort());

        const devicesObservable = portObservable.pipe(
            map((port) => {
                console.log("Using port", port, " for the local Backend in angular");
                const url = `http://127.0.0.1:${port}/UUID`;
                return url
            }),
            switchMap((url) => this.httpClient.get<DeviceListResponse>(url)
            )
        );

        return devicesObservable;
    }
}