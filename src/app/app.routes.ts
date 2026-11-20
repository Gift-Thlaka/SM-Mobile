import { Routes } from '@angular/router';

import { LoginScreen } from './login/login';
// import { Dashboard } from './dashboard/dashboard';

import { authGuard } from './auth.guard';

import { Notification } from './notification/notification';

export const routes: Routes = [

    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },

    {
        path: 'login',
        component: LoginScreen
    },

    // {
    //     path: 'dashboard',
    //     component: Dashboard
    // },

    {
        path: 'notifications',
        component: Notification,
        canActivate: [authGuard]
    }

];
