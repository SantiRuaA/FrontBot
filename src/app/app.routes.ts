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

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [authGuard],
    data: { isPublic: true }
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard], 
    children: [
      { path: 'register', component: RegisterComponent },
      { path: 'generador', component: GeneratorComponent },
      { path: 'ayuda', component: HelpComponent },
      { path: 'items', component: DocumentsComponent },
      { path: 'usuarios', component: UsersComponent },
      { path: 'usuarios/:id', component: UserDetailComponent },
      { path: 'usuarios/:id/edit', component: UserEditComponent },
      { path: 'normas', component: NormsComponent },
      { path: 'normas/:id', component: NormsDetailComponent},

      { path: '', redirectTo: 'generador', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'generador' },
];