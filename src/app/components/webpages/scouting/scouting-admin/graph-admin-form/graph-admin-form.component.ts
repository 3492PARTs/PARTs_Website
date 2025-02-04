import { Component, OnInit } from '@angular/core';
import { APIService } from '../../../../../services/api.service';
import { Graph, GraphQuestionType, GraphType, Question, QuestionAggregate } from '../../../../../models/form.models';
import { AuthCallStates, AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-graph-admin-form',
  imports: [],
  templateUrl: './graph-admin-form.component.html',
  styleUrl: './graph-admin-form.component.scss'
})
export class GraphAdminFormComponent implements OnInit {
  private FormTyp = 'field';

  questions: Question[] = [];
  questionAggregates: QuestionAggregate[] = [];

  graphs: Graph[] = [];
  graphTypes: GraphType[] = [];
  graphQuestionTypes: GraphQuestionType[] = [];

  constructor(private api: APIService, private authService: AuthService) { }

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
    });
  }

  getQuestions(): void {
    this.api.get(true, 'form/question/', {
      form_typ: this.FormTyp,
      active: 'y'
    }, (result: Question[]) => {
      this.questions = result;
    });
  }

  getQuestionAggregates(): void {
    this.api.get(true, 'form/question-aggregate/', {
      form_typ: this.FormTyp
    }, (result: any) => {
      this.questionAggregates = result as QuestionAggregate[];
    });
  }
}
