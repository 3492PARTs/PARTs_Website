import { BrowserModule } from '@angular/platform-browser';
import { NgModule, isDevMode } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { HTTPInterceptor } from './helpers/http.interceptor';
import { ErrorInterceptor } from './helpers/error.interceptor';

import { HomeComponent } from './components/webpages/home/home.component';
import { NavigationComponent } from './components/navigation/navigation.component';
//import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './components/webpages/login/login.component';
import { LoadingComponent } from './components/atoms/loading/loading.component';
import { FieldScoutingComponent } from './components/webpages/scouting/field-scouting/field-scouting.component';
import { PitScoutingComponent } from './components/webpages/scouting/pit-scouting/pit-scouting.component';
import { BoxComponent } from './components/atoms/box/box.component';
import { ButtonComponent } from './components/atoms/button/button.component';
import { ButtonRibbonComponent } from './components/atoms/button-ribbon/button-ribbon.component';
import { FormElementComponent } from './components/atoms/form-element/form-element.component';
import { FormElementGroupComponent } from './components/atoms/form-element-group/form-element-group.component';
import { ScoutingAdminComponent } from './components/webpages/scouting/scouting-admin/scouting-admin.component';
import { HeaderComponent } from './components/atoms/header/header.component';
import { ModalComponent } from './components/atoms/modal/modal.component';
import { FormComponent } from './components/atoms/form/form.component';

import {
  ObjectWildCardFilterPipe,
  OrderBy,
  RemovedFilterPipe
} from './pipes/ObjectWildcardFilter';
import { StrToTypePipe } from './pipes/str-to-type.pipe';
import { DateToStrPipe } from './pipes/date-to-str.pipe';
import { QuestionAdminFormComponent } from './components/elements/question-admin-form/question-admin-form.component';
import { FieldScoutingResponsesComponent } from './components/webpages/scouting/field-scouting-responses/field-scouting-responses.component';
import { ScoutPitResponsesComponent } from './components/webpages/scouting/pit-scouting-responses/pit-scouting-responses.component';

import { ClickOutsideDirective } from './directives/click-outside/click-outside.directive';
import { ClickInsideDirective } from './directives/click-inside/click-inside.directive';
import { ScoutingPortalComponent } from './components/webpages/scouting/scouting-portal/scouting-portal.component';
import { ContactComponent } from './components/webpages/contact/contact.component';
import { JoinComponent } from './components/webpages/join/join.component';
import { CommunityOutreachComponent } from './components/webpages/join/community-outreach/community-outreach.component';
import { ElectricalComponent } from './components/webpages/join/electrical/electrical.component';
import { MechanicalComponent } from './components/webpages/join/mechanical/mechanical.component';
import { ProgrammingComponent } from './components/webpages/join/programming/programming.component';
import { SponsoringComponent } from './components/webpages/sponsoring/sponsoring.component';
import { AboutComponent } from './components/webpages/about/about.component';
import { MediaComponent } from './components/webpages/media/media.component';
import { BuildSeasonComponent } from './components/webpages/media/build-season/build-season.component';
import { CompetitionComponent } from './components/webpages/media/competition/competition.component';
import { WallpapersComponent } from './components/webpages/media/wallpapers/wallpapers.component';
import { MediaCommunityOutreachComponent } from './components/webpages/media/community-outreach/community-outreach.component';
import { ResourcesComponent } from './components/webpages/resources/resources.component';
import { FirstComponent } from './components/webpages/first/first.component';
import { SideNavComponent } from './components/atoms/side-nav/side-nav.component';
import { BoxSideNavWrapperComponent } from './components/atoms/box-side-nav-wrapper/box-side-nav-wrapper.component';
//import { ErrorMessageComponent } from './components/atoms/error-message/error-message.component';
import { TabComponent } from './components/atoms/tab/tab.component';
import { TabContainerComponent } from './components/atoms/tab-container/tab-container.component';
import { PaginationComponent } from './components/atoms/pagination/pagination.component';
import { OnCreateDirective } from './directives/OnCreate/on-create.directive';
import { BannersComponent } from './components/elements/banners/banners.component';
import { EventCompetitionComponent } from './components/webpages/event-competition/event-competition.component';
import { TableComponent } from './components/atoms/table/table.component';

