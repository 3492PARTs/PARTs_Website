import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './helpers/auth.gaurd';

import { HomeComponent } from './components/webpages/home/home.component';
import { LoginComponent } from './components/webpages/login/login.component';
import { FieldScoutingComponent } from './components/webpages/scouting/field-scouting/field-scouting.component';
import { PitScoutingComponent } from './components/webpages/scouting/pit-scouting/pit-scouting.component';
import { FieldScoutingResponsesComponent } from './components/webpages/scouting/field-scouting-responses/field-scouting-responses.component';
import { ScoutPitResponsesComponent } from './components/webpages/scouting/pit-scouting-responses/pit-scouting-responses.component';
import { ScoutingPortalComponent } from './components/webpages/scouting/scouting-portal/scouting-portal.component';
import { ContactComponent } from './components/webpages/contact/contact.component';
import { JoinComponent } from './components/webpages/join/join.component';
import { ImpactComponent } from './components/webpages/join/impact/impact.component';
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
import { CompetitionComponent } from './components/webpages/media/competition/competition.component';
import { ProfileComponent } from './components/webpages/user/profile/profile.component';
import { TeamApplicationComponent } from './components/webpages/join/team-application/team-application.component';
import { SponsorShopComponent } from './components/webpages/sponsoring/sponsor-shop/sponsor-shop.component';
import { AdminUsersComponent } from './components/webpages/admin/admin-users/admin-users.component';
import { ErrorLogComponent } from './components/webpages/admin/error-log/error-log.component';
import { PhoneTypesComponent } from './components/webpages/admin/phone-types/phone-types.component';
import { RequestedItemsComponent } from './components/webpages/admin/requested-items/requested-items.component';
import { SecurityComponent } from './components/webpages/admin/security/security.component';
import { TeamContactFormComponent } from './components/webpages/admin/team-contact-form/team-contact-form.component';
import { TeamApplicationFormComponent } from './components/webpages/admin/team-application-form/team-application-form.component';
import { ScoutingUsersComponent } from './components/webpages/scouting/scouting-admin/scouting-users/scouting-users.component';
import { ManageSeasonComponent } from './components/webpages/scouting/scouting-admin/manage-season/manage-season.component';
import { ScoutingScheduleComponent } from './components/webpages/scouting/scouting-admin/scouting-schedule/scouting-schedule.component';
import { ScoutingActivityComponent } from './components/webpages/scouting/scouting-admin/scouting-activity/scouting-activity.component';
import { ManageFieldQuestionsComponent } from './components/webpages/scouting/scouting-admin/manage-field-questions/manage-field-questions.component';
import { ManageFieldQuestionAggregatesComponent } from './components/webpages/scouting/scouting-admin/manage-field-question-aggregates/manage-field-question-aggregates.component';
import { ManageFieldQuestionConditionsComponent } from './components/webpages/scouting/scouting-admin/manage-field-question-conditions/manage-field-question-conditions.component';
import { ManagePitQuestionsComponent } from './components/webpages/scouting/scouting-admin/manage-pit-questions/manage-pit-questions.component';
import { ManagePitQuestionConditionsComponent } from './components/webpages/scouting/scouting-admin/manage-pit-question-conditions/manage-pit-question-conditions.component';
import { ManagePitResponsesComponent } from './components/webpages/scouting/scouting-admin/manage-pit-responses/manage-pit-responses.component';
import { ManageFieldResponsesComponent } from './components/webpages/scouting/scouting-admin/manage-field-responses/manage-field-responses.component';
import { PlanMatchesComponent } from './components/webpages/scouting/match-planning/plan-matches/plan-matches.component';
import { TeamNotesComponent } from './components/webpages/scouting/match-planning/team-notes/team-notes.component';




