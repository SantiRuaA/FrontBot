import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Login } from '../../../state/auth/auth.actions';
import { AuthState } from '../../../state/auth/auth.state';
import { Observable } from 'rxjs';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(private formBuilder: FormBuilder, private store: Store) {
    this.loading$ = this.store.select(AuthState.loading);
    this.error$ = this.store.select(AuthState.error);
    
    this.loginForm = this.formBuilder.group({
      correo_sena: ['', [Validators.required, Validators.email]], 
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    this.store.dispatch(new Login(
      this.loginForm.value.correo_sena,
      this.loginForm.value.password
    ));
  }
}