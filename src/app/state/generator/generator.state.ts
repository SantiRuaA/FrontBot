import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { State, Action, StateContext, Selector, Store, Actions, ofActionSuccessful } from '@ngxs/store';
import { tap, catchError, of, switchMap, take } from 'rxjs';
import { Item } from '../../chatbot/items/items.component';
import { ChatService } from '../../core/services/chat.service';
import { 
  GenerateItems, 
  AddGeneratedItems, 
  GenerateItemsFailure,
  ClearGeneratedItems,
  SaveAnswer,
  SaveAnswerSuccess,
  SaveAnswerFailure,
  ToggleItemCollapse,
  RestoreGeneratedItems
} from './generator.actions';
import { NotificationService } from '../../core/services/notification.service';
import { AnswerService, AnswerPayload } from '../../core/services/answer.service';
import { AuthState } from '../auth/auth.state';
import { AddDocument } from '../document/document.actions';
import { Document } from '../../shared/models/document.model';
import { User } from '../../shared/models/user.model';
import { LoadUsers, LoadUsersSuccess } from '../user/user.actions';

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
    private notificationService: NotificationService,
    private store: Store,
    private actions$: Actions,
    @Inject(PLATFORM_ID) private platformId: object
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
  generateItems(ctx: StateContext<GeneratorStateModel>, { prompt }: GenerateItems) {
    ctx.patchState({ loading: true, error: null });
    const finalPrompt = `${prompt} Al inicio de cada pregunta, genera un título corto y descriptivo de máximo 5 palabras, seguido del separador '|||TITLE|||' y luego el contenido de la pregunta. IMPORTANTE: Para las preguntas de selección múltiple, formatea cada opción (a, b, c, etc.) en una línea nueva. Al final de todas las opciones, indica la respuesta correcta en una nueva línea separada, por ejemplo: 'Respuesta correcta: c)'.`;
    return this.chatService.generateResponse(finalPrompt).pipe(
      tap((response) => {
        const responseParts = response.response.split('---###---');
        const newItems: Item[] = responseParts
          .map(part => part.trim())
          .filter(part => part.length > 0)
          .map((part: string, index: number) => {
            const [title, content] = part.split('|||TITLE|||');
            return {
              tempId: `item-${Date.now()}-${index}`,
              title: content ? title.trim() : 'Pregunta Generada',
              content: content ? content.trim() : title.trim(),
              createdDate: new Date().toLocaleDateString('es-CO'),
              isSaved: false,
              isCollapsed: false,
            };
          });
        ctx.dispatch(new AddGeneratedItems(newItems));
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Error al comunicarse con la IA.';
        ctx.dispatch(new GenerateItemsFailure(errorMessage));
        return of(error);
      })
    );
  }

  @Action(AddGeneratedItems)
  addGeneratedItems(ctx: StateContext<GeneratorStateModel>, { items }: AddGeneratedItems) {
    const state = ctx.getState();
    const newItems = [...items, ...state.generatedItems];
    ctx.patchState({
      generatedItems: newItems,
      loading: false,
    });
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('generatedItems', JSON.stringify(newItems));
    }
  }
  
  @Action(ClearGeneratedItems)
  clearGeneratedItems(ctx: StateContext<GeneratorStateModel>) {
    ctx.patchState({ generatedItems: [] });
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('generatedItems');
    }
  }

  @Action(RestoreGeneratedItems)
  restoreGeneratedItems(ctx: StateContext<GeneratorStateModel>) {
    if (isPlatformBrowser(this.platformId)) {
      const storedItems = sessionStorage.getItem('generatedItems');
      if (storedItems) {
        try {
          const items: Item[] = JSON.parse(storedItems);
          ctx.patchState({ generatedItems: items });
        } catch (e) {
          sessionStorage.removeItem('generatedItems');
        }
      }
    }
  }

  @Action(GenerateItemsFailure)
  generateItemsFailure(ctx: StateContext<GeneratorStateModel>, { error }: GenerateItemsFailure) {
    ctx.patchState({ loading: false, error: error });
  }

  @Action(SaveAnswer)
  saveAnswer(ctx: StateContext<GeneratorStateModel>, { payload }: SaveAnswer) {
    const state = this.store.snapshot();
    const allUsers = state.user.allUsers;
    if (!allUsers || allUsers.length === 0) {
      return ctx.dispatch(new LoadUsers()).pipe(
        switchMap(() => this.actions$.pipe(ofActionSuccessful(LoadUsersSuccess), take(1))),
        switchMap(() => this.performSave(ctx, payload))
      );
    }
    return this.performSave(ctx, payload);
  }

  private performSave(ctx: StateContext<GeneratorStateModel>, payload: { content: string; tempId: string; title: string; }) {
    const authUser = this.store.selectSnapshot(AuthState.user);
    if (!authUser) {
      return ctx.dispatch(new SaveAnswerFailure('No hay un usuario autenticado.'));
    }
    const allUsers = this.store.snapshot().user.allUsers;
    const fullCurrentUser = allUsers.find((user: User) => user.email === authUser.email);
    if (!fullCurrentUser || !fullCurrentUser.id) {
      const errorMsg = 'No se pudo encontrar el ID del usuario.';
      return ctx.dispatch(new SaveAnswerFailure(errorMsg));
    }
    
    const fullContentToSave = `${payload.title} |||TITLE||| ${payload.content}`;
    const apiPayload: AnswerPayload = {
      content: fullContentToSave,
      title: payload.title,
      role: fullCurrentUser.role,
      userId: fullCurrentUser.id
    };

    return this.answerService.saveAnswer(apiPayload).pipe(
      tap((savedAnswerFromApi: Document) => {
        const completeDocument: Document = {
          ...savedAnswerFromApi,
          content: fullContentToSave,
          title: payload.title 
        };
        ctx.dispatch(new AddDocument(completeDocument));
        ctx.dispatch(new SaveAnswerSuccess(completeDocument, payload.tempId));
      }),
      catchError(error => {
        this.notificationService.show('Error al guardar la pregunta', 'is-danger');
        return ctx.dispatch(new SaveAnswerFailure(error));
      })
    );
  }

  @Action(SaveAnswerSuccess)
  saveAnswerSuccess(ctx: StateContext<GeneratorStateModel>, { savedAnswer, tempId }: SaveAnswerSuccess) {
    const state = ctx.getState();
    const updatedItems = state.generatedItems.map(item => 
      item.tempId === tempId ? { ...item, isSaved: true, title: savedAnswer.title } : item
    );
    ctx.patchState({ generatedItems: updatedItems });
    this.notificationService.show('Pregunta guardada con éxito');
  }

  @Action(ToggleItemCollapse)
  toggleItemCollapse(ctx: StateContext<GeneratorStateModel>, { tempId }: ToggleItemCollapse) {
    const state = ctx.getState();
    const updatedItems = state.generatedItems.map(item => {
      if (item.tempId === tempId) {
        return { ...item, isCollapsed: !item.isCollapsed };
      }
      return item;
    });
    ctx.patchState({ generatedItems: updatedItems });
  }
}
