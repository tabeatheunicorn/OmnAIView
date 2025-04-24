import {  Injectable, signal } from '@angular/core';

type TimeValuePair = [string, number];
export type DownsampledData = TimeValuePair[][];

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

  readonly dataSignal = this._dataSignal.asReadonly();

  /**
   * Establishes a WebSocket connection to the live data endpoint.
   */
  connect(): void {
    this.disconnect();
    this.ws = new WebSocket('ws://localhost:8080/ws');

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg?.meta?.responce_to === 'get_downsampled_in_range') {
          const incoming = msg.data as DownsampledData;

          console.log("received", incoming)
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
      } catch (error) {
        // Ignore invalid or non-parsable messages
        console.warn('Ignoring invalid message:', event.data);
      }
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    this.ws.onclose = () => {
      console.warn('WebSocket closed');
    };
  };

  getDownsampledInRange(
    tmin: string,
    tmax: string,
    desiredNumberOfSamples: number
  ): void {
    // Warten auf den WebSocket, wenn er nicht offen ist
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not open');
      this.waitForWebSocket().then(() => {
        // Sobald der WebSocket offen ist, senden wir die Nachricht
        this.sendMessage(tmin, tmax, desiredNumberOfSamples);
      });
    } else {
      // WebSocket ist bereits offen, Nachricht sofort senden
      this.sendMessage(tmin, tmax, desiredNumberOfSamples);
    }
  }

  /**
   * Sendet die Nachricht an den WebSocket.
   * @param tmin Startzeitpunkt
   * @param tmax Endzeitpunkt
   * @param desiredNumberOfSamples gewünschte Anzahl der Samples
   */
  private sendMessage(
    tmin: string,
    tmax: string,
    desiredNumberOfSamples: number
  ): void {
    // Setzt das Signal auf einen leeren Zustand, um die vorherigen Daten zu verwerfen
    this._dataSignal.set([]);

    const message = {
      command: 'get_downsampled_in_range',
      tmin,
      tmax,
      desired_number_of_samples: desiredNumberOfSamples,
    };

    // Senden der Nachricht an den WebSocket
    this.ws?.send(JSON.stringify(message));
  }

  /**
   * Wartet darauf, dass der WebSocket geöffnet wird (readyState === WebSocket.OPEN).
   */
  private async waitForWebSocket(): Promise<void> {
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
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
