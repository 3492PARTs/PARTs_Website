import { IQuestionWithConditions, QuestionWithConditions } from "./form.models";
import { User } from "./user.models";

export interface ITeam {
    team_no: number;
    team_nm: string;
    void_ind: string;
    checked: boolean;
}

export class Team implements ITeam {
    team_no = NaN;
    team_nm = '';
    void_ind = 'n'
    checked = false;
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
    team_no: ITeam[];
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
    team_no: Team[] = [];
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
    red_two: ITeam | number;
    red_three: ITeam | number;
    blue_one: ITeam | number;
    blue_two: ITeam | number;
    blue_three: ITeam | number;
    red_score: number;
    blue_score: number;
    comp_level: string | ICompetitionLevel;
    time: Date;
    void_ind: string;

}

export class Match implements IMatch {
    match_id = '';
    match_number = NaN;
    event!: Event;
    red_one!: Team | number;
    red_two!: Team | number;
    red_three!: Team | number;
    blue_one!: Team | number;
    blue_two!: Team | number;
    blue_three!: Team | number;
    red_score!: number;
    blue_score!: number;
    comp_level!: string | CompetitionLevel;
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

export interface IScoutQuestion {
    id: number;
    question_id: number;
    season_id: number;
    scorable: boolean;
    void_ind: string;
}

export class ScoutQuestion implements IScoutQuestion {
    id!: number;
    question_id!: number;
    season_id!: number;
    scorable = false;
    void_ind = 'n';
}

export interface IScoutFieldResponse {
    question_answers: IQuestionWithConditions[];
    team: number;
    match_id: string | null;
    form_typ: string;
}

export class ScoutFieldResponse implements IScoutFieldResponse {
    question_answers: QuestionWithConditions[] = [];
    team!: number;
    match_id!: string | null;
    form_typ = 'field';
}

export interface IScoutPitResponse {
    question_answers: IQuestionWithConditions[];
    team: number;
    response_id: number | null;
    form_typ: string;
}

export class ScoutPitResponse implements IScoutPitResponse {
    question_answers: QuestionWithConditions[] = [];
    team!: number;
    response_id!: number | null;
    form_typ = 'field';
}