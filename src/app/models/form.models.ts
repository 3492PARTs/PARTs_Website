import { IScoutQuestion, ScoutQuestion, ScoutQuestionType } from "./scouting.models";

export interface IQuestionWithConditions {
    question_id: number;
    question_flow_id: number;
    form_typ: IFormType;
    form_sub_typ: IFormSubType;
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
    has_conditions: string;

}

export interface IQuestion {
    question_id: number;
    question_flow_id: number;
    form_typ: IFormType;
    form_sub_typ: IFormSubType;
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
    has_conditions: string;
}

export class QuestionWithConditions implements IQuestionWithConditions {
    question_id = NaN;
    question_flow_id = NaN;
    form_typ = new FormType();
    form_sub_typ!: FormSubType;
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
    has_conditions = 'n';
}

export class Question implements IQuestion {
    question_id = NaN;
    question_flow_id = NaN;
    form_typ = new FormType();
    form_sub_typ!: FormSubType;
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
    has_conditions = 'n';
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

export class QuestionFlowAnswer {
    id!: number;
    //question_answer = new QuestionAnswer();
    question: Question | undefined = undefined;
    answer = '';
    answer_time = "";
    void_ind = 'n'

    constructor(question: Question, answer: string) {
        this.question = question;
        this.answer = answer;
        const pieces = new Date(Date.now()).toTimeString().split(' ')[0];
        this.answer_time = pieces;
        //hh:mm[:ss[.uuuuuu]]
    }
}

export class QuestionAnswer {
    question_answer_id!: number;
    response = new Response();
    question: Question | undefined = undefined;
    question_flow: QuestionFlow | undefined = undefined;
    answer = '';
    question_flow_answers: QuestionFlowAnswer[] = [];
    void_ind = 'n'

    constructor(answer: string, question?: Question, question_flow?: QuestionFlow) {
        this.question = question;
        this.question_flow = question_flow;
        this.answer = answer;
    }
}

export interface IQuestionType {
    question_typ: string;
    question_typ_nm: string;
    is_list: string;
    scout_question_type: ScoutQuestionType;
    void_ind: string;
}

export class QuestionType implements IQuestionType {
    question_typ!: string;
    question_typ_nm!: string;
    is_list = 'n';
    scout_question_type!: ScoutQuestionType;
    void_ind = 'n';
}

export interface IFormSubType {
    form_sub_typ: string;
    form_sub_nm: string;
    form_typ_id: string;
    order: number;
}

export class FormSubType implements IFormSubType {
    form_sub_typ = ''
    form_sub_nm = ''
    form_typ_id = ''
    order = NaN;
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

export interface IFormType {
    form_typ: string;
    form_nm: string;
}

export class FormType implements IFormType {
    form_typ = '';
    form_nm = '';
}

export class Response {
    response_id!: number;
    form_typ = '';
    time = new Date();
    archive_ind = "n";
    questionanswer_set: QuestionWithConditions[] = [];
}

export class QuestionFlow {
    id = NaN;
    name = "";
    single_run = false;
    form_typ = new FormType();
    form_sub_typ!: FormSubType;
    questions: Question[] = [];
    question_answer: QuestionAnswer | undefined = undefined;
}

export class FormInitialization {
    question_types: QuestionType[] = [];
    questions: QuestionWithConditions[] = [];
    form_sub_types: FormSubType[] = [];
    question_flows: QuestionFlow[] = [];
}