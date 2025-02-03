import { FormSubType, IFormSubType, IQuestion, Question, Answer, Flow } from "./form.models";
import { User } from "./user.models";

export interface ISeason {
    id: number;
    season: string;
    current: string;
}


export class Season implements ISeason {
    id = NaN;
    season = '';
    current = 'n';
}

export interface ITeam {
    team_no: number;
    team_nm: string;
    void_ind: string;
    checked: boolean;
    pit_result: number;
    rank: number;
}

export class Team implements ITeam {
    team_no = NaN;
    team_nm = '';
    void_ind = 'n'
    checked = false;
    pit_result = 0;
    rank = NaN;
}

export interface IEvent {
    id: number;
    season_id: number;
    event_nm: string;
    date_st: Date;
    event_cd: string;
    date_end: Date;
    event_url: string;
    address: string;
    city: string;
    state_prov: string;
    postal_code: string;
    location_name: string;
    gmaps_url: string;
    webcast_url: string;
    current: string;
    timezone: string;
    void_ind: string;
    competition_page_active: string;
    teams: ITeam[];
}

export class Event implements IEvent {
    id = NaN;
    season_id = NaN;
    event_nm = '';
    date_st!: Date;
    event_cd = '';
    date_end!: Date;
    event_url!: string;
    address!: string;
    city!: string;
    state_prov!: string;
    postal_code!: string;
    location_name!: string;
    gmaps_url!: string;
    webcast_url!: string;
    current = 'n';
    timezone = 'America/New_York';
    void_ind = 'n';
    competition_page_active = 'n';
    teams: Team[] = [];
}

export interface ICompetitionLevel {
    comp_lvl_typ: string;
    comp_lvl_typ_nm: string;
    comp_lvl_order: number;
    void_ind: string;
}

export class CompetitionLevel implements ICompetitionLevel {
    comp_lvl_typ = '';
    comp_lvl_typ_nm = '';
    comp_lvl_order = 0;
    void_ind = '';

    constructor(comp_lvl_typ?: string, comp_lvl_typ_nm?: string) {
        this.comp_lvl_typ = comp_lvl_typ || '';
        this.comp_lvl_typ_nm = comp_lvl_typ_nm || '';
    }
}
export interface IMatch {
    match_key: string;
    match_number: number;
    event: IEvent;
    red_one_id: number;
    red_one_rank: number;
    red_one_field_response: boolean;
    red_two_id: number;
    red_two_rank: number;
    red_two_field_response: boolean;
    red_three_id: number;
    red_three_rank: number;
    red_three_field_response: boolean;
    blue_one_id: number;
    blue_one_rank: number;
    blue_one_field_response: boolean;
    blue_two_id: number;
    blue_two_rank: number;
    blue_two_field_response: boolean;
    blue_three_id: number;
    blue_three_rank: number;
    blue_three_field_response: boolean;

    red_score: number;
    blue_score: number;
    comp_level: ICompetitionLevel;

    time: Date;
    void_ind: string;

}

export class Match implements IMatch {
    match_key = '';
    match_number = NaN;
    event!: Event;
    red_one_id = NaN;
    red_one_rank!: number;
    red_one_field_response!: boolean;
    red_two_id = NaN;
    red_two_rank!: number;
    red_two_field_response!: boolean;
    red_three_id = NaN;
    red_three_rank!: number;
    red_three_field_response!: boolean;
    blue_one_id = NaN;
    blue_one_rank!: number;
    blue_one_field_response!: boolean;
    blue_two_id = NaN;
    blue_two_rank!: number;
    blue_two_field_response!: boolean;
    blue_three_id = NaN;
    blue_three_rank!: number;
    blue_three_field_response!: boolean;
    red_score!: number;
    blue_score!: number;
    comp_level!: CompetitionLevel;
    time!: Date;
    void_ind!: string;

}
export interface IScoutFieldSchedule {
    id: number;
    event_id: number;
    red_one_id: User | number | null | any;
    red_two_id: User | number | null | any;
    red_three_id: User | number | null | any;
    blue_one_id: User | number | null | any;
    blue_two_id: User | number | null | any;
    blue_three_id: User | number | null | any;
    red_one_check_in: Date;
    red_two_check_in: Date;
    red_three_check_in: Date;
    blue_one_check_in: Date;
    blue_two_check_in: Date;
    blue_three_check_in: Date;
    st_time: Date;
    end_time: Date;
    notification1: boolean;
    notification2: boolean;
    notification3: boolean;
    void_ind: string;
    scouts: string;
}

