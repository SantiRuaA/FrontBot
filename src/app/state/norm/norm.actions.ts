import { Norm } from '../../shared/models/norm.model';

export class LoadNorms {
  static readonly type = '[Norm] Load Norms';
}

export class LoadNormsSuccess {
  static readonly type = '[Norm] Load Norms Success';
  constructor(public norms: Norm[]) {}
}

export class LoadNormsFailure {
  static readonly type = '[Norm] Load Norms Failure';
  constructor(public error: string) {}
}

export class CreateNorm {
  static readonly type = '[Norm] Create Norm';
  constructor(public payload: Partial<Norm>) {}
}

export class CreateNormSuccess {
  static readonly type = '[Norm] Create Norm Success';
  constructor(public norm: Norm) {}
}

export class CreateNormFailure {
  static readonly type = '[Norm] Create Norm Failure';
  constructor(public error: any) {}
}

export class UpdateNorm {
  static readonly type = '[Norm] Update Norm';
  constructor(public id: string, public payload: Partial<Norm>) {}
}

export class UpdateNormSuccess {
  static readonly type = '[Norm] Update Norm Success';
  constructor(public norm: Norm) {}
}

export class UpdateNormFailure {
  static readonly type = '[Norm] Update Norm Failure';
  constructor(public error: string) {}
}