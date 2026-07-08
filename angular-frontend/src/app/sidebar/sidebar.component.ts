import { Component, signal, inject, ChangeDetectionStrategy } from "@angular/core";

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { DevicesList } from "./devices/deviceslist.component";
import { SideBarService } from "./sidebar.service";


@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [DevicesList, MatSidenavModule, MatIconButton, MatIcon]
})
export class SideBarComponent {
    readonly sideBarService = inject(SideBarService)
    selectedTab = signal<'devices' | 'files' | 'analysis'>('devices');
}