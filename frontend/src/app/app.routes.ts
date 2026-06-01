import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guard';
import { AppShellComponent } from './core/layout/app-shell.component';
import { LoginPageComponent } from './features/auth/pages/login-page.component';
import { ForgotPasswordPageComponent } from './features/auth/pages/forgot-password-page.component';
import { DataOverviewPageComponent } from './features/data/pages/data-overview-page.component';
import { DashboardPageComponent } from './features/dashboard/pages/dashboard-page.component';
import { GradebookPageComponent } from './features/gradebook/pages/gradebook-page.component';
import { StudentDetailsPageComponent } from './features/students/pages/student-details-page.component';
import { StudentsListPageComponent } from './features/students/pages/students-list-page.component';
import { TeachersListPageComponent } from './features/teachers/pages/teachers-list-page.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    component: LoginPageComponent,
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    component: ForgotPasswordPageComponent,
  },
  {
    path: 'app',
    canActivate: [authGuard],
    component: AppShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        component: DashboardPageComponent,
      },
      {
        path: 'gradebook',
        component: GradebookPageComponent,
      },
      {
        path: 'students',
        component: StudentsListPageComponent,
      },
      {
        path: 'teachers',
        canActivate: [roleGuard(['DIRECTOR', 'UTP'])],
        component: TeachersListPageComponent,
      },
      {
        path: 'data',
        component: DataOverviewPageComponent,
      },
      {
        path: 'students/:id',
        component: StudentDetailsPageComponent,
      },
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/app',
  },
  {
    path: '**',
    redirectTo: '/app',
  },
];
