import { Service } from "typedi";
import { StockLevelRepository } from "./repositories/stock-level-repository.service";
import { TransactionRepository } from "./repositories/transaction-repository.service";
import { Sku, StockLevel, Transaction, TransactionType } from "./types";

@Service()
export class StockLevelService {

  constructor(
    private stockLevelRepository: StockLevelRepository,
    private transactionsRepostiory: TransactionRepository,
  ) {}

  /**
   * Determines quantity of stock available for given sku.
   * @param {string} sku
   * @returns { sku: string, qty: number }
   */
  public async getStockLevel(sku: string): Promise<{ sku: string, qty: number }> {
    const [stockLevels, transactions] = await this.getData();

    const currentStockLevel = this.getCurrentStockLevel(stockLevels, sku);

    const quantitySold = this.getTotalQuantityFromTransactions(transactions, sku);

    if(!currentStockLevel && !quantitySold) {
      throw new Error('Error: Sku not found.');
    }

    return { sku, qty: this.calculateRemainingStock(currentStockLevel || 0, quantitySold ||  0) };
  }

  /**
   * Process the transactions to determine the total quantity of of items that match the given sky.
   * @param {Transaction[]} transactions
   * @param {Sku} sku
   * @returns {number | undefined} returns undefined when there are no transactions referencing provided sku.
   */
  private getTotalQuantityFromTransactions(transactions: Transaction[], sku: Sku): number | undefined {
    const transactionsBySku = transactions.filter(t => t.sku === sku);

    if (!transactionsBySku.length) return undefined;

    return transactionsBySku.map(transaction => {
      return (transaction.type === TransactionType.Refund) ? -(transaction.qty) : transaction.qty;
    }).reduce((prev, current) => prev + current);
  }

  /**
   * Finds the stock level associated with the given sku.
   * @param {StockLevel[]} stockLevels
   * @param {Sku} sku
   * @returns {number | undefined} undefined returned if there is no stock level for the provided sku.
   */
  private getCurrentStockLevel(stockLevels: StockLevel[], sku: Sku): number | undefined {
    return stockLevels.find(stockLevel => stockLevel.sku === sku)?.stock;
  }

  /**
   * Calculates the remaing stock, throwing an error if the new quantity is negative.
   * @param stockLevel
   * @param totalSold
   * @returns {number}
   */
  private calculateRemainingStock(stockLevel: number, totalSold: number): number {
    const calculatedTotal = stockLevel - totalSold;

    if (calculatedTotal < 0) throw Error('Error: No stock available to fulfill orders.');

    return calculatedTotal;
  }

  /**
   * Retrieves stock level and transaction data.
   * @returns {Promise<[StockLevel[], Transaction[]]>}
   */
  private async getData(): Promise<[StockLevel[], Transaction[]]> {
    return await Promise.all([
      this.stockLevelRepository.getStockLevels(),
      this.transactionsRepostiory.getTransactions(),
    ]);
  }
}