export class ScoutFieldSchedule implements IScoutFieldSchedule {
    id = NaN;
    event_id = NaN;
    red_one_id: User | number | null | any = new User();
    red_two_id: User | number | null | any = new User();
    red_three_id: User | number | null | any = new User();
    blue_one_id: User | number | null | any = new User();
    blue_two_id: User | number | null | any = new User();
    blue_three_id: User | number | null | any = new User();
    red_one_check_in = new Date();
    red_two_check_in = new Date();
    red_three_check_in = new Date();
    blue_one_check_in = new Date();
    blue_two_check_in = new Date();
    blue_three_check_in = new Date();
    st_time!: Date;
    end_time!: Date;
    notification1 = false;
    notification2 = false;
    notification3 = false;
    void_ind = 'n';
    scouts = '';
}

export interface IScoutQuestion {
    id: number;
    question_id: number;
    season_id: number;
    void_ind: string;
}

export class ScoutQuestion implements IScoutQuestion {
    id!: number;
    question_id!: number;
    season_id!: number;
    void_ind = 'n';
}

export interface IScoutFieldFormResponse {
    id: number;
    team_id: number;
    match: IMatch | undefined;
    form_typ: string;
    answers: Answer[];
}

export class ScoutFieldFormResponse implements IScoutFieldFormResponse {
    id!: number;
    team_id!: number;
    match: Match | undefined = undefined;
    form_typ = 'field';
    answers: Answer[] = [];

    constructor(team?: number, match?: Match, answers?: Answer[]) {
        this.team_id = team || NaN;
        this.match = match || undefined;
        this.answers = answers || [];
        this.form_typ = "field";
    }
}

export interface IScoutPitFormResponse {
    id: number;
    answers: Answer[];
    team_id: number;
    response_id: number;
    form_typ: string;
    pics: ScoutPitImage[];
}

export class ScoutPitFormResponse implements IScoutPitFormResponse {
    id!: number;
    answers: Answer[] = [];
    team_id!: number;
    response_id = NaN;
    form_typ = 'field';
    pics: ScoutPitImage[] = [];

    constructor(question_answers?: Answer[], team?: number, pics?: ScoutPitImage[]) {
        this.answers = question_answers || [];
        this.team_id = team || NaN;
        this.pics = pics || [];
    }
}

export interface IScoutResults {
    scoutCols: any[];
    scoutAnswers: any[];
}

export class ScoutFieldResponsesReturn {
    scoutCols: any[] = [];
    scoutAnswers: any[] = [];
    current_season = new Season();
    current_event = new Event();
    removed_responses: number[] = [];
}

export class ScoutField {
    id = NaN
    response = ''
    event = NaN
    team_no = NaN
    user = NaN
    time?: Date;
    match = NaN
    void_ind = 'n'
}

export interface IScoutPitResponseAnswer {
    question: string;
    answer: string;
}

export class ScoutPitResponseAnswer implements IScoutPitResponseAnswer {
    question = '';
    answer = '';
}

export interface IScoutPitImageType {
    pit_image_typ: string;
    pit_image_nm: string;
}

export class ScoutPitImageType {
    pit_image_typ = '';
    pit_image_nm = '';
}


export interface IScoutPitImage {
    id: number;
    img: File | undefined;
    img_url: string;
    img_title: string;
    pit_image_typ: IScoutPitImageType;
    default: boolean;
}

export class ScoutPitImage implements IScoutPitImage {
    id = NaN;
    img: File | undefined = undefined;
    img_url = '';
    img_title = '';
    pit_image_typ = new ScoutPitImageType();
    default = false;

    constructor(img_url = '', img_title = '', pit_image_typ = '', img: File | undefined = undefined, def = false) {
        this.img_url = img_url;
        this.img = img;
        this.img_title = img_title;
        this.pit_image_typ = {
            pit_image_typ: pit_image_typ,
            pit_image_nm: ''
        },
            this.default = def;
    }
}

export interface IScoutPitResponse {
    id: number;
    team_no: number;
    team_nm: string;
    pics: IScoutPitImage[];
    responses: IScoutPitResponseAnswer[];
}

export class ScoutPitResponse implements IScoutPitResponse {
    id = NaN;
    team_no = NaN;
    team_nm = '';
    pics: ScoutPitImage[] = [];
    responses: ScoutPitResponseAnswer[] = [];
}

export class ScoutPitResponsesReturn {
    current_season = new Season();
    current_event = new Event();
    teams: ScoutPitResponse[] = [];
}

