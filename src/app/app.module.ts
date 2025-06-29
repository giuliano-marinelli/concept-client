// sort-imports-ignore
//angular modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpHeaders, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//graphql modules
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloDynamic } from 'apollo-dynamic';
import { ApolloLink, InMemoryCache, split } from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createClient } from 'graphql-ws';
import extractFiles from 'extract-files/extractFiles.mjs';
import isExtractableFile from 'extract-files/isExtractableFile.mjs';
//modules
import { AppRoutingModule } from './app-routing.module';
import { JwtModule } from '@auth0/angular-jwt';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbTagsModule } from '../ng-bootstrap/tags/tags.module';
import { provideTippyConfig, TippyDirective } from '@ngneat/helipopper';
import { InputMaskModule } from '@ngneat/input-mask';
import { FontAwesomeModule, FaIconLibrary, FaConfig } from '@fortawesome/angular-fontawesome';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MomentModule } from 'ngx-moment';
import { NarikCustomValidatorsModule } from '@narik/custom-validators';
import { NgOtpInputModule } from 'ng-otp-input';
import { NgxMasonryModule } from 'ngx-masonry';
import { AngularResizeEventModule } from 'angular-resize-event-package';
import { JsonFormsModule } from '@jsonforms/angular';
import { JsonFormsBootstrapModule } from '../json-forms/bootstrap-renderer/module';
//environment
import { environment } from '../environments/environment';
//icons
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
//services
import { MessagesService } from './services/messages.service';
//directives
import { VarDirective } from './shared/directives/var.directive';
//pipes
import { FilterPipe } from './shared/pipes/filter.pipe';
import { SortPipe } from './shared/pipes/sort.pipe';
import { TruncatePipe } from './shared/pipes/truncate.pipe';
//shared components
import { ConfirmComponent } from './shared/components/confirm/confirm.component';
import { LeaveGuardWarningComponent } from './shared/components/leave-guard-warning/leave-guard-warning.component';
import { SearchComponent } from './shared/components/search/search.component';
import { InvalidFeedbackComponent } from './shared/components/invalid-feedback/invalid-feedback.component';
import { VerifiedMarkComponent } from './shared/components/verified-mark/verified-mark.component';
import { PictureInputComponent } from './shared/components/picture-input/picture-input.component';
import { JsonModelTreeComponent } from './shared/components/json-model-tree/json-model-tree.component';
import { UserCardComponent } from './shared/components/user/card/user-card.component';
import { UserMiniComponent } from './shared/components/user/mini/user-mini.component';
import { SessionCardComponent } from './shared/components/session/card/session-card.component';
import { SessionMiniComponent } from './shared/components/session/mini/session-mini.component';
import { LanguageCardComponent } from './shared/components/language/card/language-card.component';
import { LanguageMiniComponent } from './shared/components/language/mini/language-mini.component';
import { LanguageEditorComponent } from './shared/components/language/editor/language-editor.component';
import { LanguageElementCardComponent } from './shared/components/language-element/card/language-element-card.component';
import { LanguageElementMiniComponent } from './shared/components/language-element/mini/language-element-mini.component';
import { LanguageElementEditorComponent } from './shared/components/language-element/editor/language-element-editor.component';
import { ModelCardComponent } from './shared/components/model/card/model-card.component';
import { ModelEditorComponent } from './shared/components/model/editor/model-editor.component';
import { ResourceCardComponent } from './shared/components/resource/card/resource-card.component';
//components
import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileOverviewComponent } from './profile/overview/profile-overview.component';
import { ProfileOverviewPinsComponent } from './profile/overview/pins/profile-overview-pins.component';
import { ProfileLanguagesComponent } from './profile/languages/profile-languages.component';
import { ProfileModelsComponent } from './profile/models/profile-models.component';
import { SettingsComponent } from './settings/settings.component';
import { SettingsProfileComponent } from './settings/profile/settings-profile.component';
import { SettingsAccountComponent } from './settings/account/settings-account.component';
import { SettingsEmailsComponent } from './settings/emails/settings-emails.component';
import { SettingsSecurityComponent } from './settings/security/settings-security.component';
import { SettingsDevicesComponent } from './settings/devices/settings-devices.component';
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
    InvalidFeedbackComponent,
    VerifiedMarkComponent,
    PictureInputComponent,
    JsonModelTreeComponent,
    UserCardComponent,
    UserMiniComponent,
    SessionCardComponent,
    SessionMiniComponent,
    LanguageCardComponent,
    LanguageMiniComponent,
    LanguageEditorComponent,
    LanguageElementCardComponent,
    LanguageElementMiniComponent,
    LanguageElementEditorComponent,
    ModelCardComponent,
    ModelEditorComponent,
    ResourceCardComponent,
    //components
    AppComponent,
    NotFoundComponent,
    LoginComponent,
    RegisterComponent,
    PasswordResetComponent,
    ProfileComponent,
    ProfileOverviewComponent,
    ProfileOverviewPinsComponent,
    ProfileLanguagesComponent,
    ProfileModelsComponent,
    SettingsComponent,
    SettingsProfileComponent,
    SettingsAccountComponent,
    SettingsEmailsComponent,
    SettingsSecurityComponent,
    SettingsDevicesComponent,
    AdminComponent,
    AdminUsersComponent,
    LanguagesComponent,
    LanguageComponent,
    LanguageDesignComponent,
    LanguageVersionsComponent,
    LanguageSettingsComponent,
    LanguageSettingsGeneralComponent,
    ModelsComponent,
    ModelComponent
  ],
  bootstrap: [AppComponent],
  imports: [
    //angular modules
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HammerModule,
    //graphql modules
    ApolloModule,
    //modules
    AppRoutingModule,
    NgbModule,
    NgbTagsModule,
    FontAwesomeModule,
    ImageCropperModule,
    NarikCustomValidatorsModule,
    NgOtpInputModule,
    NgxMasonryModule,
    AngularResizeEventModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: (): string | null => localStorage.getItem('token')
        // whitelistedDomains: ['localhost:3000', 'localhost:4200']
      }
    }),
    InputMaskModule.forRoot({
      inputSelector: 'input',
      isAsync: true
    }),
    MomentModule.forRoot({
      relativeTimeThresholdOptions: {
        m: 59
      }
    }),
    //directives
    TippyDirective,
    JsonFormsModule,
    JsonFormsBootstrapModule
  ],
  providers: [
    //configurations
    provideTippyConfig({
      defaultVariation: 'tooltip',
      variations: {
        tooltip: {
          theme: 'material',
          arrow: true,
          maxWidth: 200,
          animation: 'scale',
          trigger: 'mouseenter',
          offset: [0, 5]
        },
        no_arrow: {
          theme: 'material',
          arrow: false,
          maxWidth: 200,
          animation: 'scale',
          trigger: 'mouseenter',
          offset: [0, 5]
        },
        popper: {
          theme: 'material',
          arrow: true,
          maxWidth: 200,
          animation: 'scale',
          trigger: 'click',
          offset: [0, 5]
        }
      }
    }),
    {
      provide: APOLLO_OPTIONS,
      useFactory(httpLink: HttpLink, messages: MessagesService) {
        //create an http link
        const http = httpLink.create({
          uri: `http://${environment.host}:${environment.appPort}/${environment.graphql}`,
          //required for upload files
          extractFiles: (body) => {
            return extractFiles(body, isExtractableFile) as any;
          },
          //here we can set the headers for all http requests
          headers: new HttpHeaders().set('apollo-require-preflight', 'true') //required for upload files
        });
        //create a websocket link (if it's needed for subscriptions)
        const ws = new GraphQLWsLink(
          createClient({
            url: `ws://${environment.host}:${environment.appPort}/${environment.graphql}`
          })
        );
        //add authentication token to the headers
        const auth = setContext(() => {
          //get the authentication token from local storage if it exists
          const token = localStorage.getItem('token');
          //add the token to the headers
          return token
            ? {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            : {};
        });
        //general error handling behavior (for all requests)
        //specifically for network errors that only shows from here
        const error = onError(({ graphQLErrors, networkError }) => {
          if (graphQLErrors) {
            graphQLErrors.map((error: any) => console.error('[GraphQL error]', error));
          }
          if (networkError) {
            console.error('[Network error]', networkError);
            messages.error('<b>Network error</b>. Please check your internet connection.', {
              icon: 'fas fa-wifi',
              container: 'network-error',
              position: 'bottomCenter',
              onlyOne: true,
              displayMode: 'replace'
            });
          }
        });
        //general success handling behavior (for all requests)
        const success = new ApolloLink((operation, forward) => {
          return forward(operation).map((data) => {
            //clear the network error messages
            messages.clear('network-error');
            return data;
          });
        });
        //split for set the link type (http or ws) based on the operation type
        //add the auth context to the link
        //set the general error handling behavior
        const link = ApolloLink.from([
          auth,
          error,
          success,
          split(
            //split based on operation type
            ({ query }) => {
              const definition = getMainDefinition(query);
              return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
            },
            ws,
            http
          )
        ]);
        return {
          link: link,
          cache: new InMemoryCache({
            addTypename: false
          }),
          defaultOptions: {
            watchQuery: {
              fetchPolicy: 'cache-and-network',
              errorPolicy: 'all'
            },
            query: {
              fetchPolicy: 'network-only',
              errorPolicy: 'all'
            },
            mutate: {
              fetchPolicy: 'network-only',
              errorPolicy: 'all'
            }
          }
        };
      },
      deps: [HttpLink, MessagesService]
    },
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class AppModule {
  constructor(fontawesomeLibrary: FaIconLibrary, fontawesomeConfig: FaConfig) {
    fontawesomeLibrary.addIconPacks(far, fas, fab);
    fontawesomeConfig.defaultPrefix = 'fas';
    fontawesomeConfig.fixedWidth = true;

    ApolloDynamic.cache = true;
  }
}
