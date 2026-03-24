import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { AuthService, AuthCallStates } from '@app/auth/services/auth.service';
import { GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { ModalService } from '@app/core/services/modal.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { TeamNotesComponent } from './team-notes.component';
import { Team, TeamNote } from '@app/scouting/models/scouting.models';
import { User } from '@app/auth/models/user.models';

describe('TeamNotesComponent', () => {
  let component: TeamNotesComponent;
  let fixture: ComponentFixture<TeamNotesComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;
  let mockModalService: jasmine.SpyObj<ModalService>;
  let authInFlight: BehaviorSubject<number>;
  let userSubject: BehaviorSubject<User>;
  let outstandingResponsesUploaded: Subject<number>;

  beforeEach(async () => {
    authInFlight = new BehaviorSubject<number>(0);
    userSubject = new BehaviorSubject<User>(new User());
    outstandingResponsesUploaded = new Subject<number>();

    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      authInFlight: authInFlight.asObservable(),
      user: userSubject.asObservable(),
    });
    mockGS = jasmine.createSpyObj('GeneralService', ['getNextGsId', 'incrementOutstandingCalls', 'decrementOutstandingCalls']);
    mockGS.getNextGsId.and.returnValue('gs-1');
    mockSS = jasmine.createSpyObj('ScoutingService', [
      'loadTeams', 'loadTeamNotes', 'saveTeamNote', 'getTeamNotesFromCache',
      'uploadOutstandingResponses', 'getTeamNoteResponsesFromCache', 'removeTeamNoteResponseFromCache',
    ]);
    mockSS.outstandingResponsesUploaded = outstandingResponsesUploaded.asObservable();
    mockSS.loadTeams.and.returnValue(Promise.resolve(null) as any);
    mockSS.loadTeamNotes.and.returnValue(Promise.resolve(null) as any);
    mockSS.saveTeamNote.and.returnValue(Promise.resolve(false) as any);
    mockSS.getTeamNotesFromCache.and.returnValue(Promise.resolve([]) as any);
    mockSS.getTeamNoteResponsesFromCache.and.returnValue(Promise.resolve([]) as any);
    mockSS.removeTeamNoteResponseFromCache.and.returnValue(Promise.resolve() as any);
    mockModalService = jasmine.createSpyObj('ModalService', ['triggerConfirm', 'triggerError']);

    await TestBed.configureTestingModule({
      imports: [TeamNotesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: AuthService, useValue: mockAuthService },
        { provide: GeneralService, useValue: mockGS },
        { provide: ScoutingService, useValue: mockSS },
        { provide: ModalService, useValue: mockModalService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TeamNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call init when auth completes', () => {
    spyOn(component, 'init');
    authInFlight.next(AuthCallStates.comp);
    expect(component.init).toHaveBeenCalled();
  });

  it('init should call loadTeams and loadTeamNotes', () => {
    component.init();
    expect(mockSS.loadTeams).toHaveBeenCalled();
    expect(mockSS.loadTeamNotes).toHaveBeenCalled();
  });

  it('saveNote should call saveTeamNote', () => {
    component.saveNote();
    expect(mockSS.saveTeamNote).toHaveBeenCalled();
  });

  it('saveNote calls reset on success', async () => {
    mockSS.saveTeamNote.and.returnValue(Promise.resolve(true));
    spyOn(component, 'reset');
    component.saveNote();
    await Promise.resolve() as any;
    expect(component.reset).toHaveBeenCalled();
  });

  it('loadTeamNotes should call getTeamNotesFromCache', () => {
    component.loadTeamNotes();
    expect(mockSS.getTeamNotesFromCache).toHaveBeenCalled();
  });

  it('loadTeamNotes should set teamNotes from cache result', async () => {
    const note = new TeamNote();
    mockSS.getTeamNotesFromCache.and.returnValue(Promise.resolve([note]) as any);
    component.loadTeamNotes();
    await Promise.resolve() as any;
    expect(component.teamNotes[0]).toBe(note);
  });

  it('reset should clear currentTeamNote and teamNotes', () => {
    component.teamNotes = [new TeamNote()];
    component.formDisabled = true;
    component.reset();
    expect(component.teamNotes).toEqual([]);
    expect(component.formDisabled).toBeFalse();
  });

  it('uploadOutstandingResponses should call ss.uploadOutstandingResponses', () => {
    component.uploadOutstandingResponses();
    expect(mockSS.uploadOutstandingResponses).toHaveBeenCalled();
  });

  it('removeResult should call triggerConfirm', () => {
    component.removeResult();
    expect(mockModalService.triggerConfirm).toHaveBeenCalled();
  });

  it('populateOutstandingResponses should call getTeamNoteResponsesFromCache', () => {
    component.populateOutstandingResponses();
    expect(mockSS.getTeamNoteResponsesFromCache).toHaveBeenCalled();
  });
});
