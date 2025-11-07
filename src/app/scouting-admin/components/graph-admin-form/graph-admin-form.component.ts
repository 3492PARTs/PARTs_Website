import { Component, OnInit } from '@angular/core';
import { APIService } from '@app/core/services/api.service';
import { AuthCallStates, AuthService } from '@app/auth/services/auth.service';
import { BoxComponent } from "../../../shared/components/atoms/box/box.component";
import { FormElementComponent } from "../../../shared/components/atoms/form-element/form-element.component";
import { FormElementGroupComponent } from "../../../shared/components/atoms/form-element-group/form-element-group.component";
import { TableButtonType, TableColType, TableComponent } from "../../../shared/components/atoms/table/table.component";
import { ModalComponent } from "../../../shared/components/atoms/modal/modal.component";
import { FormComponent } from "../../../shared/components/atoms/form/form.component";
import { GeneralService } from '@app/core/services/general.service';
import { ButtonComponent } from "../../../shared/components/atoms/button/button.component";
import { ButtonRibbonComponent } from "../../../shared/components/atoms/button-ribbon/button-ribbon.component";
import { Question, QuestionAggregate, Graph, GraphType, GraphQuestionType, QuestionConditionType, GraphCategory, GraphBin, GraphCategoryAttribute, GraphQuestion } from '@app/core/models/form.models';

import { ModalService } from '@app/core/services/modal.service';
import { cloneObject, strNoE, updateTableSelectList } from '@app/core/utils/utils.functions';
@Component({
  selector: 'app-graph-admin-form',
  imports: [BoxComponent, FormElementComponent, FormElementGroupComponent, TableComponent, ModalComponent, FormComponent, ButtonComponent, ButtonRibbonComponent],
  templateUrl: './graph-admin-form.component.html',
  styleUrls: ['./graph-admin-form.component.scss']
})
export class GraphAdminFormComponent implements OnInit {
  private FormTyp = 'field';

  questions: Question[] = [];
  questionAggregates: QuestionAggregate[] = [];

  graphs: Graph[] = [];
  graphTypes: GraphType[] = [];
  graphQuestionTypes: GraphQuestionType[] = [];
  questionConditionTypes: QuestionConditionType[] = [];

  filterOptions = [{ property: 'Active', value: 'y' }, { property: 'Inactive', value: 'n' }];
  filterOption = 'y';
  filterText = '';
  graphTableCols: TableColType[] = [
    { PropertyName: 'name', ColLabel: 'Name' },
    { PropertyName: 'graph_typ.graph_nm', ColLabel: 'Type' },
    { PropertyName: 'x_scale_min', ColLabel: 'X Scale Min' },
    { PropertyName: 'x_scale_max', ColLabel: 'X Scale Max' },
    { PropertyName: 'y_scale_min', ColLabel: 'Y Scale Min' },
    { PropertyName: 'y_scale_max', ColLabel: 'Y Scale Max' },
  ];
  graphTableButtons: TableButtonType[] = [
    new TableButtonType('copy', this.copyGraph.bind(this))
  ]
  graphModalVisible = false;
  activeGraph: Graph | undefined = undefined;

