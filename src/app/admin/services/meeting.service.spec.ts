import { TestBed } from '@angular/core/testing';

import { MeetingService } from './meeting.service';
import { APIService } from '@app/core/services/api.service';

describe('MeetingService', () => {
  let service: MeetingService;
  let mockAPIService: jasmine.SpyObj<APIService>;


  beforeEach(() => {
    mockAPIService = jasmine.createSpyObj('APIService', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        MeetingService,
        { provide: APIService, useValue: mockAPIService },
      ]
    });
    service = TestBed.inject(MeetingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
