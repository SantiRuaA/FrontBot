import { Component, OnInit } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, startWith, withLatestFrom, shareReplay } from 'rxjs';
import { Norm } from '../../shared/models/norm.model';
import { NormService } from '../../core/services/norm.service';
import { ItemsComponent } from '../items/items.component';
import { headerGeneratorComponent } from '../header-generator/header-generator.component';

@Component({
  selector: 'app-generator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, headerGeneratorComponent, ItemsComponent, SlicePipe],
  templateUrl: './generator.component.html',
})
export class GeneratorComponent implements OnInit {
  
  generatorForm!: FormGroup;

  norms$!: Observable<Norm[]>;
  performanceCriteria$!: Observable<string[]>;
  knowledgeItems$!: Observable<string[]>;

  categorias: string[] = ['Recordar', 'Comprender', 'Aplicar'];
  opcionesGenerar: string[] = ['1', '2'];
  formatos = [
    '(selección multiple) varias preguntas con una única respuesta',
    '(completar espacios vacios) varias preguntas con espacios vacios',
    '(verdadero o falso) varias preguntas converdadero o falso',
    '(union de respuestas) varias preguntas y varias respuestas para unir los items',
  ];
  limites = ['50 palabras', '100 palabras', '200 palabras'];

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

    // 1. Cargamos las normas y usamos shareReplay(1) para evitar múltiples llamadas a la API
    this.norms$ = this.normService.getNorms().pipe(
      shareReplay(1)
    );

    // Obtenemos el observable de cambios del control 'norma'
    const normaChanges$ = this.generatorForm.get('norma')!.valueChanges.pipe(
      startWith(null)
    );

    // 2. Usamos withLatestFrom para combinar el cambio con la lista completa de normas
    this.performanceCriteria$ = normaChanges$.pipe(
      withLatestFrom(this.norms$),
      map(([selectedNormId, norms]) => {
        if (!selectedNormId) return [];
        const selectedNorm = norms.find(n => n._id === selectedNormId);
        return selectedNorm ? selectedNorm.criteriosDesempeno : [];
      })
    );

    this.knowledgeItems$ = normaChanges$.pipe(
      withLatestFrom(this.norms$),
      map(([selectedNormId, norms]) => {
        if (!selectedNormId) return [];
        const selectedNorm = norms.find(n => n._id === selectedNormId);
        return selectedNorm ? selectedNorm.conocimientodelItem : [];
      })
    );
  }

  onSubmit() {
    console.log(this.generatorForm.value);
  }
}