import { Routes } from '@angular/router';

import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard'; 

import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './admin/register/register.component';
import { UsersComponent } from './admin/user/users.component';
import { UserDetailComponent } from './admin/user-detail/user-detail.component';
import { UserEditComponent } from './admin/user-edit/user-edit.component';
import { NormsComponent } from './admin/norms/norms.component';
import { NormsDetailComponent } from './admin/norms-detail/norms-detail.component';
import { GeneratorComponent } from './chatbot/generator/generator.component';
import { HelpComponent } from './chatbot/help/help.component';
import { DocumentsComponent } from './chatbot/documents/documents.component';
import { loginGuard } from './core/guards/login.guard';
import { roleGuard } from './core/guards/role.guard';
import { NormEditComponent } from './admin/norms-edit/norm-edit.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard],
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard], 
    canActivateChild: [authGuard],
    children: [
      
      { path: 'generador', component: GeneratorComponent },
      { path: 'ayuda', component: HelpComponent },
      { path: 'items', component: DocumentsComponent },

      { 
        path: 'usuarios', 
        component: UsersComponent,
        canActivate: [roleGuard], 
        data: { roles: ['Administrador'] }
      },
      { 
        path: 'register', 
        component: RegisterComponent,
        canActivate: [roleGuard], 
        data: { roles: ['Administrador'] } 
      },

      { path: 'normas', component: NormsComponent },
      { path: 'normas/:id', component: NormsDetailComponent},
    { path: 'normas/:id/edit', component: NormEditComponent },

      { path: '', redirectTo: 'generador', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'generador' },
];