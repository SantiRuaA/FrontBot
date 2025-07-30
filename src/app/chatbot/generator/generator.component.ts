import { Component, OnInit } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, map, withLatestFrom } from 'rxjs';
import { Store } from '@ngxs/store';
import { Norm } from '../../shared/models/norm.model';
import { ItemsComponent, Item } from '../items/items.component';
import { headerGeneratorComponent } from '../header-generator/header-generator.component';
import { GeneratorState } from '../../state/generator/generator.state';
import { GenerateItems } from '../../state/generator/generator.actions';
import { NormState } from '../../state/norm/norm.state';
import { LoadNorms } from '../../state/norm/norm.actions';

@Component({
  selector: 'app-generator',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, headerGeneratorComponent, ItemsComponent, SlicePipe ],
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css']
})
export class GeneratorComponent implements OnInit {
  
  generatorForm!: FormGroup;

  norms$!: Observable<Norm[]>;
  generatedItems$!: Observable<Item[]>;
  isLoadingResponse$!: Observable<boolean>;
  performanceCriteria$!: Observable<string[]>;
  knowledgeItems$!: Observable<string[]>;
  
  categorias = ['Recordar', 'Comprender', 'Aplicar'];
  generarOpciones = ['1', '2'];
  formatos = [
    '(selección multiple) varias preguntas con una única respuesta',
    '(completar espacios vacios) varias preguntas con espacios vacios',
    '(verdadero o falso) varias preguntas converdadero o falso',
    '(union de respuestas) varias preguntas y varias respuestas para unir los items',
  ];
  limites = ['50 palabras', '100 palabras', '200 palabras'];

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.generatorForm = this.fb.group({
      norma: [null, Validators.required],
      categoria: [null, Validators.required],
      criterioDesempeno: [null, Validators.required],
      conocimiento: [null, Validators.required],
      contexto: ['', Validators.required],
      reactivo: ['', Validators.required],
      generar: [null, Validators.required],
      formato: [null, Validators.required],
      limite: [null, Validators.required]
    });

    this.norms$ = this.store.select(NormState.norms);
    this.generatedItems$ = this.store.select(GeneratorState.generatedItems);
    this.isLoadingResponse$ = this.store.select(GeneratorState.isLoading);

    this.store.select(NormState.norms).subscribe(norms => {
      if (norms.length === 0) {
        this.store.dispatch(new LoadNorms());
      }
    });

    const normaChanges$ = this.generatorForm.get('norma')!.valueChanges;

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
    if (this.generatorForm.invalid) {
      this.generatorForm.markAllAsTouched();
      return;
    }

    const formValue = this.generatorForm.value;
    const selectedNorm = this.store.selectSnapshot(NormState.norms).find(n => n._id === formValue.norma);
    const normaNombre = selectedNorm ? selectedNorm.normaCertificacion : '';

    let prompt = `Necesito por favor que generes ${formValue.generar} pregunta(s), con el formato de pregunta estilo: ${formValue.formato}, utilizando esta información a continuación; norma: ${normaNombre}, con este criterio: ${formValue.criterioDesempeno}, tipo de conocimiento: ${formValue.conocimiento}, usando este contexto: ${formValue.contexto}, en este reactivo: ${formValue.reactivo}, limitando el texto de la pregunta a solo: ${formValue.limite}, con su respectiva respuesta correcta. Responde solo lo que te pido, no necesito ninguna otra información. Gracias.`;
      
    if (parseInt(formValue.generar, 10) > 1) {
      prompt += ` IMPORTANTE: Separa cada una de las preguntas generadas usando el siguiente texto exacto como separador: ---###---`;
    }
    
    this.store.dispatch(new GenerateItems(prompt));
  }
}
