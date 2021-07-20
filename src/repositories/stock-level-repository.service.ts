import { Service } from "typedi";
import { StockLevel } from "../types";

import fs from "fs"
import path from "path";

@Service()
export class StockLevelRepository {

  private readonly dataDir = '../data';

  public async getStockLevels(): Promise<StockLevel[]> {
    const data = await fs.promises.readFile(`${path.join(__dirname, this.dataDir)}/stock.json`, 'utf8');
    return JSON.parse(data);
  }
}