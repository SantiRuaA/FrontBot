import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError, of } from 'rxjs';
import { Norm } from '../../shared/models/norm.model';
import { NormService } from '../../core/services/norm.service'; // Asegúrate que la ruta sea correcta
import { LoadNorms, LoadNormsSuccess, LoadNormsFailure, CreateNorm, CreateNormSuccess, CreateNormFailure } from './norm.actions';

export interface NormStateModel {
  norms: Norm[];
  loading: boolean;
  error: string | null;
}

@State<NormStateModel>({
  name: 'norm',
  defaults: {
    norms: [],
    loading: false,
    error: null,
  },
})
@Injectable()
export class NormState {
  constructor(private normService: NormService) {}

  @Selector()
  static norms(state: NormStateModel): Norm[] {
    return state.norms;
  }

  @Selector()
  static loading(state: NormStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: NormStateModel): string | null {
    return state.error;
  }

  @Action(LoadNorms)
  loadNorms(ctx: StateContext<NormStateModel>) {
    ctx.patchState({ loading: true, error: null });
    return this.normService.getNorms().pipe(
      tap((result) => {
        ctx.dispatch(new LoadNormsSuccess(result));
      }),
      catchError((error) => {
        ctx.dispatch(new LoadNormsFailure('Fallo al cargar las normas'));
        return of(error);
      })
    );
  }

  @Action(LoadNormsSuccess)
  loadNormsSuccess(ctx: StateContext<NormStateModel>, { norms }: LoadNormsSuccess) {
    ctx.patchState({
      norms: norms,
      loading: false,
    });
  }

  @Action(LoadNormsFailure)
  loadNormsFailure(ctx: StateContext<NormStateModel>, { error }: LoadNormsFailure) {
    ctx.patchState({
      loading: false,
      error: error,
    });
  }

  @Action(CreateNorm)
  createNorm(ctx: StateContext<NormStateModel>, { payload }: CreateNorm) {
    ctx.patchState({ loading: true });
    return this.normService.createNorm(payload).pipe(
      tap(newNorm => ctx.dispatch(new CreateNormSuccess(newNorm))),
      catchError(error => ctx.dispatch(new CreateNormFailure(error)))
    );
  }

  @Action(CreateNormSuccess)
  createNormSuccess(ctx: StateContext<NormStateModel>, { norm }: CreateNormSuccess) {
    const state = ctx.getState();
    ctx.patchState({
      norms: [...state.norms, norm],
      loading: false
    });
  }

  @Action(CreateNormFailure)
  createNormFailure(ctx: StateContext<NormStateModel>, { error }: CreateNormFailure) {
    ctx.patchState({ error, loading: false });
  }
}