import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TestSService {
  meineLiebelingszahl = signal(3);

  setLieblingszahl(liebling: number){
    this.meineLiebelingszahl.set(liebling);
  }
}

// mein kommentar