import { Document } from '../../shared/models/document.model';

export class LoadDocuments {
  static readonly type = '[Document] Load Documents';
}

export class LoadDocumentsSuccess {
  static readonly type = '[Document] Load Documents Success';
  constructor(public documents: Document[]) {}
}

export class LoadDocumentsFailure {
  static readonly type = '[Document] Load Documents Failure';
  constructor(public error: any) {}
}

export class AddDocument {
  static readonly type = '[Document] Add Document';
  constructor(public document: Document) {}
}

export class ChangeDocumentPage {
  static readonly type = '[Document] Change Document Page';
  constructor(public page: number) {}
}

export class ToggleDocumentSelection {
  static readonly type = '[Document] Toggle Document Selection';
  constructor(public documentId: string) {}
}

export class FilterDocuments {
  static readonly type = '[Document] Filter Documents';
  constructor(public filter: string) {}
}
