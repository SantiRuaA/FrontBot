import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DocumentState, DocumentsViewModel } from '../../state/document/document.state';
import { LoadDocuments, ChangeDocumentPage } from '../../state/document/document.actions';
import { Nl2brPipe } from '../../shared/pipes/nl2br.pipe';
import { LoadUsers } from '../../state/user/user.actions';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, DatePipe, Nl2brPipe],
  templateUrl: './documents.component.html',
})
export class DocumentsComponent implements OnInit {
  view$: Observable<DocumentsViewModel>;

  constructor(private store: Store) {
    this.view$ = this.store.select(DocumentState.getViewModel);
  }

  ngOnInit(): void {
    // --- LÓGICA CORREGIDA PARA CARGAR EN ORDEN ---
    // 1. Despachamos la carga de usuarios y nos suscribimos a ella.
    this.store.dispatch(new LoadUsers()).pipe(
      // 2. Usamos switchMap para encadenar la siguiente acción.
      //    Esto asegura que LoadDocuments solo se ejecute DESPUÉS de que LoadUsers termine.
      switchMap(() => this.store.dispatch(new LoadDocuments()))
    ).subscribe();
  }

  changePage(page: number): void {
    this.store.dispatch(new ChangeDocumentPage(page));
  }
}