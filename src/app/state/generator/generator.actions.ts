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