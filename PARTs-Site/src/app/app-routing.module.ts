import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/webpages/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ScoutFieldComponent } from './components/webpages/scouting/scout-field/scout-field.component';
import { ScoutAdminComponent } from './components/webpages/scouting/scout-admin/scout-admin.component';
import { ScoutPitComponent } from './components/webpages/scouting/scout-pit/scout-pit.component';
import { ScoutFieldResultsComponent } from './components/webpages/scouting/scout-field-results/scout-field-results.component';




const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'scout-field', component: ScoutFieldComponent },
  { path: 'scout-pit', component: ScoutPitComponent },
  { path: 'scout-admin', component: ScoutAdminComponent },
  { path: 'scout-field-results', component: ScoutFieldResultsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
