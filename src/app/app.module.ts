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
import { LoginComponent } from './components/login/login.component';
import { LoadingComponent } from './components/atoms/loading/loading.component';
import { ScoutFieldComponent } from './components/webpages/scouting/scout-field/scout-field.component';
import { ScoutPitComponent } from './components/webpages/scouting/scout-pit/scout-pit.component';
import { BoxComponent } from './components/atoms/box/box.component';
import { ButtonComponent } from './components/atoms/button/button.component';
import { ButtonRibbonComponent } from './components/atoms/button-ribbon/button-ribbon.component';
import { FormElementComponent } from './components/atoms/form-element/form-element.component';
import { FormElementGroupComponent } from './components/atoms/form-element-group/form-element-group.component';
import { ScoutAdminComponent } from './components/webpages/scouting/scout-admin/scout-admin.component';
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
import { QuestionAdminFormComponent } from './components/webpages/scouting/question-admin-form/question-admin-form.component';
import { ScoutFieldResultsComponent } from './components/webpages/scouting/scout-field-results/scout-field-results.component';
import { ScoutPitResultsComponent } from './components/webpages/scouting/scout-pit-results/scout-pit-results.component';

import { ClickOutsideDirective } from './directives/click-outside/click-outside.directive';
import { ClickInsideDirective } from './directives/click-inside/click-inside.directive';
import { ScoutPortalComponent } from './components/webpages/scouting/scout-portal/scout-portal.component';
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
import { CardComponent } from './components/atoms/card/card.component';
//import { ErrorMessageComponent } from './components/atoms/error-message/error-message.component';
import { TabComponent } from './components/atoms/tab/tab.component';
import { TabContainerComponent } from './components/atoms/tab-container/tab-container.component';
import { AdminComponent } from './components/webpages/admin/admin.component';
import { PaginationComponent } from './components/atoms/pagination/pagination.component';
import { OnCreateDirective } from './directives/OnCreate/on-create.directive';
import { BannersComponent } from './components/atoms/banners/banners.component';
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

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavigationComponent,
    //FooterComponent,
    LoginComponent,
    LoadingComponent,
    BoxComponent,
    ScoutFieldComponent,
    ButtonComponent,
    ButtonRibbonComponent,
    FormElementComponent,
    FormElementGroupComponent,
    ScoutAdminComponent,
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
    CardComponent,
    //ErrorMessageComponent,
    TabComponent,
    TabContainerComponent,
    ScoutPitComponent,
    ScoutFieldResultsComponent,
    ScoutPitResultsComponent,
    ClickOutsideDirective,
    ClickInsideDirective,
    ScoutPortalComponent,
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
    AdminComponent,
    PaginationComponent,
    OnCreateDirective,
    BannersComponent,
    EventCompetitionComponent,
    MatchPlanningComponent,
    SubNavigationComponent,
    ProfileComponent
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
