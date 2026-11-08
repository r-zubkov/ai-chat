import { Routes } from '@angular/router';
import { CHAT_ROUTES, CHAT_ROUTE_SEGMENTS } from '@shared/routes';
import { initialDataGuard } from './guards/initial-data.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: CHAT_ROUTES.root, pathMatch: 'full' },
  {
    path: CHAT_ROUTE_SEGMENTS.root,
    canMatch: [initialDataGuard],
    children: [
      {
        path: '',
        redirectTo: CHAT_ROUTE_SEGMENTS.new,
        pathMatch: 'full',
      },
      {
        path: CHAT_ROUTE_SEGMENTS.new,
        loadComponent: () => import('@pages/new-chat').then((m) => m.NewChatPage),
      },
      {
        path: CHAT_ROUTE_SEGMENTS.id,
        loadComponent: () => import('@pages/user-chat').then((m) => m.UserChatPage),
      },
    ],
  },
  { path: '**', redirectTo: CHAT_ROUTES.root },
];
