import { IScoutQuestion, IScoutQuestionType, ScoutQuestion, ScoutQuestionType } from "./scouting.models";

export interface IQuestion {
    id: number;
    flow_id_set: number[];
    form_typ: IFormType;
    form_sub_typ: IFormSubType;
    question_typ: IQuestionType;
    question: string;
    svg: string;
    table_col_width: string;
    order: number;
    required: string;
    x: number;
    y: number;
    width: number;
    height: number;
    icon: string;
    icon_only: string;
    value_multiplier: number;
    active: string;
    void_ind: string;
    answer: any;
    display_value: string;

    questionoption_set: IQuestionOption[];

    scout_question: IScoutQuestion;

    question_conditional_on: number;
    question_condition_value: string;
    question_condition_typ: QuestionConditionType | undefined;
    conditional_question_id_set: number[];
}

export class Question implements IQuestion {
    id = NaN;
    flow_id_set: number[] = [];
    form_typ = new FormType();
    form_sub_typ!: FormSubType;
    question_typ!: QuestionType;
    question!: string;
    svg!: string;
    table_col_width = '100px'
    order!: number;
    required = 'n';
    x = NaN;
    y = NaN;
    width = NaN;
    height = NaN;
    icon = '';
    icon_only = '';
    value_multiplier!: number;
    active = 'y';
    void_ind = 'n';
    answer: any = '';
    display_value = '';

    questionoption_set: QuestionOption[] = [];

    scout_question = new ScoutQuestion();

    question_conditional_on = NaN;
    question_condition_value = '';
    question_condition_typ: QuestionConditionType | undefined = undefined;
    conditional_question_id_set: number[] = [];
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

export interface IFlowAnswer {
    id: number;
    //question_answer = new QuestionAnswer();
    question: IQuestion | undefined;
    value: any;
    value_time: string;
    void_ind: string;
}

export class FlowAnswer implements IFlowAnswer {
    id = NaN;
    //question_answer = new QuestionAnswer();
    question: Question | undefined = undefined;
    value: any = '';
    value_time = "";
    void_ind = 'n';

    constructor(question: Question, answer: string) {
        this.question = question;
        this.value = answer;
        const pieces = new Date(Date.now()).toTimeString().split(' ')[0];
        this.value_time = pieces;
        //hh:mm[:ss[.uuuuuu]]
    }
}

export interface IAnswer {
    id: number;
    response: IResponse;
    question: IQuestion | undefined;
    flow: IFlow | undefined;
    value: string;
    flow_answers: IFlowAnswer[];
    void_ind: string
}

export class Answer implements IAnswer {
    id!: number;
    response = new Response();
    question: Question | undefined = undefined;
    flow: Flow | undefined = undefined;
    value = '';
    flow_answers: FlowAnswer[] = [];
    void_ind = 'n';

    constructor(answer: string, question?: Question, question_flow?: Flow) {
        this.question = question;
        this.flow = question_flow;
        this.value = answer;
    }
}

export interface IQuestionType {
    question_typ: string;
    question_typ_nm: string;
    is_list: string;
    scout_question_type: IScoutQuestionType;
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
    questions: Question[] = [];
    active = 'y'
}

export class QuestionConditionType {
    question_condition_typ = ''
    question_condition_nm = ''
}

export interface IQuestionCondition {
    question_condition_id: number;
    question_condition_typ: QuestionConditionType | undefined;
    value: string;
    question_from: IQuestion;
    question_to: IQuestion;
    active: string;
}

export class QuestionCondition implements IQuestionCondition {
    question_condition_id!: number;
    question_condition_typ: QuestionConditionType | undefined = undefined;
    value = '';
    question_from!: Question;
    question_to!: Question;
    active = 'y';
}

export interface IFlowCondition {
    id: number;
    flow_from: Flow;
    flow_to: Flow;
    active: string;
}

export class FlowCondition implements IFlowCondition {
    id = NaN;
    flow_from = new Flow();
    flow_to = new Flow();
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

export interface IResponse {
    response_id: number;
    form_typ: string;
    time: Date;
    archive_ind: string;
    questionanswer_set: IQuestion[];
}

export class Response implements IResponse {
    response_id = NaN;
    form_typ = '';
    time = new Date();
    archive_ind = "n";
    questionanswer_set: Question[] = [];
}

export interface IQuestionFlow {
    id: number;
    flow_id: number;
    question: Question;
    order: number;
    active: string;
}

export class QuestionFlow implements IQuestionFlow {
    id = NaN;
    flow_id = NaN;
    question = new Question();
    order = NaN;
    active = '';
}

export interface IFlow {
    id: number;
    name: string;
    single_run: boolean;
    form_typ: IFormType;
    form_sub_typ: IFormSubType | undefined;
    question_flows: IQuestionFlow[];
    question_answer: IAnswer | undefined;
    void_ind: string;

    flow_conditional_on: number;
    has_conditions: string;
}

export class Flow implements IFlow {
    id = NaN;
    name = "";
    single_run = false;
    form_typ = new FormType();
    form_sub_typ!: FormSubType;
    question_flows: QuestionFlow[] = [];
    question_answer: Answer | undefined = undefined;
    void_ind = 'n';

    flow_conditional_on = NaN;
    has_conditions = '';
}

export class FormInitialization {
    question_types: QuestionType[] = [];
    questions: Question[] = [];
    form_sub_types: FormSubType[] = [];
    flows: Flow[] = [];
}

export class GraphType {
    graph_typ = '';
    graph_nm = '';
}

export class Graph {
    id = NaN
    graph_typ: GraphType | undefined = undefined;
    name = '';
    active = 'y';
}


export class GraphQuestionType {
    graph_question_typ = '';
    graph_question_nm = '';
}

export class GraphQuestion {
    id = NaN
    graph: Graph | undefined = undefined;
    question: Question | undefined = undefined;
    graph_question_typ: GraphQuestionType | undefined = undefined;
    active = 'y';
}
