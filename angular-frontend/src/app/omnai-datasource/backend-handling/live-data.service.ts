import { computed, Injectable, signal } from '@angular/core';

type TimeValuePair = [string, number];
type DownsampledData = TimeValuePair[][];

const MAX_ENTRIES = 1_000;

@Injectable({
  providedIn: 'root',
})
export class LiveDataService {
  private ws?: WebSocket;

  /**
   * Signal holding accumulated downsampled data received via WebSocket.
   * Data is trimmed to keep at most MAX_ENTRIES across all series.
   */
  private readonly _dataSignal = signal<DownsampledData>([]);

  readonly dataSignal  = this._dataSignal.asReadonly();

  /**
   * Establishes a WebSocket connection to the live data endpoint.
   */
  connect(): void {
    this.disconnect();
    this.ws = new WebSocket('ws://localhost:8080/data');

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg?.meta?.responce_to === 'get_downsampled_in_range') {
        const incoming = msg.data as DownsampledData;

        this._dataSignal.update((current) => {
          // Merge incoming data into existing series
          const merged = current.map((series, i) => {
            const incomingSeries = incoming[i] ?? [];
            const combined = [...series, ...incomingSeries];

            // Ensure we keep only the latest MAX_ENTRIES
            return combined.slice(-MAX_ENTRIES);
          });

          // Handle case where incoming has more series than current
          if (incoming.length > current.length) {
            for (let i = current.length; i < incoming.length; i++) {
              merged.push(incoming[i].slice(-MAX_ENTRIES));
            }
          }

          return merged;
        });
      }
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    this.ws.onclose = () => {
      console.warn('WebSocket closed');
    };
  }

  /**
   * Sends a `get_downsampled_in_range` command via WebSocket
   * to request downsampled data within a given time window.
   *
   * @param tmin ISO8601 timestamp (start time)
   * @param tmax ISO8601 timestamp (end time)
   * @param desiredNumberOfSamples preferred sample count
   */
  getDownsampledInRange(
    tmin: string,
    tmax: string,
    desiredNumberOfSamples: number
  ): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not open');
      return;
    }

    this._dataSignal.set([]); // new request for data means that we discard the old
    const message = {
      command: 'get_downsampled_in_range',
      tmin,
      tmax,
      desired_number_of_samples: desiredNumberOfSamples,
    };

    this.ws.send(JSON.stringify(message));
  }
  /**
  * Returns an object with `tmin` and `tmax` representing
  * the last 30 minutes in ISO 8601 UTC format.
  */
  getLast30MinutesRange(): { tmin: string; tmax: string } {
    const now = new Date();
    const tmax = now.toISOString();

    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const tmin = thirtyMinutesAgo.toISOString();

    return { tmin, tmax };
  }

  /**
   * Gracefully closes the active WebSocket connection.
   */
  disconnect(): void {
    this.ws?.close();
  }
}
