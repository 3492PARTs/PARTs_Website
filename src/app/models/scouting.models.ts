import { FormSubType, IQuestionWithConditions, Question, QuestionFlow, QuestionWithConditions } from "./form.models";
import { User } from "./user.models";

export interface ISeason {
    season_id: number;
    season: string;
    current: string;
}


export class Season implements ISeason {
    season_id = NaN;
    season = '';
    current = 'n';
}

export interface ITeam {
    team_no: number;
    team_nm: string;
    void_ind: string;
    checked: boolean;
    pit_result: number;
}

export class Team implements ITeam {
    team_no = NaN;
    team_nm = '';
    void_ind = 'n'
    checked = false;
    pit_result = 0;
}

export interface IEvent {
    event_id: number;
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
    event_id = NaN;
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
}
export interface IMatch {
    match_id: string;
    match_number: number;
    event: IEvent;
    red_one: ITeam | number;
    red_one_rank: number;
    red_one_field_response: boolean;
    red_two: ITeam | number;
    red_two_rank: number;
    red_two_field_response: boolean;
    red_three: ITeam | number;
    red_three_rank: number;
    red_three_field_response: boolean;
    blue_one: ITeam | number;
    blue_one_rank: number;
    blue_one_field_response: boolean;
    blue_two: ITeam | number;
    blue_two_rank: number;
    blue_two_field_response: boolean;
    blue_three: ITeam | number;
    blue_three_rank: number;
    blue_three_field_response: boolean;

    red_score: number;
    blue_score: number;
    comp_level: ICompetitionLevel;

    time: Date;
    void_ind: string;

}

export class Match implements IMatch {
    match_id = '';
    match_number = NaN;
    event!: Event;
    red_one!: ITeam | number;
    red_one_rank!: number;
    red_one_field_response!: boolean;
    red_two!: ITeam | number;
    red_two_rank!: number;
    red_two_field_response!: boolean;
    red_three!: ITeam | number;
    red_three_rank!: number;
    red_three_field_response!: boolean;
    blue_one!: ITeam | number;
    blue_one_rank!: number;
    blue_one_field_response!: boolean;
    blue_two!: ITeam | number;
    blue_two_rank!: number;
    blue_two_field_response!: boolean;
    blue_three!: ITeam | number;
    blue_three_rank!: number;
    blue_three_field_response!: boolean;
    red_score!: number;
    blue_score!: number;
    comp_level!: CompetitionLevel;
    time!: Date;
    void_ind!: string;

}
export interface IScoutFieldSchedule {
    scout_field_sch_id: number;
    event_id: IEvent | number;
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
    scout_field_sch_id = NaN;
    event_id: Event | number = new Event();
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

export interface IScoutQuestionType {
    id: number;
    scorable: string;
}

export class ScoutQuestionType implements IScoutQuestionType {
    id!: number;
    scorable = '';
}

export interface IScoutQuestion {
    id: number;
    question_id: number;
    season_id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    icon: string;
    value_multiplier: number;
    void_ind: string;
}

export class ScoutQuestion implements IScoutQuestion {
    id!: number;
    question_id!: number;
    season_id!: number;
    x!: number;
    y!: number;
    width!: number;
    height!: number;
    icon!: string;
    value_multiplier!: number;
    void_ind = 'n';
}

export interface IScoutFieldFormResponse {
    id: number;
    question_answers: IQuestionWithConditions[];
    team: number;
    match: IMatch | null;
    form_typ: string;
}

export class ScoutFieldFormResponse implements IScoutFieldFormResponse {
    id!: number;
    question_answers: QuestionWithConditions[] = [];
    team!: number;
    match!: Match | null;
    form_typ = 'field';

    constructor(question_answers?: QuestionWithConditions[], team?: number, match?: Match | null) {
        this.question_answers = question_answers || [];
        this.team = team || NaN;
        this.match = match || null;
    }
}

export interface IScoutPitFormResponse {
    id: number;
    question_answers: IQuestionWithConditions[];
    team: number;
    response_id: number;
    form_typ: string;
    robotPics: File[];
}

export class ScoutPitFormResponse implements IScoutPitFormResponse {
    id!: number;
    question_answers: QuestionWithConditions[] = [];
    team!: number;
    response_id = NaN;
    form_typ = 'field';
    robotPics: File[] = [];

    constructor(question_answers?: QuestionWithConditions[], team?: number, robotPics?: File[]) {
        this.question_answers = question_answers || [];
        this.team = team || NaN;
        this.robotPics = robotPics || [];
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
    removed_responses: ScoutField[] = [];
}

export class ScoutField {
    scout_field_id = NaN
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

export interface IScoutPitImage {
    scout_pit_img_id: number;
    pic: string;
    default: boolean;
}

export class ScoutPitImage implements IScoutPitImage {
    scout_pit_img_id = NaN;
    pic = '';
    default = false;
}

export interface IScoutPitResponse {
    scout_pit_id: number;
    team_no: number;
    team_nm: string;
    pics: IScoutPitImage[];
    display_pic_index: number;
    responses: IScoutPitResponseAnswer[];
}

export class ScoutPitResponse implements IScoutPitResponse {
    scout_pit_id = NaN;
    team_no = NaN;
    team_nm = '';
    pics: ScoutPitImage[] = [];
    display_pic_index = 0;
    responses: ScoutPitResponseAnswer[] = [];
}

export class ScoutPitResponsesReturn {
    current_season = new Season();
    current_event = new Event();
    teams: ScoutPitResponse[] = [];
}

export interface ISchedule {
    sch_id: number;
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
    sch_id = NaN;
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
    team_note_id: number;
    event: Event | number;
    team_no: Team | number;
    match_id: Match | string;
    user: User | number;
    note: string;
    time: Date;
    void_ind: string;
}

export class TeamNote implements ITeamNote {
    team_note_id = NaN;
    event: Event | number = NaN;
    team_no: Team | number = NaN;
    match_id: Match | string = '';
    user: User | number = NaN;
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
}

export class FormSubTypesForm {
    form_sub_typ = new FormSubType()
    questions: QuestionWithConditions[] = [];
    question_flows: QuestionFlow[] = [];
}

export class FormFieldForm {
    field_form = new FieldForm();
    form_sub_types: FormSubTypesForm[] = [];
}