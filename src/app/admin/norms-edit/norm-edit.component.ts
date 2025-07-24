import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { NormService } from '../../core/services/norm.service';
import { UpdateNorm } from '../../state/norm/norm.actions';
import { NormState } from '../../state/norm/norm.state';

@Component({
  selector: 'app-norm-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './norm-edit.component.html',
})
export class NormEditComponent implements OnInit {
  normId!: string;
  normForm!: FormGroup;
  loading$!: Observable<boolean>; 
  error$!: Observable<string | null>;  

  constructor(
    private route: ActivatedRoute,
    private normService: NormService,
    private fb: FormBuilder,
    private store: Store
  ) {
    this.loading$ = this.store.select(NormState.loading);
    this.error$ = this.store.select(NormState.error);
  }

  ngOnInit(): void {
    this.normForm = this.fb.group({
      codigoNorma: ['', Validators.required],
      normaCertificacion: ['', Validators.required],
      criteriosDesempeno: this.fb.array([]),
      conocimientodelItem: this.fb.array([])
    });

    this.normId = this.route.snapshot.paramMap.get('id')!;

    if (this.normId) {
      this.normService.getNormById(this.normId).pipe(
        tap(normData => {
          this.normForm.patchValue({
            codigoNorma: normData.codigoNorma,
            normaCertificacion: normData.normaCertificacion,
          });
          normData.criteriosDesempeno.forEach(c => this.addCriterio(c));
          normData.conocimientodelItem.forEach(c => this.addConocimiento(c));
        })
      ).subscribe();
    }
  }
  
  get criteriosDesempeno() {
    return this.normForm.get('criteriosDesempeno') as FormArray;
  }

  get conocimientodelItem() {
    return this.normForm.get('conocimientodelItem') as FormArray;
  }
  addCriterio(value = ''): void {
    this.criteriosDesempeno.push(this.fb.control(value, Validators.required));
  }

  removeCriterio(index: number): void {
    if (this.criteriosDesempeno.length > 1) {
      this.criteriosDesempeno.removeAt(index);
    }
  }

  addConocimiento(value = ''): void {
    this.conocimientodelItem.push(this.fb.control(value, Validators.required));
  }

  removeConocimiento(index: number): void {
    if (this.conocimientodelItem.length > 1) {
      this.conocimientodelItem.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.normForm.invalid) return;

    this.store.dispatch(new UpdateNorm(this.normId, this.normForm.value));
  }
}