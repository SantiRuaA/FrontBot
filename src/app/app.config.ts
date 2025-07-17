import { ApplicationConfig, importProvidersFrom, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

import { routes } from './app.routes';
import { UserState } from './state/user//user.state'; // Asegúrate de que la ruta a tu estado sea correcta

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([]), withFetch()),


    // --- CONFIGURACIÓN DE NGXS ---
    importProvidersFrom(
      NgxsModule.forRoot(
        [UserState], // <-- Aquí registras todos tus estados
        { developmentMode: isDevMode() }
      ),
      // Plugins que solo se activan en modo de desarrollo
      NgxsLoggerPluginModule.forRoot({ disabled: !isDevMode() }),
      NgxsReduxDevtoolsPluginModule.forRoot({ disabled: !isDevMode() })
    )
  ]
};