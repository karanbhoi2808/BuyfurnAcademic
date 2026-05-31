import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './Auth/auth.interceptor';
import { UpdateService } from './Service/update.service';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(), provideHttpClient(withFetch(), withInterceptors([authInterceptor]))]
};

// export const environment = {
//   baseUrlAdmin: 'http://localhost:8080/api/admin',
//   baseUrlLocal: 'http://localhost:8080/api'
// };

export const environment = {
  baseUrlAdmin: 'https://buyfurnbackend-production.up.railway.app/api',
  baseUrlLocal: 'https://buyfurnbackend-production.up.railway.app/api'
};
