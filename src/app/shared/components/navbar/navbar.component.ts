import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngxs/store';
import { Logout } from '../../../state/auth/auth.actions'; 

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule ,RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  constructor(private store: Store) {}

  logout(): void {
    this.store.dispatch(new Logout());
  }

}
