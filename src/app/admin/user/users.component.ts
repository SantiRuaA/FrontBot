import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { UserState } from '../../state/user/user.state';
import { ChangeUserPage, FilterUsers, LoadUsers } from '../../state/user/user.actions';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  users$: Observable<User[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  total$: Observable<number>;
  currentPage$: Observable<number>;
  limit$: Observable<number>;

  constructor(private store: Store) {

    this.users$ = this.store.select(UserState.getVisibleUsers);
    this.total$ = this.store.select(UserState.getTotalFiltered);

    this.loading$ = this.store.select(UserState.loading);
    this.error$ = this.store.select(UserState.error);
    this.currentPage$ = this.store.select(UserState.currentPage);
    this.limit$ = this.store.select(UserState.limit);
  }

  ngOnInit(): void {
    this.store.dispatch(new LoadUsers());
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.store.dispatch(new FilterUsers(filterValue));
  }

  changePage(page: number): void {
    this.store.dispatch(new ChangeUserPage(page));
  }
}