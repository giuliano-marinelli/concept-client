//angular modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
//modules
import { AppRoutingModule } from './app-routing.module';
import { JwtModule } from '@auth0/angular-jwt';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TippyModule } from '@ngneat/helipopper';
import { InputMaskModule } from '@ngneat/input-mask';
import { FontAwesomeModule, FaIconLibrary, FaConfig } from '@fortawesome/angular-fontawesome';
import { CustomFormsModule } from 'ngx-custom-validators';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MomentModule } from 'ngx-moment';
//icons
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
//services
import { UserService } from './services/user.service';
import { SessionService } from './services/session.service';
import { MessageService } from './services/message.service';
import { AuthService } from './services/auth.service';
import { AuthGuardLogin } from './services/auth-guard-login.service';
import { AuthGuardAdmin } from './services/auth-guard-admin.service';
import { LeaveGuard } from './services/leave-guard.service';
//directives
import { VarDirective } from './directives/var.directive';
//pipes
import { FilterPipe } from './shared/pipes/filter.pipe';
import { SortPipe } from './shared/pipes/sort.pipe';
import { TruncatePipe } from './shared/pipes/truncate.pipe';
//interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
//shared components
import { ConfirmComponent } from './shared/confirm/confirm.component';
import { LeaveGuardWarningComponent } from './shared/leave-guard-warning/leave-guard-warning.component';
import { SearchComponent } from './shared/search/search.component';
//components
import { AppComponent } from './app.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { ProfileComponent } from './profile/profile.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AccountComponent } from './account/account.component';
import { ProfileSettingsComponent } from './account/profile-settings/profile-settings.component';
import { DevicesSettingsComponent } from './account/devices-settings/devices-settings.component';
import { AdminComponent } from './admin/admin.component';
import { UsersAdminComponent } from './admin/users-admin/users-admin.component';
import { AccountSettingsComponent } from './account/account-settings/account-settings.component';

@NgModule({
  declarations: [
    //directives
    VarDirective,
    //pipes
    FilterPipe,
    SortPipe,
    TruncatePipe,
    //shared components
    ConfirmComponent,
    LeaveGuardWarningComponent,
    SearchComponent,
    //components
    AppComponent,
    AboutComponent,
    LoginComponent,
    RegisterComponent,
    PasswordResetComponent,
    ProfileComponent,
    NotFoundComponent,
    AccountComponent,
    ProfileSettingsComponent,
    DevicesSettingsComponent,
    AdminComponent,
    UsersAdminComponent,
    AccountSettingsComponent
  ],
  imports: [
    //angular modules
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HammerModule,
    //modules
    AppRoutingModule,
    NgbModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: (): string | null => localStorage.getItem('token'),
        // whitelistedDomains: ['localhost:3000', 'localhost:4200']
      }
    }),
    TippyModule.forRoot({
      defaultVariation: 'tooltip',
      variations: {
        tooltip: {
          theme: 'translucent',
          arrow: true,
          maxWidth: 200,
          animation: 'scale',
          trigger: 'mouseenter',
          offset: [0, 5]
        },
        popper: {
          theme: 'translucent',
          arrow: true,
          maxWidth: 200,
          animation: 'scale',
          trigger: 'click',
          offset: [0, 5]
        },
      }
    }),
    InputMaskModule.forRoot({
      inputSelector: 'input',
      isAsync: true
    }),
    FontAwesomeModule,
    CustomFormsModule,
    ImageCropperModule,
    MomentModule.forRoot({
      relativeTimeThresholdOptions: {
        'm': 59
      }
    })
  ],
  providers: [
    //interceptors
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    //services
    UserService,
    SessionService,
    MessageService,
    AuthService,
    AuthGuardLogin,
    AuthGuardAdmin,
    LeaveGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    fontawesomeLibrary: FaIconLibrary,
    fontawesomeConfig: FaConfig
  ) {
    fontawesomeLibrary.addIconPacks(far, fas, fab);
    fontawesomeConfig.defaultPrefix = 'fas';
    fontawesomeConfig.fixedWidth = true;
  }
}
