import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Nl2brPipe } from '../../shared/pipes/nl2br.pipe';
import { Store } from '@ngxs/store';
import { SaveAnswer, ToggleItemCollapse } from '../../state/generator/generator.actions';

export interface Item {
  tempId: string;
  title: string;
  content: string;
  createdDate: string;
  isSaved: boolean; 
  isCollapsed: boolean;
}

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [CommonModule, Nl2brPipe],
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent {
  @Input() items: Item[] = [];

  constructor(private store: Store) {}

  onSave(item: Item): void {
    if (!item || item.isSaved) return;
    this.store.dispatch(new SaveAnswer({ content: item.content, tempId: item.tempId, title: item.title }));
  }

  toggleCollapse(item: Item): void {
    this.store.dispatch(new ToggleItemCollapse(item.tempId));
  }
}