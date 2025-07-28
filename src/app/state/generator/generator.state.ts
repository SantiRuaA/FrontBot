import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector, Store, ofActionSuccessful, Actions } from '@ngxs/store';
import { tap, catchError, of, switchMap, take } from 'rxjs';
import { Item } from '../../chatbot/items/items.component';
import { ChatService } from '../../core/services/chat.service';
import { AnswerService, AnswerPayload } from '../../core/services/answer.service';
import { AuthState } from '../auth/auth.state';
import { AddDocument } from '../document/document.actions';
import { Document } from '../../shared/models/document.model';
import { User } from '../../shared/models/user.model';
import { LoadUsers } from '../user/user.actions';
import { 
  GenerateItems, 
  GenerateItemsSuccess, 
  GenerateItemsFailure,
  SaveAnswer,
  SaveAnswerSuccess,
  SaveAnswerFailure
} from './generator.actions';

export interface GeneratorStateModel {
  generatedItems: Item[];
  loading: boolean;
  error: string | null;
}

@State<GeneratorStateModel>({
  name: 'generator',
  defaults: {
    generatedItems: [],
    loading: false,
    error: null,
  },
})
@Injectable()
export class GeneratorState {
  constructor(
    private chatService: ChatService,
    private answerService: AnswerService,
    private store: Store,
    private actions$: Actions
  ) {}

  @Selector()
  static generatedItems(state: GeneratorStateModel): Item[] {
    return state.generatedItems;
  }

  @Selector()
  static isLoading(state: GeneratorStateModel): boolean {
    return state.loading;
  }

  @Action(GenerateItems)
  generateItems(ctx: StateContext<GeneratorStateModel>, { prompt, title }: GenerateItems) {
    ctx.patchState({ loading: true, error: null });
    return this.chatService.generateResponse(prompt).pipe(
      tap((response) => {
        const newItem: Item = {
          content: response.response,
          createdDate: new Date().toLocaleDateString('es-CO'),
        };
        ctx.dispatch(new GenerateItemsSuccess(newItem));
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Error al comunicarse con la IA.';
        ctx.dispatch(new GenerateItemsFailure(errorMessage));
        return of(error);
      })
    );
  }

  @Action(GenerateItemsSuccess)
  generateItemsSuccess(ctx: StateContext<GeneratorStateModel>, { newItem }: GenerateItemsSuccess) {
    const state = ctx.getState();
    ctx.patchState({
      generatedItems: [newItem, ...state.generatedItems],
      loading: false,
    });
  }

  @Action(GenerateItemsFailure)
  generateItemsFailure(ctx: StateContext<GeneratorStateModel>, { error }: GenerateItemsFailure) {
    ctx.patchState({
      loading: false,
      error: error,
    });
  }

  @Action(SaveAnswer)
  saveAnswer(ctx: StateContext<GeneratorStateModel>, { payload }: SaveAnswer) {
    const state = this.store.snapshot();
    const allUsers = state.user.allUsers;

    if (!allUsers || allUsers.length === 0) {
      return ctx.dispatch(new LoadUsers()).pipe(
        switchMap(() => this.performSave(ctx, payload))
      );
    }

    return this.performSave(ctx, payload);
  }

  private performSave(ctx: StateContext<GeneratorStateModel>, payload: { content: string }) {
    const authUser = this.store.selectSnapshot(AuthState.user);
    if (!authUser) {
      return ctx.dispatch(new SaveAnswerFailure('No hay un usuario autenticado.'));
    }
    const allUsers = this.store.snapshot().user.allUsers;
    const fullCurrentUser = allUsers.find((user: User) => user.email === authUser.email);

    if (!fullCurrentUser || !fullCurrentUser.id) {
      const errorMsg = 'No se pudo encontrar el ID del usuario en la lista de usuarios cargados.';
      return ctx.dispatch(new SaveAnswerFailure(errorMsg));
    }

    const apiPayload: AnswerPayload = {
      content: payload.content,
      role: fullCurrentUser.role,
      userId: fullCurrentUser.id
    };

    return this.answerService.saveAnswer(apiPayload).pipe(
      tap((savedAnswer: Document) => {
        ctx.dispatch(new AddDocument(savedAnswer));
        ctx.dispatch(new SaveAnswerSuccess(savedAnswer));
      }),
      catchError(error => {
        return ctx.dispatch(new SaveAnswerFailure(error));
      })
    );
  }
}