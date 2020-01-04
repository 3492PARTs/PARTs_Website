import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { HTTPInterceptor } from './providers/http-interceptor';

import { HomeComponent } from './components/webpages/home/home.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './components/login/login.component';
import { LoadingScreenComponent } from './components/loading-screen/loading-screen.component';
import { ScoutFieldComponent } from './components/webpages/scouting/scout-field/scout-field.component';
import { BoxComponent } from './components/atoms/box/box.component';
import { ButtonComponent } from './components/atoms/button/button.component';
import { ButtonRibbonComponent } from './components/atoms/button-ribbon/button-ribbon.component';
import { FormElementComponent } from './components/atoms/form-element/form-element.component';
import { FormElementGroupComponent } from './components/atoms/form-element-group/form-element-group.component';
import { ScoutAdminComponent } from './components/webpages/scouting/scout-admin/scout-admin.component';
import { HeaderComponent } from './components/atoms/header/header.component';
import { ModalComponent } from './components/atoms/modal/modal.component';
import { TableComponent } from './components/atoms/table/table.component';

import {
  ObjectWildCardFilterPipe,
  OrderBy,
  RemovedFilterPipe
} from './pipes/ObjectWildcardFilter';
import { StrToTypePipe } from './pipes/str-to-type.pipe';
import { DateToStrPipe } from './pipes/date-to-str.pipe';
import { QuestionAdminFormComponent } from './components/webpages/scouting/question-admin-form/question-admin-form.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavigationComponent,
    FooterComponent,
    LoginComponent,
    LoadingScreenComponent,
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
    QuestionAdminFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HTTPInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
