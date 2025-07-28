import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, map } from 'rxjs'; 
import { Logout } from '../../../state/auth/auth.actions';
import { AuthState } from '../../../state/auth/auth.state';
import { User } from '../../../shared/models/user.model'; 

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  public isAdmin$: Observable<boolean>;
  public user$: Observable<User | null>;

  constructor(private store: Store) {

    const userObservable = this.store.select(AuthState.user);

    this.isAdmin$ = this.store.select(AuthState.user).pipe(
      map(user => user?.role?.toLowerCase() === 'administrador')
    );

    this.user$ = userObservable;
  }

  logout(): void {
    this.store.dispatch(new Logout());
  }
}