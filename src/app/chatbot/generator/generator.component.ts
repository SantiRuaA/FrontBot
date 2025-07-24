import { Component, OnInit } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, map, startWith, withLatestFrom, shareReplay, take } from 'rxjs'; 
import { Norm } from '../../shared/models/norm.model';
import { NormService } from '../../core/services/norm.service';
import { ChatService } from '../../core/services/chat.service';
import { ItemsComponent, Item } from '../items/items.component';
import { headerGeneratorComponent } from '../header-generator/header-generator.component'; 

@Component({
  selector: 'app-generator',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, headerGeneratorComponent, ItemsComponent, SlicePipe ],
  templateUrl: './generator.component.html',
})
export class GeneratorComponent implements OnInit {
  
  generatorForm!: FormGroup;

  norms$!: Observable<Norm[]>;
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
  
  generatedItems: Item[] = [];
  isLoadingResponse = false;

  constructor(
    private fb: FormBuilder,
    private normService: NormService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.generatorForm = this.fb.group({
      titulo: ['', Validators.required],
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

    this.norms$ = this.normService.getNorms().pipe(shareReplay(1));

    const normaChanges$ = this.generatorForm.get('norma')!.valueChanges.pipe(startWith(this.generatorForm.get('norma')?.value));

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

    this.isLoadingResponse = true;
    const formValue = this.generatorForm.value;

    this.norms$.pipe(
      take(1)
    ).subscribe(norms => {
      const selectedNorm = norms.find(n => n._id === formValue.norma);
      const normaNombre = selectedNorm ? selectedNorm.normaCertificacion : '';

      const prompt = `Necesito por favor que generes ${formValue.generar} pregunta(s), con el formato de pregunta estilo: ${formValue.formato}, utilizando esta información a continuación; norma: ${normaNombre}, con este criterio: ${formValue.criterioDesempeno}, tipo de conocimiento: ${formValue.conocimiento}, usando este contexto: ${formValue.contexto}, en este reactivo: ${formValue.reactivo}, limitando el texto de la pregunta a solo: ${formValue.limite}, con su respectiva respuesta correcta. Responde solo lo que te pido, no necesito ninguna otra información. Gracias.`;
      
      this.chatService.generateResponse(prompt).subscribe({
        next: (response) => {
          const newItem: Item = {
            content: response.response,
            createdDate: new Date().toLocaleDateString('es-CO')
          };
          this.generatedItems = [newItem, ...this.generatedItems];
          this.isLoadingResponse = false;
        },
        error: (err) => {
          console.error('Error al generar la respuesta:', err);
          this.isLoadingResponse = false;
        }
      });
    });
  }
}