// Material
import { MatIconRegistry, MatIconModule } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { MatchPlanningComponent } from './components/webpages/scouting/match-planning/match-planning.component';
import { SubNavigationComponent } from './components/atoms/sub-navigation/sub-navigation.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ProfileComponent } from './components/webpages/user/profile/profile.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { TeamApplicationComponent } from './components/webpages/join/team-application/team-application.component';
import { SponsorShopComponent } from './components/webpages/sponsoring/sponsor-shop/sponsor-shop.component';
import { MainViewComponent } from './components/atoms/main-view/main-view.component';
import { QuestionDisplayFormComponent } from './components/elements/question-display-form/question-display-form.component';
import { ScoutPicDisplayComponent } from './components/elements/scout-pic-display/scout-pic-display.component';
import { QuestionConditionAdminFormComponent } from './components/elements/question-condition-admin-form/question-condition-admin-form.component';
import { QuestionFormElementComponent } from './components/elements/question-form-element/question-form-element.component';
import { PitResultDisplayComponent } from './components/elements/pit-result-display/pit-result-display.component';
import { AdminUsersComponent } from './components/webpages/admin/admin-users/admin-users.component';
import { SecurityComponent } from './components/webpages/admin/security/security.component';
import { TeamApplicationFormComponent } from './components/webpages/admin/team-application-form/team-application-form.component';
import { TeamContactFormComponent } from './components/webpages/admin/team-contact-form/team-contact-form.component';
import { PhoneTypesComponent } from './components/webpages/admin/phone-types/phone-types.component';
import { ErrorLogComponent } from './components/webpages/admin/error-log/error-log.component';
import { RequestedItemsComponent } from './components/webpages/admin/requested-items/requested-items.component';
import { FormManagerComponent } from './components/elements/form-manager/form-manager.component';
import { ScoutingUsersComponent } from './components/webpages/scouting/scouting-admin/scouting-users/scouting-users.component';
import { ScoutingScheduleComponent } from './components/webpages/scouting/scouting-admin/scouting-schedule/scouting-schedule.component';
import { ManageSeasonComponent } from './components/webpages/scouting/scouting-admin/manage-season/manage-season.component';
import { ScoutingActivityComponent } from './components/webpages/scouting/scouting-admin/scouting-activity/scouting-activity.component';
import { ManageFieldQuestionsComponent } from './components/webpages/scouting/scouting-admin/manage-field-questions/manage-field-questions.component';
import { ManageFieldQuestionAggregatesComponent } from './components/webpages/scouting/scouting-admin/manage-field-question-aggregates/manage-field-question-aggregates.component';
import { ManageFieldQuestionConditionsComponent } from './components/webpages/scouting/scouting-admin/manage-field-question-conditions/manage-field-question-conditions.component';
import { ManagePitQuestionsComponent } from './components/webpages/scouting/scouting-admin/manage-pit-questions/manage-pit-questions.component';
import { ManagePitQuestionConditionsComponent } from './components/webpages/scouting/scouting-admin/manage-pit-question-conditions/manage-pit-question-conditions.component';
import { ManageFieldResponsesComponent } from './components/webpages/scouting/scouting-admin/manage-field-responses/manage-field-responses.component';
import { ManagePitResponsesComponent } from './components/webpages/scouting/scouting-admin/manage-pit-responses/manage-pit-responses.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavigationComponent,
    LoginComponent,
    LoadingComponent,
    BoxComponent,
    FieldScoutingComponent,
    ButtonComponent,
    ButtonRibbonComponent,
    FormElementComponent,
    FormElementGroupComponent,
    ScoutingAdminComponent,
    HeaderComponent,
    ModalComponent,
    TableComponent,
    ObjectWildCardFilterPipe,
    OrderBy,
    RemovedFilterPipe,
    StrToTypePipe,
    DateToStrPipe,
    QuestionAdminFormComponent,
    FormComponent,
    SideNavComponent,
    BoxSideNavWrapperComponent,
    TabComponent,
    TabContainerComponent,
    PitScoutingComponent,
    FieldScoutingResponsesComponent,
    ScoutPitResponsesComponent,
    ClickOutsideDirective,
    ClickInsideDirective,
    ScoutingPortalComponent,
    ContactComponent,
    JoinComponent,
    CommunityOutreachComponent,
    ElectricalComponent,
    MechanicalComponent,
    ProgrammingComponent,
    SponsoringComponent,
    AboutComponent,
    MediaComponent,
    BuildSeasonComponent,
    CompetitionComponent,
    WallpapersComponent,
    MediaCommunityOutreachComponent,
    ResourcesComponent,
    FirstComponent,
    PaginationComponent,
    OnCreateDirective,
    BannersComponent,
    EventCompetitionComponent,
    MatchPlanningComponent,
    SubNavigationComponent,
    ProfileComponent,
    TeamApplicationComponent,
    SponsorShopComponent,
    MainViewComponent,
    QuestionDisplayFormComponent,
    ScoutPicDisplayComponent,
    QuestionConditionAdminFormComponent,
    QuestionFormElementComponent,
    PitResultDisplayComponent,
    AdminUsersComponent,
    SecurityComponent,
    TeamApplicationFormComponent,
    TeamContactFormComponent,
    PhoneTypesComponent,
    ErrorLogComponent,
    RequestedItemsComponent,
    FormManagerComponent,
    ScoutingUsersComponent,
    ScoutingScheduleComponent,
    ManageSeasonComponent,
    ScoutingActivityComponent,
    ManageFieldQuestionsComponent,
    ManageFieldQuestionAggregatesComponent,
    ManageFieldQuestionConditionsComponent,
    ManagePitQuestionsComponent,
    ManagePitQuestionConditionsComponent,
    ManageFieldResponsesComponent,
    ManagePitResponsesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatIconModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    NgxMatNativeDateModule,
    NgxMatMomentModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatMomentDateModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    ImageCropperModule
  ],
  providers: [
    /*{
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AuthService]
    },*/
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HTTPInterceptor,
      multi: true
    },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));
  }
}
