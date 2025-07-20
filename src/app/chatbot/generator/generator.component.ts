import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ItemsComponent } from '../items/items.component';
import { headerGeneratorComponent } from '../header-generator/header-generator.component';

@Component({
  selector: 'app-generator',
  imports: [CommonModule, ItemsComponent, headerGeneratorComponent],
  templateUrl: './generator.component.html',
})
export class GeneratorComponent {

}