  binTableCols: TableColType[] = [
    { PropertyName: 'bin', ColLabel: 'Bin', Type: 'number', Required: true },
    { PropertyName: 'width', ColLabel: 'Width', Type: 'number', Required: true },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'checkbox', TrueValue: 'y', FalseValue: 'n' },
  ];

  categoryTableCols: TableColType[] = [
    { PropertyName: 'order', ColLabel: 'Order', Type: 'number', Required: true },
    { PropertyName: 'category', ColLabel: 'Category', Type: 'text', Required: true },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'checkbox', TrueValue: 'y', FalseValue: 'n' },
  ];
  activeCategory: GraphCategory | undefined = undefined;

  categoryAttributeTableCols: TableColType[] = [
    { PropertyName: 'question', ColLabel: 'Question', Type: 'select', DisplayProperty: 'short_display_value', DisplayEmptyOption: true },
    { PropertyName: 'question_aggregate', ColLabel: 'Question Aggregate', Type: 'select', DisplayProperty: 'name', DisplayEmptyOption: true },
    { PropertyName: 'question_condition_typ', ColLabel: 'Condition Type', Type: 'select', DisplayProperty: 'question_condition_nm', Required: true },
    { PropertyName: 'value', ColLabel: 'Condition Value', Type: 'text' },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'checkbox', TrueValue: 'y', FalseValue: 'n' },
  ];

  graphQuestionTableCols: TableColType[] = [
    { PropertyName: 'question', ColLabel: 'Question', Type: 'select', DisplayProperty: 'short_display_value', DisplayEmptyOption: true },
    { PropertyName: 'question_aggregate', ColLabel: 'Question Aggregate', Type: 'select', DisplayProperty: 'name', DisplayEmptyOption: true },
    { PropertyName: 'graph_question_typ', ColLabel: 'Question Type', Type: 'select', DisplayProperty: 'graph_question_nm', DisplayEmptyOption: true },
    { PropertyName: 'active', ColLabel: 'Active', Type: 'checkbox', TrueValue: 'y', FalseValue: 'n' },
  ];

  constructor(private api: APIService, private authService: AuthService, private gs: GeneralService, private modalService: ModalService) { }

  ngOnInit(): void {
    this.authService.authInFlight.subscribe((r) => {
      if (r === AuthCallStates.comp) {
        this.getQuestions();
        this.getGraphFormEditor();
        this.getQuestionAggregates();
      }
    });
  }

  getGraphFormEditor(): void {
    this.api.get(true, 'form/graph-editor/', undefined, (result) => {
      this.graphs = result['graphs'] as Graph[];
      this.graphTypes = result['graph_types'] as GraphType[];
      this.graphQuestionTypes = result['graph_question_types'] as GraphQuestionType[];
      this.questionConditionTypes = result['question_condition_types'] as QuestionConditionType[];
      updateTableSelectList(this.categoryAttributeTableCols, 'question_condition_typ', this.questionConditionTypes);
      updateTableSelectList(this.graphQuestionTableCols, 'graph_question_typ', this.graphQuestionTypes);
    });
  }

  getQuestions(): void {
    this.api.get(true, 'form/question/', {
      form_typ: this.FormTyp,
      active: 'y'
    }, (result: Question[]) => {
      this.questions = result;
      updateTableSelectList(this.categoryAttributeTableCols, 'question', this.questions);
      updateTableSelectList(this.graphQuestionTableCols, 'question', this.questions);
    });
  }

  getQuestionAggregates(): void {
    this.api.get(true, 'form/question-aggregate/', {
      form_typ: this.FormTyp
    }, (result: any) => {
      this.questionAggregates = result as QuestionAggregate[];
      updateTableSelectList(this.categoryAttributeTableCols, 'question_aggregate', this.questionAggregates);
      updateTableSelectList(this.graphQuestionTableCols, 'question_aggregate', this.questionAggregates);
    });
  }

  showGraphModal(graph?: Graph): void {
    this.activeGraph = graph ? graph : new Graph();
    this.graphModalVisible = true;
  }

  addBin(): void {
    if (this.activeGraph) {
      if (!this.activeGraph.graphbin_set.find(gb => strNoE(gb.id) && strNoE(gb.bin)))
        this.activeGraph.graphbin_set.push(new GraphBin());
    }
  }

  removeBin(bin: GraphBin): void {
    if (this.activeGraph) {
      if (!strNoE(bin.id)) {
        this.modalService.triggerError('Can\'t delete saved bin, please mark inactive instead.');
      }
      else {
        let i = 0;
        for (; i < this.activeGraph.graphbin_set.length; i++)
          if (this.activeGraph.graphbin_set[i].id === bin.id && this.activeGraph.graphbin_set[i].bin === bin.bin)
            break;

        this.activeGraph.graphbin_set.splice(i, 1);
      }
    }
  }

  addCategory(): void {
    if (this.activeGraph) {
      if (!this.activeGraph.graphcategory_set.find(gc => strNoE(gc.id) && strNoE(gc.category))) {
        this.activeCategory = new GraphCategory();
        this.activeGraph.graphcategory_set.push(this.activeCategory);
      }
    }
  }

  removeCategory(category: GraphCategory): void {
    if (this.activeGraph) {
      if (!strNoE(category.id)) {
        this.modalService.triggerError('Can\'t delete saved category, please mark inactive instead.');
      }
      else {
        let i = 0;
        for (; i < this.activeGraph.graphcategory_set.length; i++) {
          const check = this.activeGraph.graphcategory_set[i];
          if (check.category == category.category)
            break;
        }
        this.activeGraph.graphcategory_set.splice(i, 1);
      }
    }
  }

  viewCategory(category: GraphCategory): void {
    this.activeCategory = category;
  }

  addCategoryAttribute(): void {
    if (this.activeCategory) {
      if (!this.activeCategory.graphcategoryattribute_set.find(gc => strNoE(gc.id) && strNoE(gc.question) && strNoE(gc.question_condition_typ))) {
        this.activeCategory.graphcategoryattribute_set.push(new GraphCategoryAttribute());
      }
    }
  }

  removeCategoryAttribute(category: GraphCategoryAttribute): void {
    if (this.activeCategory) {
      if (!strNoE(category.id)) {
        this.modalService.triggerError('Can\'t delete saved category attribute, please mark inactive instead.');
      }
      else {
        let i = 0;
        for (; i < this.activeCategory.graphcategoryattribute_set.length; i++)
          if (this.activeCategory.graphcategoryattribute_set[i].question === category.question && this.activeCategory.graphcategoryattribute_set[i].question_condition_typ === category.question_condition_typ)
            break;

        this.activeCategory.graphcategoryattribute_set.splice(i, 1);
      }
    }
  }

  addGraphQuestion(): void {
    if (this.activeGraph) {
      if (!this.activeGraph.graphquestion_set.find(gb => strNoE(gb.id) && strNoE(gb.question) && strNoE(gb.question_aggregate) && strNoE(gb.graph_question_typ)))
        this.activeGraph.graphquestion_set.push(new GraphQuestion());
    }
  }

  removeGraphQuestion(graphQuestion: GraphQuestion): void {
    if (this.activeGraph) {
      if (!strNoE(graphQuestion.id)) {
        this.modalService.triggerError('Can\'t delete saved question, please mark inactive instead.');
      }
      else {
        let i = 0;
        for (; i < this.activeGraph.graphquestion_set.length; i++)
          if (this.activeGraph.graphquestion_set[i].id === graphQuestion.id && this.activeGraph.graphquestion_set[i].question === graphQuestion.question && this.activeGraph.graphquestion_set[i].question_aggregate === graphQuestion.question_aggregate && this.activeGraph.graphquestion_set[i].graph_question_typ === graphQuestion.graph_question_typ)
            break;

        this.activeGraph.graphquestion_set.splice(i, 1);
      }
    }
  }

  saveGraph(): void {
    if (this.activeGraph) {
      this.api.post(true, 'form/graph/', this.activeGraph, (result) => {
        this.getGraphs();
      });
    }
  }

  getGraphs(): void {
    this.api.get(true, 'form/graph/', undefined, (result: Graph[]) => {
      this.graphs = result;
      this.graphModalVisible = false;
      this.activeGraph = undefined;
    });
  }

  private copyGraph(graph: Graph): void {
    const g = cloneObject(graph) as Graph;
    g.id = NaN;
    g.graphbin_set.forEach(gb => gb.id = NaN);
    g.graphcategory_set.forEach(gc => gc.id = NaN);
    g.graphquestion_set.forEach(gq => gq.id = NaN);
    this.showGraphModal(g);
  }
}
