import { Component, inject } from "@angular/core";
import { TestSService } from "../test-s.service";

@Component({
  selector:"app-test",
  templateUrl: `./test.component.html`,
  styleUrl: `./test.component.css`
})
export class TestComponent{
  private readonly lieblingsZahlService = inject(TestSService);

  lieblingsZahlRef = this.lieblingsZahlService.meineLiebelingszahl;

  setLiebling(num: string){
    const numAsNum = Number(num);
    this.lieblingsZahlService.setLieblingszahl(numAsNum);
  }
}