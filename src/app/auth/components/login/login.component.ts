import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { Login } from '../../../state/auth/auth.actions';
import { AuthState } from '../../../state/auth/auth.state';
import { Observable } from 'rxjs';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(private formBuilder: FormBuilder, private store: Store) {
    this.loading$ = this.store.select(AuthState.loading);
    this.error$ = this.store.select(AuthState.error);
    
    this.loginForm = this.formBuilder.group({
      // CAMBIO: de username a correo_sena
      correo_sena: ['', [Validators.required, Validators.email]], 
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    // Despachamos la acción con los campos correctos
    this.store.dispatch(new Login(
      this.loginForm.value.correo_sena,
      this.loginForm.value.password
    ));
  }
}