/** Entry point for testing the real data via ts-node */

import 'reflect-metadata';

import { StockLevelService } from "./stock-level.service";

import Container from "typedi";

const main = async () => {
  const stockLevelService = Container.get(StockLevelService);

  try {
    const result = await stockLevelService.getStockLevel('FKO136294/98/95');
    console.log(result);
  } catch(error) {
    console.log(error);
  }
}

main();
