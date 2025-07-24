import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Nl2brPipe } from '../../shared/pipes/nl2br.pipe';

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
}