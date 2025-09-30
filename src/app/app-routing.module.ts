// sort-imports-ignore
//angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//guards
import { AuthLoginGuard } from './shared/guards/auth-login.guard';
import { AuthAdminGuard } from './shared/guards/auth-admin.guard';
import { LeaveGuard } from './shared/guards/leave.guard';
import { UserExistsGuard } from './shared/guards/user-exists.guard';
import { MetaModelExistsGuard } from './shared/guards/meta-model-exists.guard';
import { ModelExistsGuard } from './shared/guards/model-exists.guard';
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
import { LanguagesComponent } from './languages/languages.component';
import { LanguageComponent } from './languages/language/language.component';
import { LanguageDesignComponent } from './languages/language/design/language-design.component';
import { LanguageVersionsComponent } from './languages/language/versions/language-versions.component';
import { LanguageSettingsComponent } from './languages/language/settings/language-settings.component';
import { LanguageSettingsGeneralComponent } from './languages/language/settings/general/language-settings-general.component';
import { ModelsComponent } from './models/models.component';
import { ModelComponent } from './models/model/model.component';

const loading: string = '⟳';

const routes: Routes = [
  { path: '', component: AboutComponent, data: { title: 'Welcome', breadcrumb: 'Home' } },
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
        data: { title: 'Account' }
        // canDeactivate: [LeaveGuard]
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
    path: 'models',
    component: ModelsComponent,
    data: { title: 'Models', breadcrumb: 'Models' }
    // children: [{ path: 'editor', component: ModelEditorComponent, data: { title: 'Models > Editor' } }]
  },
  {
    path: ':username/lang/:language/new',
    component: ModelComponent,
    canActivate: [AuthLoginGuard],
    canDeactivate: [LeaveGuard],
    data: {
      title: (params: { [key: string]: string }) => {
        if (!params['languagetag']) return loading;
        return 'New Model · ' + params['username'] + '/' + params['languagetag'] + '@' + params['languageversion'];
      },
      breadcrumb: (params: { [key: string]: string }) => {
        if (!params['username'] || !params['languagetag'] || !params['languageversion']) return loading;
        return [
          { path: params['username'] + '/languages', title: params['username'] },
          {
            path: params['username'] + '/lang/' + params['languagetag'] + '@' + params['languageversion'],
            title: params['languagetag'] + '@' + params['languageversion']
          },
          { title: 'new-model' }
        ];
      }
    }
  },
  {
    path: ':username/lang/:language',
    component: LanguageComponent,
    canMatch: [MetaModelExistsGuard],
    data: {
      title: (params: { [key: string]: string }) => {
        if (!params['languagetag']) return loading;
        return (
          params['username'] +
          '/' +
          params['languagetag'] +
          '@' +
          params['languageversion'] +
          ' · ' +
          params['languagename']
        );
      },
      breadcrumb: (params: { [key: string]: string }) => {
        if (!params['username'] || !params['languagetag'] || !params['languageversion']) return loading;
        return [
          { path: params['username'] + '/languages', title: params['username'] },
          { title: params['languagetag'] + '@' + params['languageversion'] }
        ];
      }
    },
    children: [
      { path: 'design', component: LanguageDesignComponent },
      { path: 'versions', component: LanguageVersionsComponent, data: { title: 'Versions' } },
      {
        path: 'settings',
        component: LanguageSettingsComponent,
        data: { title: 'Settings' },
        children: [
          { path: 'general', component: LanguageSettingsGeneralComponent },
          { path: '**', redirectTo: 'general' }
        ]
      },
      { path: '**', redirectTo: 'design' }
    ]
  },
  {
    path: ':username/model/:model',
    component: ModelComponent,
    canMatch: [ModelExistsGuard],
    canDeactivate: [LeaveGuard],
    data: {
      title: (params: { [key: string]: string }) => {
        if (!params['modeltag']) return loading;
        return params['modeltag'] + '@' + params['modelversion'] + ' · ' + params['languagename'];
      },
      breadcrumb: (params: { [key: string]: string }) => {
        if (!params['username'] || !params['modeltag'] || !params['modelversion']) return loading;
        return [
          { path: params['username'] + '/models', title: params['username'] },
          { title: params['modeltag'] + '@' + params['modelversion'] }
        ];
      }
    }
  },
  {
    path: ':username',
    component: ProfileComponent,
    canMatch: [UserExistsGuard],
    data: {
      title: (params: { [key: string]: string }) => {
        if (!params['username']) return loading;
        return params['username'] + (params['profilename'] ? ' · ' + params['profilename'] : '');
      },
      breadcrumb: (params: { [key: string]: string }) => {
        if (!params['username']) return loading;
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
