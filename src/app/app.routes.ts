import { Routes } from '@angular/router';
import { HomeComponent } from './components/webpages/home/home.component';
import { AboutComponent } from './components/webpages/about/about.component';
import { AdminUsersComponent } from './components/webpages/admin/admin-users/admin-users.component';
import { ErrorLogComponent } from './components/webpages/admin/error-log/error-log.component';
import { PhoneTypesComponent } from './components/webpages/admin/phone-types/phone-types.component';
import { RequestedItemsComponent } from './components/webpages/admin/requested-items/requested-items.component';
import { SecurityComponent } from './components/webpages/admin/security/security.component';
import { TeamApplicationFormComponent } from './components/webpages/admin/team-application-form/team-application-form.component';
import { TeamContactFormComponent } from './components/webpages/admin/team-contact-form/team-contact-form.component';
import { ContactComponent } from './components/webpages/contact/contact.component';
import { EventCompetitionComponent } from './components/webpages/event-competition/event-competition.component';
import { FirstComponent } from './components/webpages/first/first.component';
import { ElectricalComponent } from './components/webpages/join/electrical/electrical.component';
import { ImpactComponent } from './components/webpages/join/impact/impact.component';
import { JoinComponent } from './components/webpages/join/join.component';
import { MechanicalComponent } from './components/webpages/join/mechanical/mechanical.component';
import { ProgrammingComponent } from './components/webpages/join/programming/programming.component';
import { TeamApplicationComponent } from './components/webpages/join/team-application/team-application.component';
import { LoginComponent } from './components/webpages/login/login.component';
import { BuildSeasonComponent } from './components/webpages/media/build-season/build-season.component';
import { MediaCommunityOutreachComponent } from './components/webpages/media/community-outreach/community-outreach.component';
import { CompetitionComponent } from './components/webpages/media/competition/competition.component';
import { MediaComponent } from './components/webpages/media/media.component';
import { WallpapersComponent } from './components/webpages/media/wallpapers/wallpapers.component';
import { ResourcesComponent } from './components/webpages/resources/resources.component';
import { FieldScoutingResponsesComponent } from './components/webpages/scouting/field-scouting-responses/field-scouting-responses.component';
import { FieldScoutingComponent } from './components/webpages/scouting/field-scouting/field-scouting.component';
import { MatchesComponent } from './components/webpages/scouting/strategizing/matches/matches.component';
import { TeamNotesComponent } from './components/webpages/scouting/strategizing/team-notes/team-notes.component';
import { ScoutPitResponsesComponent } from './components/webpages/scouting/pit-scouting-responses/pit-scouting-responses.component';
import { PitScoutingComponent } from './components/webpages/scouting/pit-scouting/pit-scouting.component';
import { ManageFieldQuestionAggregatesComponent } from './components/webpages/scouting/scouting-admin/manage-field-question-aggregates/manage-field-question-aggregates.component';
import { ManageFieldQuestionConditionsComponent } from './components/webpages/scouting/scouting-admin/manage-field-question-conditions/manage-field-question-conditions.component';
import { ManageFieldQuestionsComponent } from './components/webpages/scouting/scouting-admin/manage-field-questions/manage-field-questions.component';
import { ManageFieldResponsesComponent } from './components/webpages/scouting/scouting-admin/manage-field-responses/manage-field-responses.component';
import { ManagePitQuestionConditionsComponent } from './components/webpages/scouting/scouting-admin/manage-pit-question-conditions/manage-pit-question-conditions.component';
import { ManagePitQuestionsComponent } from './components/webpages/scouting/scouting-admin/manage-pit-questions/manage-pit-questions.component';
import { ManagePitResponsesComponent } from './components/webpages/scouting/scouting-admin/manage-pit-responses/manage-pit-responses.component';
import { ManageSeasonComponent } from './components/webpages/scouting/scouting-admin/manage-season/manage-season.component';
import { ScoutingActivityComponent } from './components/webpages/scouting/scouting-admin/scouting-activity/scouting-activity.component';
import { ScoutingScheduleComponent } from './components/webpages/scouting/scouting-admin/scouting-schedule/scouting-schedule.component';
import { ScoutingUsersComponent } from './components/webpages/scouting/scouting-admin/scouting-users/scouting-users.component';
import { ScoutingPortalComponent } from './components/webpages/scouting/scouting-portal/scouting-portal.component';
import { SponsorShopComponent } from './components/webpages/sponsoring/sponsor-shop/sponsor-shop.component';
import { SponsoringComponent } from './components/webpages/sponsoring/sponsoring.component';
import { ProfileComponent } from './components/webpages/user/profile/profile.component';
import { authGuard } from './helpers/auth.guard';
import { CalendarComponent } from './components/webpages/calendar/calendar.component';
import { MetricsComponent } from './components/webpages/scouting/strategizing/metrics/metrics.component';
import { AllianceSelectionComponent } from './components/webpages/scouting/strategizing/alliance-selection/alliance-selection.component';
import { MatchPlanningComponent } from './components/webpages/scouting/strategizing/match-planning/match-planning.component';

