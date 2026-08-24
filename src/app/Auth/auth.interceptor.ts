import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../Service/loading.service';
import { finalize } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService); // Inject the LoadingService
  const router = inject(Router);

  const isAdminRoute = router.url ? router.url.startsWith('/admin') : false;
  const stopGlobalLoading =
    isAdminRoute ||
    req.url.includes('/admin') ||
    req.url.includes('/getall') ||
    req.url.includes('/generate-otp') ||
    req.url.includes('/send-email') ||
    req.url.includes('/verify-otp'); // Check if the request is for admin URLs or auth actions

  if (!stopGlobalLoading) {
    loadingService.showLoading();
  }

  if (typeof localStorage !== 'undefined') {
    const authString = localStorage.getItem('basicAuth');
    if (authString) {
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: authString // Attach Authorization header
        }
      });

      return next(clonedRequest).pipe(
        finalize(() => {
          if (!stopGlobalLoading) {
            loadingService.hideLoading(); // Hide loader only for non-admin requests
          }
        })
      );
    }
  }

  return next(req).pipe(
    finalize(() => {
      if (!stopGlobalLoading) {
        loadingService.hideLoading(); // Hide loader only for non-admin requests
      }
    })
  );
};
