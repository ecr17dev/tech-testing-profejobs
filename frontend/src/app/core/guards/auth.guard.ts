import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {
  CurrentUserService,
  MockUserRole,
} from '../services/current-user.service';

export const authGuard: CanActivateFn = () => {
  const currentUserService = inject(CurrentUserService);
  const router = inject(Router);

  if (currentUserService.isAuthenticated()) {
    return true;
  }

  return router.parseUrl('/login');
};

export const guestGuard: CanActivateFn = () => {
  const currentUserService = inject(CurrentUserService);
  const router = inject(Router);

  if (currentUserService.isAuthenticated()) {
    return router.parseUrl('/app/dashboard');
  }

  return true;
};

export const roleGuard = (allowedRoles: MockUserRole[]): CanActivateFn => {
  return () => {
    const currentUserService = inject(CurrentUserService);
    const router = inject(Router);

    if (!currentUserService.isAuthenticated()) {
      return router.parseUrl('/login');
    }

    const role = currentUserService.getCurrentRole();
    if (role && allowedRoles.includes(role)) {
      return true;
    }

    return router.parseUrl('/app/dashboard');
  };
};