export interface ISchedule {
    id: number;
    sch_typ: string;
    sch_nm: string;
    event_id: Event | number;
    red_one_id: User | number | null;
    user: User | number | null;
    user_name: string;
    st_time: Date;
    end_time: Date;
    notified: boolean;
    void_ind: string;
}

export class Schedule implements ISchedule {
    id = NaN;
    sch_typ = ''
    sch_nm = ''
    event_id: Event | number = new Event();
    red_one_id!: User | number | null;
    user: User | number | null = null;
    user_name = '';
    st_time!: Date;
    end_time!: Date;
    notified = false;
    void_ind = 'n';
}

export interface IScheduleType {
    sch_typ: string;
    sch_nm: string;
}

export class ScheduleType implements IScheduleType {
    sch_typ = '';
    sch_nm = '';
}

export class ScheduleByType {
    schedule: Schedule[] = [];
    sch_typ = new ScheduleType();
}

export interface ITeamNote {
    id: number;
    team_id: number;
    match: Match | undefined;
    user: User | undefined;
    note: string;
    time: Date;
    void_ind: string;
}

export class TeamNote implements ITeamNote {
    id = NaN;
    team_id = NaN;
    match: Match | undefined = undefined;
    user: User | undefined = undefined;
    note = '';
    time!: Date;
    void_ind = 'n';
}

export class MatchPlanning {
    team!: Team;
    pitData = new ScoutPitResponse();
    scoutAnswers!: any;
    notes: TeamNote[] = [];
    alliance = '';
}

export class AllScoutInfo {
    seasons: Season[] = [];
    events: Event[] = [];
    teams: Team[] = [];
    matches: Match[] = [];
    schedules: Schedule[] = [];
    scout_field_schedules: ScoutFieldSchedule[] = [];
    schedule_types: ScheduleType[] = [];
    team_notes: TeamNote[] = [];
    match_strategies: MatchStrategy[] = [];
    field_form_form = new FieldFormForm();
    alliance_selections: AllianceSelection[] = [];
}

export class ScoutPitSchedule {
    scout_pit_sch_id!: number;
    event = new Event();
    user = new User();
    st_time!: Date;
    end_time!: Date;
    notified = 'n';
    void_ind = 'n';
}

export class EventToTeams {
    event_id!: number;
    teams: Team[] = [];
}

export class ScoutFieldResultsSerializer {
    scoutCols: any[] = [];
    scoutAnswers: any[] = [];
}

export class ScoutingUserInfo {
    id!: number;
    under_review = false;
}
export class UserInfo {
    user = new User();
    user_info = new ScoutingUserInfo();
}

export class FieldForm {
    id!: number;
    season_id!: number;
    img!: File;
    img_url = '';
    inv_img!: File;
    inv_img_url = '';
    full_img!: File;
    full_img_url = '';
}

export interface IFormSubTypeForm {
    form_sub_typ: IFormSubType;
    questions: IQuestion[];
    flows: Flow[];
}

export class FormSubTypeForm implements IFormSubTypeForm {
    form_sub_typ = new FormSubType();
    questions: Question[] = [];
    flows: Flow[] = [];
}

export interface IFieldFormForm {
    id: number;
    field_form: FieldForm;
    form_sub_types: IFormSubTypeForm[];
}


export class FieldFormForm implements IFieldFormForm {
    id = NaN;
    field_form = new FieldForm();
    form_sub_types: FormSubTypeForm[] = [];
}

export interface IMatchStrategy {
    id: number;
    match: Match | undefined;
    user: User | undefined;
    strategy: string;
    time: Date;
    img: File | undefined;
    img_url: string;
    display_value: string;
}

export class MatchStrategy implements IMatchStrategy {
    id!: number;
    match: Match | undefined = undefined;
    user: User | undefined = undefined;
    strategy = '';
    time = new Date()
    img: File | undefined = undefined;
    img_url = '';
    display_value = '';
}

export interface IAllianceSelection {
    id: number;
    event: Event | undefined;
    team: Team | undefined;
    note: string;
    order: number;
}

export class AllianceSelection implements IAllianceSelection {
    id = NaN;
    event: Event | undefined = undefined;
    team: Team | undefined = undefined;
    note = "";
    order = NaN;

    constructor(event: Event, team: Team, note: string, order: number) {
        this.event = event;
        this.team = team;
        this.note = note;
        this.order = order;
    }
}

export class FieldResponse {
    id = NaN;
    match: Match | undefined = undefined
    user = new User();
    time = new Date()
    answers: Answer[] = [];
    display_value = '';
}