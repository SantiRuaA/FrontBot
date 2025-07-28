import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError, of } from 'rxjs';
import { Document } from '../../shared/models/document.model';
import { DocumentService } from '../../core/services/document.service';
import { LoadDocuments, LoadDocumentsSuccess, LoadDocumentsFailure, AddDocument, ChangeDocumentPage } from './document.actions';
import { AuthState } from '../auth/auth.state';
import { User } from '../../shared/models/user.model';
import { UserState, UserStateModel } from '../user/user.state';

export interface DocumentStateModel {
  allDocuments: Document[];
  loading: boolean;
  error: any;
  page: number;
  limit: number;
}

export interface DocumentsViewModel {
  documents: Document[];
  isLoading: boolean;
  total: number;
  currentPage: number;
  limit: number;
}

@State<DocumentStateModel>({
  name: 'document',
  defaults: {
    allDocuments: [],
    loading: false,
    error: null,
    page: 1,
    limit: 5,
  },
})
@Injectable()
export class DocumentState {
  constructor(private documentService: DocumentService) {}
  
  @Selector([DocumentState, AuthState.user, UserState])
  static getViewModel(state: DocumentStateModel, authUser: User | null, userState: UserStateModel): DocumentsViewModel {
    let visibleDocuments: Document[] = [];

    if (authUser) {
      const userRole = authUser.role?.toLowerCase();
      if (userRole === 'administrador' || userRole === 'evaluador') {
        visibleDocuments = state.allDocuments;
      } else {
        const allUsers = userState.allUsers;
        if (allUsers && allUsers.length > 0) {
          const fullCurrentUser = allUsers.find(user => user.email === authUser.email);
          if (fullCurrentUser) {
            visibleDocuments = state.allDocuments.filter(doc => doc.userId === fullCurrentUser.id);
          }
        }
      }
    }

    const sorted = [...visibleDocuments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const startIndex = (state.page - 1) * state.limit;
    const paginated = sorted.slice(startIndex, startIndex + state.limit);

    return {
      documents: paginated,
      isLoading: state.loading,
      total: visibleDocuments.length,
      currentPage: state.page,
      limit: state.limit
    };
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
    ctx.patchState({
      allDocuments: [document, ...state.allDocuments]
    });
  }

  @Action(ChangeDocumentPage)
  changeDocumentPage(ctx: StateContext<DocumentStateModel>, { page }: ChangeDocumentPage) {
    ctx.patchState({ page });
  }
}