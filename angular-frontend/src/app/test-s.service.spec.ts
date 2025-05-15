import { TestBed } from '@angular/core/testing';

import { TestSService } from './test-s.service';

describe('TestSService', () => {
  let service: TestSService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestSService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
