import { Injectable } from '@angular/core';
import { Subject, Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LiveDataService {
  private socket: WebSocket | null = null;
  private messageSubject: Subject<any> = new Subject<any>();

  constructor() { }

  /**
   * Connects to the WebSocket server
   * @param url The WebSocket server URL
   */
  connect(url: string): void {
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      this.messageSubject.next(message); // Pass message to the subscribers
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed', event);
    };
  }

  /**
   * Send a message to the WebSocket server
   * @param message The message to be sent
   */
  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected.');
    }
  }

  /**
   * Observes the incoming WebSocket messages
   */
  getMessages(): Observable<any> {
    return this.messageSubject.asObservable().pipe(
      catchError((error) => {
        console.error('WebSocket receive error', error);
        throw error;
      })
    );
  }

  /**
   * Close the WebSocket connection
   */
  closeConnection(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
