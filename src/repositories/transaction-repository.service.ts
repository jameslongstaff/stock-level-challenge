import { Service } from "typedi";
import { Transaction } from "../types";

import fs from "fs"
import path from "path";

@Service()
export class TransactionRepository {

  private readonly dataDir = '../data';

  public async getTransactions(): Promise<Transaction[]> {
    const data = await fs.promises.readFile(`${path.join(__dirname, this.dataDir)}/transactions.json`, 'utf8');
    return JSON.parse(data);
  }
}