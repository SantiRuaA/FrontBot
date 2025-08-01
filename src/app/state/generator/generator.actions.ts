import { Item } from '../../chatbot/items/items.component';

export class GenerateItems {
  static readonly type = '[Generator] Generate Items';
  constructor(public prompt: string) {}
}

export class AddGeneratedItems {
  static readonly type = '[Generator] Add Generated Items';
  constructor(public items: Item[]) {}
}

export class GenerateItemsFailure {
  static readonly type = '[Generator] Generate Items Failure';
  constructor(public error: string) {}
}

export class ClearGeneratedItems {
  static readonly type = '[Generator] Clear Generated Items';
}

export class SaveAnswer {
  static readonly type = '[Generator] Save Answer';
  constructor(public payload: { content: string; tempId: string; title: string; }) {}
}

export class SaveAnswerSuccess {
  static readonly type = '[Generator] Save Answer Success';
  constructor(public savedAnswer: any, public tempId: string) {}
}

export class SaveAnswerFailure {
  static readonly type = '[Generator] Save Answer Failure';
  constructor(public error: any) {}
}

export class RestoreGeneratedItems {
  static readonly type = '[Generator] Restore Generated Items';
}

export class ToggleItemCollapse {
  static readonly type = '[Generator] Toggle Item Collapse';
  constructor(public tempId: string) {}
}