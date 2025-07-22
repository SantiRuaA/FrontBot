import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { UserState } from '../../state/user/user.state';
import { LoadUsers } from '../../state/user/user.actions'; 

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  public users$: Observable<User[]>;
  public loading$: Observable<boolean>;

  constructor(private store: Store) {
    // Conectamos los observables a los selectors del estado 'user'
    this.users$ = this.store.select(UserState.users);
    this.loading$ = this.store.select(UserState.loading);
  }

  ngOnInit(): void {
    // Despachamos la acción para cargar los usuarios
    this.store.dispatch(new LoadUsers());
  }
}