import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { ClearGeneratedItems } from '../../state/generator/generator.actions';

@Component({
  selector: 'app-headerGenerator',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header-generator.component.html',
})
export class headerGeneratorComponent {
  constructor(private store: Store) {}

  clearItems(): void {
    this.store.dispatch(new ClearGeneratedItems());
  }

}
