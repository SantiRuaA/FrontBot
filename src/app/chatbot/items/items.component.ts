import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Nl2brPipe } from '../../shared/pipes/nl2br.pipe';
import { Store } from '@ngxs/store';
import { SaveAnswer } from '../../state/generator/generator.actions';

export interface Item {
  content: string;
  createdDate: string;
}

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, Nl2brPipe],
  templateUrl: './items.component.html',
})
export class ItemsComponent {
  @Input() items: Item[] = [];

  constructor(private store: Store) {}

  onSave(content: string): void {
    if (!content) return;
    this.store.dispatch(new SaveAnswer({ content }));
  }
}