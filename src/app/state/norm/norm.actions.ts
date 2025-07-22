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