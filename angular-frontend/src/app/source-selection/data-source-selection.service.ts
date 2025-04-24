import { Injectable, signal, computed, inject } from '@angular/core'; import { LiveDataService } from '../omnai-datasource/backend-handling/live-data.service';
import { OmnAIScopeAPIService } from '../omnai-datasource/backend-handling/backend-api.service';


export interface DataSourceInfo {
    id: string;
    name: string;
    description?: string;
    start: () => void;
}

@Injectable({
    providedIn: 'root'
})
export class DataSourceSelectionService {
    private readonly liveDataService = inject(LiveDataService);
    private readonly _currentSource = signal<DataSourceInfo | null>(null);

    private readonly _availableSources = signal<DataSourceInfo[]>([
        {
            id: 'omnaiscope',
            name: 'OmnAIScope',
            description: 'Live data from connected OmnAIScope devices',
            start: () => {
                this.liveDataService.connect();
            }
        }
    ]);
    readonly availableSources = this._availableSources.asReadonly();

    // selected source as readonly signal
    readonly currentSource = this._currentSource.asReadonly();

    // whether a source is selected
    readonly hasSelection = computed(() => this._currentSource() !== null);

    // selected source ID (null if none selected)
    readonly selectedSourceId = computed(() => this._currentSource()?.id ?? null);

    selectSource(source: DataSourceInfo): void {
        this._currentSource.set(source);
    }

    clearSelection(): void {
        this._currentSource.set(null);
    }

    addSourceToAvailbleSoruces(source: DataSourceInfo){
        this._availableSources.update((value) => [...value, source])
    }
}
