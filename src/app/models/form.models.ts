import { IScoutQuestion, ScoutQuestion } from "./scouting.models";

export interface IConditionalOnQuestion {
    conditional_on: number;
    condition_value: string;
    question_condition_typ: QuestionConditionType;
}

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
    icon_only: boolean;
    value_multiplier: number;
    active: string;
    void_ind: string;
    answer: any;
    short_display_value: string;
    display_value: string;

    questionoption_set: IQuestionOption[];

    scout_question: IScoutQuestion;

    conditional_on_questions: IConditionalOnQuestion[];
    conditional_question_id_set: number[];
}

export class ConditionalOnQuestion implements IConditionalOnQuestion {
    conditional_on = NaN;
    condition_value = '';
    question_condition_typ = new QuestionConditionType();
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
    icon_only = false;
    value_multiplier = 1;
    active = 'y';
    void_ind = 'n';
    answer: any = '';
    short_display_value = '';
    display_value = '';

    questionoption_set: QuestionOption[] = [];

    scout_question = new ScoutQuestion();

    conditional_on_questions: ConditionalOnQuestion[] = [];
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
    void_ind: string;
}

export class QuestionType implements IQuestionType {
    question_typ!: string;
    question_typ_nm!: string;
    is_list = 'n';
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


export class QuestionAggregateQuestion {
    id = NaN;
    question_condition_typ: QuestionConditionType | undefined = undefined;
    question: Question | undefined = undefined;
    use_answer_time = false;
    active = 'y';
}

export class QuestionAggregate {
    id!: number;
    name = '';
    horizontal = true;
    question_aggregate_typ?: QuestionAggregateType;
    aggregate_questions: QuestionAggregateQuestion[] = [];
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

export interface IFlowQuestion {
    id: number;
    flow_id: number;
    question: Question;
    order: number;
    active: string;
}

export class FlowQuestion implements IFlowQuestion {
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
    flow_questions: IFlowQuestion[];
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
    flow_questions: FlowQuestion[] = [];
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
    requires_bins = false;
    requires_categories = false;
    requires_graph_question_typs: GraphQuestionType[] = [];
}


export class GraphBin {
    id = NaN;
    graph_id = NaN;
    bin = NaN;
    width = NaN;
    active = 'y'
}

export class GraphCategoryAttribute {
    id = NaN;
    graph_category_id = NaN;
    question: Question | undefined = undefined;
    question_aggregate: QuestionAggregate | undefined = undefined;
    question_condition_typ: QuestionType | undefined = undefined;
    value = '';
    active = 'y';
}


export class GraphCategory {
    id = NaN;
    graph_id = NaN;
    category = '';
    order = NaN;
    active = 'y';
    graphcategoryattribute_set: GraphCategoryAttribute[] = [];
}


export class GraphQuestionType {
    graph_question_typ = '';
    graph_question_nm = '';
}

export class GraphQuestion {
    id = NaN;
    graph_id = NaN;
    question: Question | undefined = undefined;
    question_aggregate: QuestionAggregate | undefined = undefined;
    graph_question_typ: GraphQuestionType | undefined = undefined;
    active = 'y';
}


export class Graph {
    id = NaN;
    graph_typ: GraphType | undefined = undefined;
    name = '';
    x_scale_min = NaN;
    x_scale_max = NaN;
    y_scale_min = NaN;
    y_scale_max = NaN;
    active = 'y';
    graphbin_set: GraphBin[] = [];
    graphcategory_set: GraphCategory[] = [];
    graphquestion_set: GraphQuestion[] = [];
}


export class HistogramBin {
    bin = '';
    count = NaN;
}
export class Histogram {
    label = '';
    bins: HistogramBin[] = [];
}

export class PlotPoint {
    point = NaN;
    time = new Date();
}

export class Plot {
    label = '';
    points: PlotPoint[] = [];
}

export class BoxAndWhiskerPlot {
    label = '';
    q1 = NaN;
    q2 = NaN;
    q3 = NaN;
    min = NaN;
    max = NaN;
    outliers: number[] = [];
}

export class TouchMapPoint {
    x = NaN;
    y = NaN;
}

export class TouchMap {
    label = '';
    question = new Question();
    points: TouchMapPoint[] = [];
}