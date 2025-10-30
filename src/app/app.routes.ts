import { Routes } from '@angular/router';
import { HomeComponent } from './public/components/home/home.component';
import { AboutComponent } from './public/components/about/about.component';
import { ContactComponent } from './public/components/contact/contact.component';
import { EventCompetitionComponent } from './public/components/event-competition/event-competition.component'; // Public
import { FirstComponent } from './public/components/first/first.component';
import { ElectricalComponent } from './recruitment/components/join/electrical/electrical.component';
import { ImpactComponent } from './recruitment/components/join/impact/impact.component';
import { JoinComponent } from './recruitment/components/join/join.component';
import { MechanicalComponent } from './recruitment/components/join/mechanical/mechanical.component';
import { ProgrammingComponent } from './recruitment/components/join/programming/programming.component';
import { TeamApplicationComponent } from './recruitment/components/join/team-application/team-application.component';
import { LoginComponent } from './auth/components/login/login.component';
import { BuildSeasonComponent } from './media/components/media/build-season/build-season.component';
import { MediaCommunityOutreachComponent } from './media/components/media/community-outreach/community-outreach.component';
import { CompetitionComponent } from './media/components/media/competition/competition.component';
import { MediaComponent } from './media/components/media/media.component';
import { WallpapersComponent } from './media/components/media/wallpapers/wallpapers.component';
import { ResourcesComponent } from './public/components/resources/resources.component';
import { SponsorShopComponent } from './sponsoring/components/sponsoring/sponsor-shop/sponsor-shop.component';
import { SponsoringComponent } from './sponsoring/components/sponsoring/sponsoring.component';
import { authGuard } from './auth/helpers/auth.guard';
import { CalendarComponent } from './calendar/components/calendar/calendar.component';

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
                loadComponent: () => import('./scouting/components/scouting/field-scouting/field-scouting.component').then(mod => mod.FieldScoutingComponent),
            },
            {
                path: 'pit',
                title: 'Pit Scouting',
                loadComponent: () => import('./scouting/components/scouting/pit-scouting/pit-scouting.component').then(mod => mod.PitScoutingComponent),
            },
            {
                path: 'field-responses',
                title: 'Field Responses',
                loadComponent: () => import('./scouting/components/scouting/field-scouting-responses/field-scouting-responses.component').then(mod => mod.FieldScoutingResponsesComponent),
            },
            {
                path: 'pit-responses',
                title: 'Pit Responses',
                loadComponent: () => import('./scouting/components/scouting/pit-scouting-responses/pit-scouting-responses.component').then(mod => mod.ScoutPitResponsesComponent),
            },
            {
                path: 'portal',
                title: 'Scout Portal',
                loadComponent: () => import('./scouting/components/scouting/scouting-portal/scouting-portal.component').then(mod => mod.ScoutingPortalComponent),
            },
            {
                path: 'strategizing/matches',
                title: 'Matches',
                loadComponent: () => import('./scouting/components/scouting/strategizing/matches/matches.component').then(mod => mod.MatchesComponent),
            },
            {
                path: 'strategizing/team-notes',
                title: 'Team Notes',
                loadComponent: () => import('./scouting/components/scouting/strategizing/team-notes/team-notes.component').then(mod => mod.TeamNotesComponent),
            },
            {
                path: 'strategizing/alliance-selection',
                title: 'Alliance Selection',
                loadComponent: () => import('./scouting/components/scouting/strategizing/alliance-selection/alliance-selection.component').then(mod => mod.AllianceSelectionComponent),
            },
            {
                path: 'strategizing/metrics',
                title: 'Metrics',
                loadComponent: () => import('./scouting/components/scouting/strategizing/metrics/metrics.component').then(mod => mod.MetricsComponent),
            },
            {
                path: 'strategizing/match-planning',
                title: 'Match Planning',
                loadComponent: () => import('./scouting/components/scouting/strategizing/match-planning/match-planning.component').then(mod => mod.MatchPlanningComponent),
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
                loadComponent: () => import('./scouting-admin/components/scouting-admin/scouting-users/scouting-users.component').then(mod => mod.ScoutingUsersComponent),
            },
            {
                path: 'manage-season',
                title: 'Scout Admin Season',
                loadComponent: () => import('./scouting-admin/components/scouting-admin/manage-season/manage-season.component').then(mod => mod.ManageSeasonComponent),
            },
            {
                path: 'schedule',
                title: 'Scout Admin Schedule',
                loadComponent: () => import('./scouting-admin/components/scouting-admin/scouting-schedule/scouting-schedule.component').then(mod => mod.ScoutingScheduleComponent),
            },
            {
                path: 'activity',
                title: 'Scout Admin Activity',
                loadComponent: () => import('./scouting-admin/components/scouting-admin/scouting-activity/scouting-activity.component').then(mod => mod.ScoutingActivityComponent),
            },
            {
                path: 'manage-field-questions',
                title: 'Scout Admin Field Questions',
                loadComponent: () => import('./scouting-admin/components/scouting-admin/manage-field-questions/manage-field-questions.component').then(mod => mod.ManageFieldQuestionsComponent),
            },
            {
                path: 'manage-field-form',
                title: 'Scout Admin Field Form',
                loadComponent: () => import('./scouting-admin/components/scouting-admin/manage-field-form/manage-field-form.component').then(mod => mod.ManageFieldFormComponent),
            },
            {
                path: 'manage-field-question-aggregates',
                title: 'Scout Admin Field Question Aggregates',
                loadComponent: () => import('./scouting-admin/components/scouting-admin/manage-field-question-aggregates/manage-field-question-aggregates.component').then(mod => mod.ManageFieldQuestionAggregatesComponent),
            },
            {
                path: 'manage-field-question-conditions',
                title: 'Scout Admin Field Question Conditions',
                loadComponent: () => import('./scouting-admin/components/scouting-admin/manage-field-question-conditions/manage-field-question-conditions.component').then(mod => mod.ManageFieldQuestionConditionsComponent),
            },
            {
                path: 'manage-field-flows',
                title: 'Scout Admin Field Flows',
                loadComponent: () => import('./scouting-admin/components/scouting-admin/manage-field-flows/manage-field-flows.component').then(mod => mod.ManageFieldFlowsComponent),
            },
            {
                path: 'manage-field-flow-conditions',
                title: 'Scout Admin Field Flow Conditions',
                loadComponent: () => import('./scouting-admin/components/scouting-admin/manage-field-flow-conditions/manage-field-flow-conditions.component').then(mod => mod.ManageFieldFlowConditionsComponent),
            },
            {
                path: 'manage-field-responses',
                title: 'Scout Admin Field Responses',
                loadComponent: () => import('./scouting-admin/components/scouting-admin/manage-field-responses/manage-field-responses.component').then(mod => mod.ManageFieldResponsesComponent),
            },
            {
                path: 'manage-pit-questions',
                title: 'Scout Admin Pit Questions',
                loadComponent: () => import('./scouting-admin/components/scouting-admin/manage-pit-questions/manage-pit-questions.component').then(mod => mod.ManagePitQuestionsComponent),
            },
            {
                path: 'manage-pit-question-conditions',
                title: 'Scout Admin Pit Question Conditions',
                loadComponent: () => import('./scouting-admin/components/scouting-admin/manage-pit-question-conditions/manage-pit-question-conditions.component').then(mod => mod.ManagePitQuestionConditionsComponent),
            },
            {
                path: 'manage-pit-responses',
                title: 'Scout Admin Pit Responses',
                loadComponent: () => import('./scouting-admin/components/scouting-admin/manage-pit-responses/manage-pit-responses.component').then(mod => mod.ManagePitResponsesComponent),
            },
            {
                path: 'graph-admin-form',
                title: 'Scout Admin Graph Admin',
                loadComponent: () => import('./scouting-admin/components/scouting-admin/graph-admin-form/graph-admin-form.component').then(mod => mod.GraphAdminFormComponent),
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
                loadComponent: () => import('./admin/components/admin/admin-users/admin-users.component').then(mod => mod.AdminUsersComponent),
            },
            {
                path: 'meetings',
                title: 'Admin Meetings',
                loadComponent: () => import('./admin/components/admin/meetings/meetings.component').then(mod => mod.MeetingsComponent),
            },
            {
                path: 'error-log',
                title: 'Admin Error Log',
                loadComponent: () => import('./admin/components/admin/error-log/error-log.component').then(mod => mod.ErrorLogComponent),
            },
            {
                path: 'phone-types',
                title: 'Admin Phone Types',
                loadComponent: () => import('./admin/components/admin/phone-types/phone-types.component').then(mod => mod.PhoneTypesComponent),
            },
            {
                path: 'requested-items',
                title: 'Admin Requested Items',
                loadComponent: () => import('./admin/components/admin/requested-items/requested-items.component').then(mod => mod.RequestedItemsComponent),
            },
            {
                path: 'security',
                title: 'Admin Security',
                loadComponent: () => import('./admin/components/admin/security/security.component').then(mod => mod.SecurityComponent),
            },
            {
                path: 'team-application-form',
                title: 'Admin Team Application',
                loadComponent: () => import('./admin/components/admin/team-application-form/team-application-form.component').then(mod => mod.TeamApplicationFormComponent),
            },
            {
                path: 'team-contact-form',
                title: 'Admin Team Contact',
                loadComponent: () => import('./admin/components/admin/team-contact-form/team-contact-form.component').then(mod => mod.TeamContactFormComponent),
            },
        ]
    },

    // User and Attendance Routes
    {
        path: 'user/profile',
        title: 'User Profile',
        loadComponent: () => import('./user/components/user/profile/profile.component').then(mod => mod.ProfileComponent),
        canActivate: [authGuard]
    },
    {
        path: 'attendance',
        title: 'Attendance',
        loadComponent: () => import('./attendance/components/attendance/attendance.component').then(mod => mod.AttendanceComponent),
        canActivate: [authGuard]
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' },
];
