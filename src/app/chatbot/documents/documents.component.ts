import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { DocumentState, DocumentsViewModel, DocumentView } from '../../state/document/document.state';
import { LoadDocuments, ChangeDocumentPage, ToggleDocumentSelection, FilterDocuments } from '../../state/document/document.actions';
import { Nl2brPipe } from '../../shared/pipes/nl2br.pipe';
import { LoadUsers } from '../../state/user/user.actions';
import { WordExportService } from '../../core/services/word-export.service';
import { Document } from '../../shared/models/document.model'; 
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, DatePipe, Nl2brPipe],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  view$: Observable<DocumentsViewModel>;
  
  public collapsedItems = new Set<string>();

  constructor(
    private store: Store, 
    private wordExportService: WordExportService
  ) {
    this.view$ = this.store.select(DocumentState.getViewModel);
  }

  ngOnInit(): void {
    this.store.dispatch(new LoadUsers());
    this.store.dispatch(new LoadDocuments());
  }

  changePage(page: number): void {
    this.store.dispatch(new ChangeDocumentPage(page));
  }

  toggleCollapse(docId: string): void {
    if (this.collapsedItems.has(docId)) {
      this.collapsedItems.delete(docId);
    } else {
      this.collapsedItems.add(docId);
    }
  }

  isCollapsed(docId: string): boolean {
    return this.collapsedItems.has(docId);
  }

  toggleSelection(doc: DocumentView): void {
    this.store.dispatch(new ToggleDocumentSelection(doc._id));
  }

  downloadSelected(): void {
    const state = this.store.snapshot();
    const allDocsWithStatus: DocumentView[] = state.document.allDocuments.map((doc: Document) => {
        const author = state.user.allUsers.find((user: User) => user.id === doc.userId);
        return {
            ...doc,
            authorName: author ? author.fullName : 'Desconocido',
            isSelected: state.document.selectedIds.includes(doc._id)
        };
    });

    const selected = allDocsWithStatus.filter(doc => doc.isSelected);
    this.wordExportService.exportToWord(selected);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.store.dispatch(new FilterDocuments(filterValue));
  }
}