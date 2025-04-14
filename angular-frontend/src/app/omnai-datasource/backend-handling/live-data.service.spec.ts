import { TestBed } from '@angular/core/testing';

import { LiveDataService } from './live-data.service';

describe('LiveDataService', () => {
  let service: LiveDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiveDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
