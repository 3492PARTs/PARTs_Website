import { TestBed } from '@angular/core/testing';

import { AttendanceService } from './attendance.service';
import { APIService } from '@app/core/services/api.service';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let mockAPIService: jasmine.SpyObj<APIService>;


  beforeEach(() => {
    mockAPIService = jasmine.createSpyObj('APIService', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        AttendanceService,
        { provide: APIService, useValue: mockAPIService },
      ]
    });
    service = TestBed.inject(AttendanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