export const routes: Routes = [
    { path: '', title: 'Home', component: HomeComponent },
    { path: 'login', title: 'Login', component: LoginComponent },
    { path: 'scouting/field', title: 'Field Scouting', component: FieldScoutingComponent, canActivate: [authGuard] },
    { path: 'scouting/pit', title: 'Pit Scouting', component: PitScoutingComponent, canActivate: [authGuard] },
    { path: 'scouting/scouting-admin/scouting-users', title: 'Scout Admin Users', component: ScoutingUsersComponent, canActivate: [authGuard] },
    { path: 'scouting/scouting-admin/manage-season', title: 'Scout Admin Season', component: ManageSeasonComponent, canActivate: [authGuard] },
    { path: 'scouting/scouting-admin/schedule', title: 'Scout Admin Schedule', component: ScoutingScheduleComponent, canActivate: [authGuard] },
    { path: 'scouting/scouting-admin/activity', title: 'Scout Admin Activity', component: ScoutingActivityComponent, canActivate: [authGuard] },
    { path: 'scouting/scouting-admin/manage-field-questions', title: 'Scout Admin Field Questions', component: ManageFieldQuestionsComponent, canActivate: [authGuard] },
    { path: 'scouting/scouting-admin/manage-field-question-aggregates', title: 'Scout Admin Field Question Aggregates', component: ManageFieldQuestionAggregatesComponent, canActivate: [authGuard] },
    { path: 'scouting/scouting-admin/manage-field-question-conditions', title: 'Scout Admin Field Question Conditions', component: ManageFieldQuestionConditionsComponent, canActivate: [authGuard] },
    { path: 'scouting/scouting-admin/manage-field-responses', title: 'Scout Admin Field Responses', component: ManageFieldResponsesComponent, canActivate: [authGuard] },
    { path: 'scouting/scouting-admin/manage-pit-questions', title: 'Scout Admin Pit Questions', component: ManagePitQuestionsComponent, canActivate: [authGuard] },
    { path: 'scouting/scouting-admin/manage-pit-question-conditions', title: 'Scout Admin Pit Question Conditions', component: ManagePitQuestionConditionsComponent, canActivate: [authGuard] },
    { path: 'scouting/scouting-admin/manage-pit-responses', title: 'Scout Admin Pit Responses', component: ManagePitResponsesComponent, canActivate: [authGuard] },
    { path: 'scouting/field-responses', title: 'Field Responses', component: FieldScoutingResponsesComponent, canActivate: [authGuard] },
    { path: 'scouting/pit-responses', title: 'Pit Responses', component: ScoutPitResponsesComponent, canActivate: [authGuard] },
    { path: 'scouting/portal', title: 'Scout Portal', component: ScoutingPortalComponent, canActivate: [authGuard] },
    { path: 'scouting/strategizing/matches', title: 'Matches', component: MatchesComponent, canActivate: [authGuard] },
    { path: 'scouting/strategizing/team-notes', title: 'Team Notes', component: TeamNotesComponent, canActivate: [authGuard] },
    { path: 'scouting/strategizing/alliance-selection', title: 'Alliance Selection', component: AllianceSelectionComponent, canActivate: [authGuard] },
    { path: 'scouting/strategizing/metrics', title: 'Metrics', component: MetricsComponent, canActivate: [authGuard] },
    { path: 'scouting/strategizing/match-planning', title: 'Match Planning', component: MatchPlanningComponent, canActivate: [authGuard] },
    { path: 'contact', title: 'Contact Us', component: ContactComponent },
    { path: 'calendar', title: 'Calendar', component: CalendarComponent },
    { path: 'join', title: 'Join', component: JoinComponent },
    { path: 'join/impact', title: 'Join Impact', component: ImpactComponent },
    { path: 'join/programming', title: 'Join Programming', component: ProgrammingComponent },
    { path: 'join/mechanical', title: 'Join Mechanical', component: MechanicalComponent },
    { path: 'join/electrical', title: 'Join Electrical', component: ElectricalComponent },
    { path: 'join/team-application', title: 'Team Application', component: TeamApplicationComponent },
    { path: 'sponsor', title: 'Sponsor', component: SponsoringComponent },
    { path: 'sponsor/shop', title: 'Sponsor Shop', component: SponsorShopComponent },
    { path: 'about', title: 'About Us', component: AboutComponent },
    { path: 'media', title: 'Media', component: MediaComponent },
    { path: 'media/build-season', title: 'Media Build Season', component: BuildSeasonComponent },
    { path: 'media/community-outreach', title: 'Media Community Outreach', component: MediaCommunityOutreachComponent },
    { path: 'media/competition', title: 'Media Competition', component: CompetitionComponent },
    { path: 'media/wallpapers', title: 'Media Wallpapers', component: WallpapersComponent },
    { path: 'resources', title: 'Media Resources', component: ResourcesComponent },
    { path: 'first', title: 'FIRST', component: FirstComponent },
    { path: 'admin/admin-users', title: 'Admin Users', component: AdminUsersComponent, canActivate: [authGuard] },
    { path: 'admin/error-log', title: 'Admin Error Log', component: ErrorLogComponent, canActivate: [authGuard] },
    { path: 'admin/phone-types', title: 'Admin Phone Types', component: PhoneTypesComponent, canActivate: [authGuard] },
    { path: 'admin/requested-items', title: 'Admin Requested Items', component: RequestedItemsComponent, canActivate: [authGuard] },
    { path: 'admin/security', title: 'Admin Security', component: SecurityComponent, canActivate: [authGuard] },
    { path: 'admin/team-application-form', title: 'Admin Team Application', component: TeamApplicationFormComponent, canActivate: [authGuard] },
    { path: 'admin/team-contact-form', title: 'Admin Team Contact', component: TeamContactFormComponent, canActivate: [authGuard] },
    { path: 'competition', title: 'Competition', component: EventCompetitionComponent },
    { path: 'user/profile', title: 'User Profile', component: ProfileComponent, canActivate: [authGuard] },
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];
