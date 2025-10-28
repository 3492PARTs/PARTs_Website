import { Routes } from '@angular/router';
import { HomeComponent } from './components/webpages/home/home.component';
import { AboutComponent } from './components/webpages/about/about.component';
import { ContactComponent } from './components/webpages/contact/contact.component';
import { EventCompetitionComponent } from './components/webpages/event-competition/event-competition.component'; // Public
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
import { SponsorShopComponent } from './components/webpages/sponsoring/sponsor-shop/sponsor-shop.component';
import { SponsoringComponent } from './components/webpages/sponsoring/sponsoring.component';
import { authGuard } from './helpers/auth.guard';
import { CalendarComponent } from './components/webpages/calendar/calendar.component';

export const routes: Routes = [
    // public endpoints (keep as is)
    { path: '', title: 'Home', component: HomeComponent },
    { path: 'login', title: 'Login', component: LoginComponent },
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
    { path: 'resources', title: 'Resources', component: ResourcesComponent },
    { path: 'first', title: 'FIRST', component: FirstComponent },
    { path: 'competition', title: 'Competition', component: EventCompetitionComponent }, // Moved to public section

    // authenticated endpoints, lazy loaded and served on request

    // Core Scouting Routes (scouting-bundle)
    {
        path: 'scouting',
        canActivate: [authGuard],
        children: [
            {
                path: 'field',
                title: 'Field Scouting',
                loadComponent: () => import('./components/webpages/scouting/field-scouting/field-scouting.component').then(mod => mod.FieldScoutingComponent),
            },
            {
                path: 'pit',
                title: 'Pit Scouting',
                loadComponent: () => import('./components/webpages/scouting/pit-scouting/pit-scouting.component').then(mod => mod.PitScoutingComponent),
            },
            {
                path: 'field-responses',
                title: 'Field Responses',
                loadComponent: () => import('./components/webpages/scouting/field-scouting-responses/field-scouting-responses.component').then(mod => mod.FieldScoutingResponsesComponent),
            },
            {
                path: 'pit-responses',
                title: 'Pit Responses',
                loadComponent: () => import('./components/webpages/scouting/pit-scouting-responses/pit-scouting-responses.component').then(mod => mod.ScoutPitResponsesComponent),
            },
            {
                path: 'portal',
                title: 'Scout Portal',
                loadComponent: () => import('./components/webpages/scouting/scouting-portal/scouting-portal.component').then(mod => mod.ScoutingPortalComponent),
            },
            {
                path: 'strategizing/matches',
                title: 'Matches',
                loadComponent: () => import('./components/webpages/scouting/strategizing/matches/matches.component').then(mod => mod.MatchesComponent),
            },
            {
                path: 'strategizing/team-notes',
                title: 'Team Notes',
                loadComponent: () => import('./components/webpages/scouting/strategizing/team-notes/team-notes.component').then(mod => mod.TeamNotesComponent),
            },
            {
                path: 'strategizing/alliance-selection',
                title: 'Alliance Selection',
                loadComponent: () => import('./components/webpages/scouting/strategizing/alliance-selection/alliance-selection.component').then(mod => mod.AllianceSelectionComponent),
            },
            {
                path: 'strategizing/metrics',
                title: 'Metrics',
                loadComponent: () => import('./components/webpages/scouting/strategizing/metrics/metrics.component').then(mod => mod.MetricsComponent),
            },
            {
                path: 'strategizing/match-planning',
                title: 'Match Planning',
                loadComponent: () => import('./components/webpages/scouting/strategizing/match-planning/match-planning.component').then(mod => mod.MatchPlanningComponent),
            },
        ]
    },

    // Scouting Admin Routes (scouting-admin-bundle)
    {
        path: 'scouting-admin',
        canActivate: [authGuard],
        children: [
            {
                path: 'scouting-users',
                title: 'Scout Admin Users',
                loadComponent: () => import('./components/webpages/scouting/scouting-admin/scouting-users/scouting-users.component').then(mod => mod.ScoutingUsersComponent),
            },
            {
                path: 'manage-season',
                title: 'Scout Admin Season',
                loadComponent: () => import('./components/webpages/scouting/scouting-admin/manage-season/manage-season.component').then(mod => mod.ManageSeasonComponent),
            },
            {
                path: 'schedule',
                title: 'Scout Admin Schedule',
                loadComponent: () => import('./components/webpages/scouting/scouting-admin/scouting-schedule/scouting-schedule.component').then(mod => mod.ScoutingScheduleComponent),
            },
            {
                path: 'activity',
                title: 'Scout Admin Activity',
                loadComponent: () => import('./components/webpages/scouting/scouting-admin/scouting-activity/scouting-activity.component').then(mod => mod.ScoutingActivityComponent),
            },
            {
                path: 'manage-field-questions',
                title: 'Scout Admin Field Questions',
                loadComponent: () => import('./components/webpages/scouting/scouting-admin/manage-field-questions/manage-field-questions.component').then(mod => mod.ManageFieldQuestionsComponent),
            },
            {
                path: 'manage-field-form',
                title: 'Scout Admin Field Form',
                loadComponent: () => import('./components/webpages/scouting/scouting-admin/manage-field-form/manage-field-form.component').then(mod => mod.ManageFieldFormComponent),
            },
            {
                path: 'manage-field-question-aggregates',
                title: 'Scout Admin Field Question Aggregates',
                loadComponent: () => import('./components/webpages/scouting/scouting-admin/manage-field-question-aggregates/manage-field-question-aggregates.component').then(mod => mod.ManageFieldQuestionAggregatesComponent),
            },
            {
                path: 'manage-field-question-conditions',
                title: 'Scout Admin Field Question Conditions',
                loadComponent: () => import('./components/webpages/scouting/scouting-admin/manage-field-question-conditions/manage-field-question-conditions.component').then(mod => mod.ManageFieldQuestionConditionsComponent),
            },
            {
                path: 'manage-field-flows',
                title: 'Scout Admin Field Flows',
                loadComponent: () => import('./components/webpages/scouting/scouting-admin/manage-field-flows/manage-field-flows.component').then(mod => mod.ManageFieldFlowsComponent),
            },
            {
                path: 'manage-field-flow-conditions',
                title: 'Scout Admin Field Flow Conditions',
                loadComponent: () => import('./components/webpages/scouting/scouting-admin/manage-field-flow-conditions/manage-field-flow-conditions.component').then(mod => mod.ManageFieldFlowConditionsComponent),
            },
            {
                path: 'manage-field-responses',
                title: 'Scout Admin Field Responses',
                loadComponent: () => import('./components/webpages/scouting/scouting-admin/manage-field-responses/manage-field-responses.component').then(mod => mod.ManageFieldResponsesComponent),
            },
            {
                path: 'manage-pit-questions',
                title: 'Scout Admin Pit Questions',
                loadComponent: () => import('./components/webpages/scouting/scouting-admin/manage-pit-questions/manage-pit-questions.component').then(mod => mod.ManagePitQuestionsComponent),
            },
            {
                path: 'manage-pit-question-conditions',
                title: 'Scout Admin Pit Question Conditions',
                loadComponent: () => import('./components/webpages/scouting/scouting-admin/manage-pit-question-conditions/manage-pit-question-conditions.component').then(mod => mod.ManagePitQuestionConditionsComponent),
            },
            {
                path: 'manage-pit-responses',
                title: 'Scout Admin Pit Responses',
                loadComponent: () => import('./components/webpages/scouting/scouting-admin/manage-pit-responses/manage-pit-responses.component').then(mod => mod.ManagePitResponsesComponent),
            },
            {
                path: 'graph-admin-form',
                title: 'Scout Admin Graph Admin',
                loadComponent: () => import('./components/webpages/scouting/scouting-admin/graph-admin-form/graph-admin-form.component').then(mod => mod.GraphAdminFormComponent),
            },
        ]
    },

    // Admin Routes (admin-bundle)
    {
        path: 'admin', // Parent route for admin section
        canActivate: [authGuard],
        children: [
            {
                path: 'admin-users',
                title: 'Admin Users',
                loadComponent: () => import('./components/webpages/admin/admin-users/admin-users.component').then(mod => mod.AdminUsersComponent),
            },
            {
                path: 'meetings',
                title: 'Admin Meetings',
                loadComponent: () => import('./components/webpages/admin/meetings/meetings.component').then(mod => mod.MeetingsComponent),
            },
            {
                path: 'error-log',
                title: 'Admin Error Log',
                loadComponent: () => import('./components/webpages/admin/error-log/error-log.component').then(mod => mod.ErrorLogComponent),
            },
            {
                path: 'phone-types',
                title: 'Admin Phone Types',
                loadComponent: () => import('./components/webpages/admin/phone-types/phone-types.component').then(mod => mod.PhoneTypesComponent),
            },
            {
                path: 'requested-items',
                title: 'Admin Requested Items',
                loadComponent: () => import('./components/webpages/admin/requested-items/requested-items.component').then(mod => mod.RequestedItemsComponent),
            },
            {
                path: 'security',
                title: 'Admin Security',
                loadComponent: () => import('./components/webpages/admin/security/security.component').then(mod => mod.SecurityComponent),
            },
            {
                path: 'team-application-form',
                title: 'Admin Team Application',
                loadComponent: () => import('./components/webpages/admin/team-application-form/team-application-form.component').then(mod => mod.TeamApplicationFormComponent),
            },
            {
                path: 'team-contact-form',
                title: 'Admin Team Contact',
                loadComponent: () => import('./components/webpages/admin/team-contact-form/team-contact-form.component').then(mod => mod.TeamContactFormComponent),
            },
        ]
    },

    // User and Attendance Routes
    {
        path: 'user/profile',
        title: 'User Profile',
        loadComponent: () => import('./components/webpages/user/profile/profile.component').then(mod => mod.ProfileComponent),
        canActivate: [authGuard]
    },
    {
        path: 'attendance',
        title: 'Attendance',
        loadComponent: () => import('./components/webpages/attendance/attendance.component').then(mod => mod.AttendanceComponent),
        canActivate: [authGuard]
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' },
];
