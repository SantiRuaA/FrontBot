import { Item } from '../../chatbot/items/items.component'; 

export class GenerateItems {
  static readonly type = '[Generator] Generate Items';
  constructor(public prompt: string, public title: string) {}
}

export class GenerateItemsSuccess {
  static readonly type = '[Generator] Generate Items Success';
  constructor(public newItem: Item) {}
}

export class GenerateItemsFailure {
  static readonly type = '[Generator] Generate Items Failure';
  constructor(public error: string) {}
}

export class SaveAnswer {
  static readonly type = '[Generator] Save Answer';
  constructor(public payload: { content: string }) {}
}

export class SaveAnswerSuccess {
  static readonly type = '[Generator] Save Answer Success';
  constructor(public savedAnswer: any) {}
}

export class SaveAnswerFailure {
  static readonly type = '[Generator] Save Answer Failure';
  constructor(public error: any) {}
}
