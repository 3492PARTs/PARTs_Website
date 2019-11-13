import { TestBed } from '@angular/core/testing';

import { GeneralServiceService } from './general-service.service';

describe('GeneralServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GeneralServiceService = TestBed.get(GeneralServiceService);
    expect(service).toBeTruthy();
  });
});
