import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { Norm } from '../../shared/models/norm.model';
import { NormService } from '../../core/services/norm.service';

@Component({
  selector: 'app-norm-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './norms-detail.component.html',
})
export class NormsDetailComponent implements OnInit {
  
  norm$!: Observable<Norm>;

  constructor(
    private route: ActivatedRoute,
    private normService: NormService
  ) {}

  ngOnInit(): void {
    this.norm$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          return this.normService.getNormById(id);
        }
        return new Observable<Norm>();
      })
    );
  }
}