import { ApplicationConfig, importProvidersFrom, isDevMode, provideZoneChangeDetection, provideAppInitializer, APP_INITIALIZER } from '@angular/core'; // <-- 1. IMPORTA provideAppInitializer
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';

import { routes } from './app.routes';
import { UserState } from './state/user/user.state';
import { AuthState } from './state/auth/auth.state';
import { authInitializer } from './core/initializers/auth.initializer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([]), withFetch()),

    importProvidersFrom(
      NgxsModule.forRoot(
        [UserState, AuthState],
        { developmentMode: isDevMode() }
      ),
      NgxsRouterPluginModule.forRoot(),
      NgxsLoggerPluginModule.forRoot({ disabled: !isDevMode() }),
      NgxsReduxDevtoolsPluginModule.forRoot({ disabled: !isDevMode() })
    ),

  ]
};