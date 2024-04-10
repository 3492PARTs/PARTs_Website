import { IQuestion, QuestionWithConditions } from "./form.models";

export class Team {
    team_no!: string;
    team_nm!: string;
    void_ind = 'n'
    checked = false;
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
    question_answers: IQuestion[];
    team: number;
    match: number | null;
    form_typ: string;
}

export class ScoutFieldResponse implements IScoutFieldResponse {
    question_answers: QuestionWithConditions[] = [];
    team!: number;
    match!: number | null;
    form_typ = 'field';
}