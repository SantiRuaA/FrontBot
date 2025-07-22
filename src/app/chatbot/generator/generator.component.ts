import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, startWith, tap } from 'rxjs';
import { Norm } from '../../shared/models/norm.model';
import { NormService } from '../../core/services/norm.service';
import { ItemsComponent } from '../items/items.component';
import { headerGeneratorComponent } from '../header-generator/header-generator.component';

@Component({
  selector: 'app-generator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, headerGeneratorComponent, ItemsComponent],
  templateUrl: './generator.component.html',
})
export class GeneratorComponent implements OnInit {
  
  generatorForm!: FormGroup;

  norms$!: Observable<Norm[]>;
  performanceCriteria$!: Observable<string[]>;
  knowledgeItems$!: Observable<string[]>;

  categorias: string[] = ['Categoría de Ejemplo 1', 'Categoría de Ejemplo 2', 'Categoría de Ejemplo 3'];
  opcionesGenerar: string[] = ['Opción 1', 'Opción 2', 'Opción 3'];
  formatos: string[] = ['Formato A', 'Formato B', 'Formato C'];
  limites: number[] = [1, 2, 3];

  constructor(
    private fb: FormBuilder,
    private normService: NormService
  ) {}

  ngOnInit(): void {
    this.generatorForm = this.fb.group({
      titulo: [''],
      norma: [null],
      categoria: [null],
      criterioDesempeno: [null],
      conocimiento: [null],
      contexto: [''],
      reactivo: [''],
      generar: [null],
      formato: [null],
      limite: [null]
    });

    this.norms$ = this.normService.getNorms();

    this.performanceCriteria$ = this.generatorForm.get('norma')!.valueChanges.pipe(
      startWith(null),
      map(selectedNormId => {
        let selectedNorm: Norm | undefined;
        this.norms$.subscribe(norms => {
          selectedNorm = norms.find(n => n._id === selectedNormId);
        });
        return selectedNorm ? selectedNorm.criteriosDesempeno : [];
      })
    );

    this.knowledgeItems$ = this.generatorForm.get('norma')!.valueChanges.pipe(
      startWith(null),
      map(selectedNormId => {
        let selectedNorm: Norm | undefined;
        this.norms$.subscribe(norms => {
          selectedNorm = norms.find(n => n._id === selectedNormId);
        });
        return selectedNorm ? selectedNorm.conocimientodelItem : [];
      })
    );
  }

  onSubmit() {
    console.log(this.generatorForm.value);
  }
}
