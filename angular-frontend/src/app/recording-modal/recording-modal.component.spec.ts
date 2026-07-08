import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecordingModalComponent } from './recording-modal.component';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

describe('RecordingModalComponent', () => {
  let component: RecordingModalComponent;
  let fixture: ComponentFixture<RecordingModalComponent>;
  const dialogRefSpy = {
    close: vi.fn().mockName('MatDialogRef.close'),
  };
  let httpClientSpy = {
    get: vi.fn().mockName('HttpClient.get'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordingModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: HttpClient, useValue: httpClientSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
