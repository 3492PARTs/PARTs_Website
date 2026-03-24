import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { GeneralService } from '@app/core/services/general.service';
import { ScoutingService } from '@app/scouting/services/scouting.service';
import { createMockSwPush } from '../../../../../test-helpers';
import { AllianceSelectionComponent } from './alliance-selection.component';
import { AllianceSelection, Event, Team } from '@app/scouting/models/scouting.models';

describe('AllianceSelectionComponent', () => {
  let component: AllianceSelectionComponent;
  let fixture: ComponentFixture<AllianceSelectionComponent>;
  let mockGS: jasmine.SpyObj<GeneralService>;
  let mockSS: jasmine.SpyObj<ScoutingService>;

  beforeEach(async () => {
    mockGS = jasmine.createSpyObj('GeneralService', [
      'incrementOutstandingCalls', 'decrementOutstandingCalls', 'isMobile', 'getAppSize',
    ]);
    mockSS = jasmine.createSpyObj('ScoutingService', [
      'loadAllScoutingInfo', 'loadAllianceSelection', 'saveAllianceSelections',
    ]);
    mockSS.loadAllScoutingInfo.and.returnValue(Promise.resolve(null) as any);
    mockSS.loadAllianceSelection.and.returnValue(Promise.resolve(null) as any);
    mockSS.saveAllianceSelections.and.returnValue(Promise.resolve(false) as any);

    await TestBed.configureTestingModule({
      imports: [AllianceSelectionComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SwPush, useValue: createMockSwPush() },
        { provide: GeneralService, useValue: mockGS },
        { provide: ScoutingService, useValue: mockSS },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AllianceSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should call loadAllScoutingInfo', () => {
    expect(mockSS.loadAllScoutingInfo).toHaveBeenCalled();
  });

  it('populateAllianceSelections should create selections from teams when empty', () => {
    const t1 = Object.assign(new Team(), { team_no: 100, team_nm: 'A' });
    const t2 = Object.assign(new Team(), { team_no: 200, team_nm: 'B' });
    component.teams = [t1, t2];
    component.currentEvent = Object.assign(new Event(), { id: 1 });
    component.allianceSelections = [];
    component.populateAllianceSelections();
    expect(component.allianceSelections.length).toBe(2);
  });

  it('populateAllianceSelections should not duplicate when already populated', () => {
    const as1 = new AllianceSelection(new Event(), new Team(), '', 1);
    component.allianceSelections = [as1];
    component.populateAllianceSelections();
    expect(component.allianceSelections.length).toBe(1);
  });

  it('decodeTeam should return formatted string', () => {
    const t = Object.assign(new Team(), { team_no: 3492, team_nm: 'PARTs' });
    expect(component.decodeTeam(t)).toBe('3492 : PARTs');
  });

  it('startSelections should set selectionsActive to true', () => {
    component.startSelections();
    expect(component.selectionsActive).toBeTrue();
  });

  it('toggleDisableTeam should flip disabled flag', () => {
    component.teamButtonData = [{ disabled: false, team_id: 100 }];
    component.toggleDisableTeam(0);
    expect(component.teamButtonData[0].disabled).toBeTrue();
    component.toggleDisableTeam(0);
    expect(component.teamButtonData[0].disabled).toBeFalse();
  });

  it('getAllianceSelections should call loadAllianceSelection', () => {
    component.getAllianceSelections();
    expect(mockSS.loadAllianceSelection).toHaveBeenCalled();
  });

  it('saveAllianceSelections should call saveAllianceSelections when array not empty', () => {
    component.allianceSelections = [new AllianceSelection(new Event(), new Team(), '', 1)];
    component.saveAllianceSelections();
    expect(mockSS.saveAllianceSelections).toHaveBeenCalled();
  });

  it('saveAllianceSelections should not call when array empty', () => {
    component.allianceSelections = [];
    component.saveAllianceSelections();
    expect(mockSS.saveAllianceSelections).not.toHaveBeenCalled();
  });

  it('incrementOrder should swap adjacent entries', () => {
    const t1 = Object.assign(new Team(), { team_no: 100 });
    const t2 = Object.assign(new Team(), { team_no: 200 });
    const a1 = new AllianceSelection(new Event(), t1, '', 1);
    const a2 = new AllianceSelection(new Event(), t2, '', 2);
    component.allianceSelections = [a1, a2];
    component.incrementOrder(a1);
    expect(component.allianceSelections[0].team?.team_no).toBe(200);
    expect(component.allianceSelections[1].team?.team_no).toBe(100);
  });

  it('decrementOrder should swap adjacent entries', () => {
    const t1 = Object.assign(new Team(), { team_no: 100 });
    const t2 = Object.assign(new Team(), { team_no: 200 });
    const a1 = new AllianceSelection(new Event(), t1, '', 1);
    const a2 = new AllianceSelection(new Event(), t2, '', 2);
    component.allianceSelections = [a1, a2];
    component.decrementOrder(a2);
    expect(component.allianceSelections[0].team?.team_no).toBe(200);
    expect(component.allianceSelections[1].team?.team_no).toBe(100);
  });
});
