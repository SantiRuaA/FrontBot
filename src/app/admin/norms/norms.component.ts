import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { Norm } from '../../shared/models/norm.model';
import { NormState } from '../../state/norm/norm.state';
import { LoadNorms, CreateNorm } from '../../state/norm/norm.actions';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-norms',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './norms.component.html',
})
export class NormsComponent implements OnInit {
  
  norms$!: Observable<Norm[]>;
  loading$!: Observable<boolean>;
  normForm!: FormGroup;

  constructor(
    private store: Store,
    private fb: FormBuilder
  ) {
    this.norms$ = this.store.select(NormState.norms);
    this.loading$ = this.store.select(NormState.loading);
  }

  ngOnInit(): void {
    this.store.dispatch(new LoadNorms());

    this.normForm = this.fb.group({
      codigoNorma: ['', Validators.required],
      normaCertificacion: ['', Validators.required],
      criteriosDesempeno: this.fb.array([this.fb.control('', Validators.required)]),
      conocimientodelItem: this.fb.array([this.fb.control('', Validators.required)])
    });
  }

  get criteriosDesempeno(): FormArray {
    return this.normForm.get('criteriosDesempeno') as FormArray;
  }

  get conocimientodelItem(): FormArray {
    return this.normForm.get('conocimientodelItem') as FormArray;
  }

  addCriterio(): void {
    this.criteriosDesempeno.push(this.fb.control('', Validators.required));
  }

  removeCriterio(index: number): void {
    if (this.criteriosDesempeno.length > 1) {
      this.criteriosDesempeno.removeAt(index);
    }
  }

  addConocimiento(): void {
    this.conocimientodelItem.push(this.fb.control('', Validators.required));
  }

  removeConocimiento(index: number): void {
    if (this.conocimientodelItem.length > 1) {
      this.conocimientodelItem.removeAt(index);
    }
  }

  onSubmit(): void {
    this.normForm.markAllAsTouched();
    if (this.normForm.invalid) {
      return;
    }

    const payload = {
      codigoNorma: this.normForm.value.codigoNorma,
      normaCertificacion: this.normForm.value.normaCertificacion,
      criteriosDesempeno: this.criteriosDesempeno.value,
      conocimientodelItem: this.conocimientodelItem.value
    };
    
    this.store.dispatch(new CreateNorm(payload));
    
    this.normForm.reset();
    this.criteriosDesempeno.clear();
    this.conocimientodelItem.clear();
    this.addCriterio();
    this.addConocimiento();
  }
}