const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'scouting/field', component: FieldScoutingComponent, canActivate: [AuthGuard] },
  { path: 'scouting/pit', component: PitScoutingComponent, canActivate: [AuthGuard] },
  { path: 'scouting/scouting-admin/scouting-users', component: ScoutingUsersComponent, canActivate: [AuthGuard] },
  { path: 'scouting/scouting-admin/manage-season', component: ManageSeasonComponent, canActivate: [AuthGuard] },
  { path: 'scouting/scouting-admin/schedule', component: ScoutingScheduleComponent, canActivate: [AuthGuard] },
  { path: 'scouting/scouting-admin/activity', component: ScoutingActivityComponent, canActivate: [AuthGuard] },
  { path: 'scouting/scouting-admin/manage-field-questions', component: ManageFieldQuestionsComponent, canActivate: [AuthGuard] },
  { path: 'scouting/scouting-admin/manage-field-question-aggregates', component: ManageFieldQuestionAggregatesComponent, canActivate: [AuthGuard] },
  { path: 'scouting/scouting-admin/manage-field-question-conditions', component: ManageFieldQuestionConditionsComponent, canActivate: [AuthGuard] },
  { path: 'scouting/scouting-admin/manage-field-responses', component: ManageFieldResponsesComponent, canActivate: [AuthGuard] },
  { path: 'scouting/scouting-admin/manage-pit-questions', component: ManagePitQuestionsComponent, canActivate: [AuthGuard] },
  { path: 'scouting/scouting-admin/manage-pit-question-conditions', component: ManagePitQuestionConditionsComponent, canActivate: [AuthGuard] },
  { path: 'scouting/scouting-admin/manage-pit-responses', component: ManagePitResponsesComponent, canActivate: [AuthGuard] },
  { path: 'scouting/field-responses', component: FieldScoutingResponsesComponent, canActivate: [AuthGuard] },
  { path: 'scouting/pit-responses', component: ScoutPitResponsesComponent, canActivate: [AuthGuard] },
  { path: 'scouting/portal', component: ScoutingPortalComponent, canActivate: [AuthGuard] },
  { path: 'scouting/match-planning/plan-matches', component: PlanMatchesComponent, canActivate: [AuthGuard] },
  { path: 'scouting/match-planning/team-notes', component: TeamNotesComponent, canActivate: [AuthGuard] },
  { path: 'contact', component: ContactComponent },
  { path: 'join', component: JoinComponent },
  { path: 'join/impact', component: ImpactComponent },
  { path: 'join/programming', component: ProgrammingComponent },
  { path: 'join/mechanical', component: MechanicalComponent },
  { path: 'join/electrical', component: ElectricalComponent },
  { path: 'join/team-application', component: TeamApplicationComponent },
  { path: 'sponsor', component: SponsoringComponent },
  { path: 'sponsor/shop', component: SponsorShopComponent },
  { path: 'about', component: AboutComponent },
  { path: 'media', component: MediaComponent },
  { path: 'media/build-season', component: BuildSeasonComponent },
  { path: 'media/community-outreach', component: MediaCommunityOutreachComponent },
  { path: 'media/competition', component: CompetitionComponent },
  { path: 'media/wallpapers', component: WallpapersComponent },
  { path: 'resources', component: ResourcesComponent },
  { path: 'first', component: FirstComponent },
  { path: 'admin/admin-users', component: AdminUsersComponent, canActivate: [AuthGuard] },
  { path: 'admin/error-log', component: ErrorLogComponent, canActivate: [AuthGuard] },
  { path: 'admin/phone-types', component: PhoneTypesComponent, canActivate: [AuthGuard] },
  { path: 'admin/requested-items', component: RequestedItemsComponent, canActivate: [AuthGuard] },
  { path: 'admin/security', component: SecurityComponent, canActivate: [AuthGuard] },
  { path: 'admin/team-application-form', component: TeamApplicationFormComponent, canActivate: [AuthGuard] },
  { path: 'admin/team-contact-form', component: TeamContactFormComponent, canActivate: [AuthGuard] },
  { path: 'competition', component: EventCompetitionComponent },
  { path: 'user/profile', component: ProfileComponent, canActivate: [AuthGuard] },
  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
