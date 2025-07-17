import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './shared/layouts/auth-layout/auth-layout.component';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './admin/register/register.component';
import { UsersComponent } from './admin/user/users.component';
import { GeneratorComponent } from './chatbot/generator/generator.coponent';
import { HelpComponent } from './chatbot/help/help.component';
import { DocumentsComponent } from './chatbot/documents/documents.component';
import { NormsComponent } from './admin/norms/norms.component';


export const routes: Routes = [
  // --- Rutas Públicas (sin header) ---
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent }
    ]
  },

  // --- Rutas Privadas (con header) ---
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'register', component: RegisterComponent },
      { path: 'generador', component: GeneratorComponent },
      { path: 'ayuda', component: HelpComponent },
      { path: 'documentos', component: DocumentsComponent },
      { path: 'usuarios', component: UsersComponent },
      { path: 'normas', component: NormsComponent },
    ]
  },

  // --- Redirecciones ---
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
