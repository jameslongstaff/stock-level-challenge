interface Flavoring<FlavorT> {
  _type?: FlavorT;
}

export type Flavor<T, FlavorT> = T & Flavoring<FlavorT>;

export type StringId<IdType = 'StringId'> = Flavor<string, IdType>;

export type Sku = StringId<'Sku'>

export enum TransactionType {
  Order = 'order',
  Refund = 'refund',
}

export interface StockLevel {
  sku: Sku,
  stock: number;
}

export interface Transaction {
  sku: Sku,
  type: TransactionType,
  qty: number,
}