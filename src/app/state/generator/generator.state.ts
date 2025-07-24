import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError, of } from 'rxjs';
import { Item } from '../../chatbot/items/items.component';
import { ChatService } from '../../core/services/chat.service';
import { GenerateItems, GenerateItemsSuccess, GenerateItemsFailure } from './generator.actions';

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
  constructor(private chatService: ChatService) {}

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
}