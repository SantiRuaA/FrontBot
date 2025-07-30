import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError, of } from 'rxjs';
import { Document } from '../../shared/models/document.model';
import { DocumentService } from '../../core/services/document.service';
import { LoadDocuments, LoadDocumentsSuccess, LoadDocumentsFailure, AddDocument, ChangeDocumentPage, ToggleDocumentSelection, FilterDocuments } from './document.actions';
import { AuthState } from '../auth/auth.state';
import { User } from '../../shared/models/user.model';
import { UserState, UserStateModel } from '../user/user.state';

export interface DocumentView extends Document {
  authorName: string;
  isSelected: boolean;
}

export interface DocumentStateModel {
  allDocuments: Document[];
  loading: boolean;
  error: any;
  page: number;
  limit: number;
  selectedIds: string[];
  filter: string; 
}

export interface DocumentsViewModel {
  documents: DocumentView[];
  isLoading: boolean;
  total: number;
  currentPage: number;
  limit: number;
  selectedCount: number;
  pages: number[];
}

@State<DocumentStateModel>({
  name: 'document',
  defaults: {
    allDocuments: [],
    loading: false,
    error: null,
    page: 1,
    limit: 5,
    selectedIds: [],
    filter: '', 
  },
})
@Injectable()
export class DocumentState {
  constructor(private documentService: DocumentService) {}
  
  @Selector([DocumentState, AuthState.user, UserState])
  static getViewModel(state: DocumentStateModel, authUser: User | null, userState: UserStateModel): DocumentsViewModel {
    if (!authUser || !userState || !state || !userState.allUsers) {
      return {
        documents: [], isLoading: state.loading, total: 0,
        currentPage: state.page, limit: state.limit, selectedCount: 0, pages: []
      };
    }

    let visibleDocuments: Document[] = [];
    const userRole = authUser.role?.toLowerCase();
    const allUsers = userState.allUsers;

    if (userRole === 'administrador' || userRole === 'evaluador') {
      visibleDocuments = state.allDocuments;
    } else {
      const fullCurrentUser = allUsers.find(user => user.email === authUser.email);
      if (fullCurrentUser) {
        const currentUserTenantId = fullCurrentUser.tenantId;
        visibleDocuments = state.allDocuments.filter(doc => {
          const author = allUsers.find(user => user.id === doc.userId);
          return author && author.tenantId === currentUserTenantId;
        });
      }
    }

    const documentsWithAuthors: DocumentView[] = visibleDocuments.map(doc => {
      const author = allUsers.find(user => user.id === doc.userId);
      let finalTitle = doc.title;
      let finalContent = doc.content;
      if (!finalTitle && doc.content.includes('|||TITLE|||')) {
        const parts = doc.content.split('|||TITLE|||');
        finalTitle = parts[0].trim();
        finalContent = parts[1].trim();
      }
      return {
        ...doc,
        title: finalTitle || 'Pregunta sin título',
        content: finalContent,
        authorName: author ? author.fullName : 'Usuario Desconocido',
        isSelected: state.selectedIds.includes(doc._id),
      };
    });

    const filtered = state.filter
      ? documentsWithAuthors.filter(doc => 
          doc.title.toLowerCase().includes(state.filter.toLowerCase()) || 
          doc.authorName.toLowerCase().includes(state.filter.toLowerCase())
        )
      : documentsWithAuthors;

    const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const startIndex = (state.page - 1) * state.limit;
    const paginated = sorted.slice(startIndex, startIndex + state.limit);
    const totalPages = Math.ceil(filtered.length / state.limit);
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return {
      documents: paginated,
      isLoading: state.loading,
      total: filtered.length,
      currentPage: state.page,
      limit: state.limit,
      selectedCount: state.selectedIds.length,
      pages: pages
    };
  }

  @Action(FilterDocuments)
  filterDocuments(ctx: StateContext<DocumentStateModel>, { filter }: FilterDocuments) {
    ctx.patchState({ filter, page: 1 }); 
  }

  @Action(LoadDocuments)
  loadDocuments(ctx: StateContext<DocumentStateModel>) {
    ctx.patchState({ loading: true });
    return this.documentService.getDocuments().pipe(
      tap(documents => ctx.dispatch(new LoadDocumentsSuccess(documents))),
      catchError(error => ctx.dispatch(new LoadDocumentsFailure(error)))
    );
  }
  @Action(LoadDocumentsSuccess)
  loadDocumentsSuccess(ctx: StateContext<DocumentStateModel>, { documents }: LoadDocumentsSuccess) {
    ctx.patchState({ allDocuments: documents, loading: false });
  }
  @Action(LoadDocumentsFailure)
  loadDocumentsFailure(ctx: StateContext<DocumentStateModel>, { error }: LoadDocumentsFailure) {
    ctx.patchState({ error, loading: false });
  }
  @Action(AddDocument)
  addDocument(ctx: StateContext<DocumentStateModel>, { document }: AddDocument) {
    const state = ctx.getState();
    ctx.patchState({ allDocuments: [document, ...state.allDocuments] });
  }
  @Action(ChangeDocumentPage)
  changeDocumentPage(ctx: StateContext<DocumentStateModel>, { page }: ChangeDocumentPage) {
    ctx.patchState({ page });
  }
  @Action(ToggleDocumentSelection)
  toggleDocumentSelection(ctx: StateContext<DocumentStateModel>, { documentId }: ToggleDocumentSelection) {
    const state = ctx.getState();
    const selectedIds = [...state.selectedIds];
    const index = selectedIds.indexOf(documentId);
    if (index > -1) {
      selectedIds.splice(index, 1);
    } else {
      selectedIds.push(documentId);
    }
    ctx.patchState({ selectedIds });
  }
}
