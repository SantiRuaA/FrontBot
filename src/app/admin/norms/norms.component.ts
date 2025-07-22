import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store'; 
import { Norm } from '../../shared/models/norm.model';
import { NormState } from '../../state/norm/norm.state';
import { LoadNorms } from '../../state/norm/norm.actions'; 
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
      codigoNorma: [''],
      normaCertificacion: [''],
      criteriosDesempeno: this.fb.array([]),
      conocimientodelItem: this.fb.array([])
    });
  }
}