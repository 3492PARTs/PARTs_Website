import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './helpers/auth.gaurd';

import { HomeComponent } from './components/webpages/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ScoutFieldComponent } from './components/webpages/scouting/scout-field/scout-field.component';
import { ScoutAdminComponent } from './components/webpages/scouting/scout-admin/scout-admin.component';
import { ScoutPitComponent } from './components/webpages/scouting/scout-pit/scout-pit.component';
import { ScoutFieldResultsComponent } from './components/webpages/scouting/scout-field-results/scout-field-results.component';
import { ScoutPitResultsComponent } from './components/webpages/scouting/scout-pit-results/scout-pit-results.component';
import { ScoutPortalComponent } from './components/webpages/scouting/scout-portal/scout-portal.component';
import { ContactComponent } from './components/webpages/contact/contact.component';
import { JoinComponent } from './components/webpages/join/join.component';
import { CommunityOutreachComponent } from './components/webpages/join/community-outreach/community-outreach.component';
import { ProgrammingComponent } from './components/webpages/join/programming/programming.component';
import { MechanicalComponent } from './components/webpages/join/mechanical/mechanical.component';
import { ElectricalComponent } from './components/webpages/join/electrical/electrical.component';
import { SponsoringComponent } from './components/webpages/sponsoring/sponsoring.component';
import { AboutComponent } from './components/webpages/about/about.component';
import { MediaComponent } from './components/webpages/media/media.component';
import { BuildSeasonComponent } from './components/webpages/media/build-season/build-season.component';
import { MediaCommunityOutreachComponent } from './components/webpages/media/community-outreach/community-outreach.component';
import { EventCompetitionComponent } from './components/webpages/event-competition/event-competition.component';
import { WallpapersComponent } from './components/webpages/media/wallpapers/wallpapers.component';
import { ResourcesComponent } from './components/webpages/resources/resources.component';
import { FirstComponent } from './components/webpages/first/first.component';
import { AdminComponent } from './components/webpages/admin/admin.component';
import { CompetitionComponent } from './components/webpages/media/competition/competition.component';
import { MatchPlanningComponent } from './components/webpages/scouting/match-planning/match-planning.component';
import { ProfileComponent } from './components/webpages/user/profile/profile.component';




const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'scout/scout-field', component: ScoutFieldComponent, canActivate: [AuthGuard] },
  { path: 'scout/scout-pit', component: ScoutPitComponent, canActivate: [AuthGuard] },
  { path: 'scout/scout-admin', component: ScoutAdminComponent, canActivate: [AuthGuard] },
  { path: 'scout/scout-field-results', component: ScoutFieldResultsComponent, canActivate: [AuthGuard] },
  { path: 'scout/scout-pit-results', component: ScoutPitResultsComponent, canActivate: [AuthGuard] },
  { path: 'scout/scout-portal', component: ScoutPortalComponent, canActivate: [AuthGuard] },
  { path: 'scout/match-planning', component: MatchPlanningComponent, canActivate: [AuthGuard] },
  { path: 'contact', component: ContactComponent },
  { path: 'join', component: JoinComponent },
  { path: 'join/community-outreach', component: CommunityOutreachComponent },
  { path: 'join/programming', component: ProgrammingComponent },
  { path: 'join/mechanical', component: MechanicalComponent },
  { path: 'join/electrical', component: ElectricalComponent },
  { path: 'sponsor', component: SponsoringComponent },
  { path: 'about', component: AboutComponent },
  { path: 'media', component: MediaComponent },
  { path: 'media/build-season', component: BuildSeasonComponent },
  { path: 'media/community-outreach', component: MediaCommunityOutreachComponent },
  { path: 'media/competition', component: CompetitionComponent },
  { path: 'media/wallpapers', component: WallpapersComponent },
  { path: 'resources', component: ResourcesComponent },
  { path: 'first', component: FirstComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: 'competition', component: EventCompetitionComponent },
  { path: 'user/profile', component: ProfileComponent, canActivate: [AuthGuard] },
  // otherwise redirect to home
  //{ path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
