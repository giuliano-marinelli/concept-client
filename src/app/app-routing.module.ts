// sort-imports-ignore
//angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//services
import { AuthLoginGuard } from './shared/guards/auth-login.guard';
import { AuthAdminGuard } from './shared/guards/auth-admin.guard';
import { LeaveGuard } from './shared/guards/leave.guard';
//components
import { NotFoundComponent } from './not-found/not-found.component';
import { AboutComponent } from './about/about.component';
import { SettingsComponent } from './settings/settings.component';
import { SettingsProfileComponent } from './settings/profile/settings-profile.component';
import { SettingsAccountComponent } from './settings/account/settings-account.component';
import { SettingsEmailsComponent } from './settings/emails/settings-emails.component';
import { SettingsSecurityComponent } from './settings/security/settings-security.component';
import { SettingsDevicesComponent } from './settings/devices/settings-devices.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileOverviewComponent } from './profile/overview/profile-overview.component';
import { ProfileLanguagesComponent } from './profile/languages/profile-languages.component';
import { ProfileModelsComponent } from './profile/models/profile-models.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { AdminComponent } from './admin/admin.component';
import { AdminUsersComponent } from './admin/users/admin-users.component';
import { ModelsComponent } from './models/models.component';
import { LanguagesComponent } from './languages/languages.component';
import { LanguageComponent } from './languages/language/language.component';

const routes: Routes = [
  { path: '', component: AboutComponent, data: { title: 'Welcome', breadcrumb: 'Home' } },
  {
    path: 'user/:username',
    component: ProfileComponent,
    data: {
      title: (params: { [key: string]: string }) => {
        if (!params['username']) return '...';
        return params['username'] + (params['profilename'] ? ' · ' + params['profilename'] : '');
      },
      breadcrumb: (params: { [key: string]: string }) => {
        if (!params['username']) return '...';
        return params['username'];
      }
    },
    children: [
      {
        path: 'overview',
        component: ProfileOverviewComponent
      },
      {
        path: 'languages',
        component: ProfileLanguagesComponent,
        data: { title: 'Languages' }
      },
      {
        path: 'models',
        component: ProfileModelsComponent,
        data: { title: 'Models' }
      },
      { path: '**', redirectTo: 'overview' }
    ]
  },
  { path: 'login', component: LoginComponent, data: { title: 'Sign in' } },
  { path: 'register', component: RegisterComponent, data: { title: 'Sign up' }, canDeactivate: [LeaveGuard] },
  {
    path: 'password-reset',
    component: PasswordResetComponent,
    data: { title: 'Forgot your password?' }
  },
  {
    path: 'password-reset/:code',
    component: PasswordResetComponent,
    data: { title: 'Reset your password' }
  },
  {
    path: 'settings',
    component: SettingsComponent,
    data: { title: 'Settings', breadcrumb: 'Settings' },
    canActivate: [AuthLoginGuard],
    children: [
      {
        path: 'profile',
        component: SettingsProfileComponent,
        data: { title: 'Profile' },
        canDeactivate: [LeaveGuard]
      },
      {
        path: 'account',
        component: SettingsAccountComponent,
        data: { title: 'Account' },
        canDeactivate: [LeaveGuard]
      },
      {
        path: 'emails',
        component: SettingsEmailsComponent,
        data: { title: 'Emails' },
        canDeactivate: [LeaveGuard]
      },
      {
        path: 'security',
        component: SettingsSecurityComponent,
        data: { title: 'Passwords' },
        canDeactivate: [LeaveGuard]
      },
      { path: 'devices', component: SettingsDevicesComponent, data: { title: 'Devices' } },
      { path: '**', redirectTo: 'profile' }
    ]
  },
  {
    path: 'admin',
    component: AdminComponent,
    data: { title: 'Admin', breadcrumb: 'Admin' },
    canActivate: [AuthAdminGuard],
    children: [
      { path: 'users', component: AdminUsersComponent, data: { title: 'Users' }, canDeactivate: [LeaveGuard] },
      { path: '**', redirectTo: 'users' }
    ]
  },
  // { path: 'graphql' },
  { path: 'languages', component: LanguagesComponent, data: { title: 'Languages', breadcrumb: 'Languages' } },
  {
    path: 'language/:language',
    component: LanguageComponent,
    data: {
      title: (params: { [key: string]: string }) => {
        if (!params['languagetag']) return '...';
        return params['languagetag'] + '@' + params['languageversion'] + ' · ' + params['languagename'];
      },
      breadcrumb: (params: { [key: string]: string }) => {
        if (!params['languagetag']) return '...';
        return params['languagetag'] + '@' + params['languageversion'];
      }
    }
  },
  {
    path: 'models',
    component: ModelsComponent,
    data: { title: 'Models', breadcrumb: 'Models' }
    // children: [{ path: 'editor', component: ModelEditorComponent, data: { title: 'Models > Editor' } }]
  },
  { path: 'notfound', component: NotFoundComponent, data: { title: 'Page not found' } },
  { path: '**', redirectTo: '/notfound' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: false, anchorScrolling: 'enabled', scrollPositionRestoration: 'top' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
