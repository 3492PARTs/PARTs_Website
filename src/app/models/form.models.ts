import { IScoutQuestion, ScoutQuestion } from "./scouting.models";

export interface IQuestionWithConditions {
    question_id: number;
    form_typ: string;
    form_sub_typ: string;
    form_sub_nm: string;
    question_typ: IQuestionType;
    question: string;
    table_col_width: string;
    order: number;
    required: string;
    active: string;
    void_ind: string;
    answer: any;
    display_value: string;

    questionoption_set: IQuestionOption[];

    scout_question: IScoutQuestion;
    conditions: IQuestionCondition[];
    is_condition: string;

}

export interface IQuestion {
    question_id: number;
    form_typ: string;
    form_sub_typ: string;
    form_sub_nm: string;
    question_typ: IQuestionType;
    question: string;
    table_col_width: string;
    order: number;
    required: string;
    active: string;
    void_ind: string;
    answer: any;
    display_value: string;

    questionoption_set: IQuestionOption[];

    scout_question: IScoutQuestion;

    is_condition: string;
}

export class QuestionWithConditions implements IQuestionWithConditions {
    question_id = NaN;
    form_typ = '';
    form_sub_typ = '';
    form_sub_nm = '';
    question_typ!: QuestionType;
    question = '';
    table_col_width = '100px';
    order = NaN;
    required = 'n';
    active = 'y';
    void_ind = 'n';
    answer: any = '';
    display_value = '';

    questionoption_set: QuestionOption[] = [];

    scout_question = new ScoutQuestion();

    conditions: QuestionCondition[] = [];

    is_condition = 'n';
}

export class Question implements IQuestion {
    question_id = NaN;
    form_typ!: string;
    form_sub_typ!: string;
    form_sub_nm!: string;
    question_typ!: QuestionType;
    question!: string;
    table_col_width = '100px'
    order!: number;
    required = 'n';
    active = 'y';
    void_ind = 'n';
    answer: any = '';
    display_value = '';

    questionoption_set: QuestionOption[] = [];

    scout_question = new ScoutQuestion();

    is_condition = 'n';
}

export interface IQuestionOption {
    question_opt_id: number;
    option: string;
    active: string;
    void_ind: string;
}

export class QuestionOption implements IQuestionOption {
    question_opt_id!: number;
    option!: string;
    active = 'y';
    void_ind = 'n';
}

export class QuestionAnswer {
    question_answer_id!: number;
    response!: any;
    question!: QuestionWithConditions;
    answer = '';
    void_ind = 'n'
}

export interface IQuestionType {
    question_typ: string;
    question_typ_nm: string;
    is_list: string;
    void_ind: string;
}

export class QuestionType implements IQuestionType {
    question_typ!: string;
    question_typ_nm!: string;
    is_list = 'n';
    void_ind = 'n';
}

export class FormSubType {
    form_sub_typ = ''
    form_sub_nm = ''
    form_typ_id = ''
}


export class QuestionAggregateType {
    question_aggregate_typ = ''
    question_aggregate_nm = ''
}


export class QuestionAggregate {
    question_aggregate_id!: number;
    field_name = '';
    question_aggregate_typ?: QuestionAggregateType;
    questions: QuestionWithConditions[] = [];
    active = 'y'
}

export interface IQuestionCondition {
    question_condition_id: number;
    condition: string;
    question_from: IQuestion;
    question_to: IQuestion;
    active: string;
}

export class QuestionCondition implements IQuestionCondition {
    question_condition_id!: number;
    condition = '';
    question_from!: Question;
    question_to!: Question;
    active = 'y';
}

export class FormType {
    form_typ!: string;
    form_nm!: string;
}

export class Response {
    response_id!: number;
    form_typ = '';
    time = new Date();
    archive_ind = "n";
    questionanswer_set: QuestionWithConditions[] = [];
}