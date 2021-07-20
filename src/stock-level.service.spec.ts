import { StockLevelRepository } from "./repositories/stock-level-repository.service";
import { StockLevelService } from "./stock-level.service"
import { instance, mock, when } from 'ts-mockito';
import { TransactionRepository } from "./repositories/transaction-repository.service";
import { StockLevel, Transaction, TransactionType } from "./types";

describe('StockLevelService', () => {

  let service: StockLevelService;

  const mockStockLevelRepository = mock(StockLevelRepository)
  const mockTransactionRepository = mock(TransactionRepository)

  beforeEach(() => {
    service = new StockLevelService(
      instance(mockStockLevelRepository),
      instance(mockTransactionRepository),
    );
  })

  describe('getStockLevel', () => {
    it('should return 0 as quantity for sku if stocklevel is 0 and total transactions add up to 0.', async () => {
      when(mockStockLevelRepository.getStockLevels()).thenResolve([
        {
          "sku": "FKO136294/98/95",
          "stock": 0
        },
      ]);

      when(mockTransactionRepository.getTransactions()).thenResolve([
        {
          "sku": "FKO136294/98/95",
          "type": TransactionType.Order,
          "qty": 0
        },
      ]);

      const result = await service.getStockLevel('FKO136294/98/95');
    
      expect(result).toEqual({ sku: 'FKO136294/98/95', qty: 0 });
    });

    it('should return 0 as quantity for sku if stocklevel is 0 and there are no transactions for sku.', async () => {
      when(mockStockLevelRepository.getStockLevels()).thenResolve([
        {
          "sku": "FKO136294/98/95",
          "stock": 0
        },
      ]);

      when(mockTransactionRepository.getTransactions()).thenResolve([]);

      const result = await service.getStockLevel('FKO136294/98/95');
    
      expect(result).toEqual({ sku: 'FKO136294/98/95', qty: 0 });
    });

    it('should throw an error if there are no stock levels or transactions.', async () => {
      when(mockStockLevelRepository.getStockLevels()).thenResolve([]);

      when(mockTransactionRepository.getTransactions()).thenResolve([]);

      try {
        await service.getStockLevel('LTV719449/39/39');
        fail();
      } catch(error) {
        expect(error.message).toEqual('Error: Sku not found.');
      }
    });

    it('should throw an error if there are no stock levels or transactions.', async () => {
      when(mockStockLevelRepository.getStockLevels()).thenResolve([]);

      when(mockTransactionRepository.getTransactions()).thenResolve([]);

      try {
        await service.getStockLevel('LTV719449/39/39');
        fail();
      } catch(error) {
        expect(error.message).toEqual('Error: Sku not found.');
      }
    });

    it('should throw an error if the specified sku does not exist in both transactions or stock levels.', async () => {
      when(mockStockLevelRepository.getStockLevels()).thenResolve([
        {
          "sku": "FKO136294/98/95",
          "stock": 100
        },
      ]);

      when(mockTransactionRepository.getTransactions()).thenResolve([
        {
          "sku": "FKO136294/98/95",
          "type": TransactionType.Order,
          "qty": 2
        },
      ]);

      try {
        await service.getStockLevel('LTV719449/39/39');
        fail();
      } catch(error) {
        expect(error.message).toEqual('Error: Sku not found.');
      }
    });

    it('should not throw an error if the sku is in both transations and stock levels.', async () => {
      when(mockStockLevelRepository.getStockLevels()).thenResolve([
        {
          "sku": "LTV719449/39/39",
          "stock": 1,
        },
      ]);
      when(mockTransactionRepository.getTransactions()).thenResolve([
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Refund,
          "qty": 1
        },
      ]);

      const result = await service.getStockLevel('LTV719449/39/39');
      expect(result).toBeDefined();
    });

    it('should not throw an error if the transactions contains the specified sku.', async () => {
      when(mockStockLevelRepository.getStockLevels()).thenResolve([
        {
          "sku": "LTV719449/39/39",
          "stock": 1,
        },
      ]);
      when(mockTransactionRepository.getTransactions()).thenResolve([]);

      let result;

      try {
        result = await service.getStockLevel('LTV719449/39/39');
      } catch(error) {
        fail();
      }

      expect(result).toBeDefined();
    });

    it('should not throw an error if the stock levels contains the specified sku.', async () => {
      when(mockStockLevelRepository.getStockLevels()).thenResolve([]);
      when(mockTransactionRepository.getTransactions()).thenResolve([
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Refund,
          "qty": 1
        },
      ]);

      let result;

      try {
        result = await service.getStockLevel('LTV719449/39/39');
      } catch(error) {
        fail();
      }

      expect(result).toBeDefined();
    });

    it('the stock level should increase if all transactions are refunds.', async () => {
      const mockTransactionData: Transaction[] = [
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Refund,
          "qty": 1
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Refund,
          "qty": 1
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Refund,
          "qty": 1
        }
      ];

      const mockStockData: StockLevel[] = [
        {
          "sku": "LTV719449/39/39",
          "stock": 100
        },
      ];

      when(mockStockLevelRepository.getStockLevels()).thenResolve(mockStockData);
      when(mockTransactionRepository.getTransactions()).thenResolve(mockTransactionData);

      const result = await service.getStockLevel('LTV719449/39/39');

      expect(result).toEqual({ sku: 'LTV719449/39/39', qty: 103 });
    });

    it('the stock level should decrease if all transactions are orders.', async () => {
      const mockTransactionData: Transaction[] = [
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Order,
          "qty": 1
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Order,
          "qty": 1
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Order,
          "qty": 1
        }
      ];

      const mockStockData: StockLevel[] = [
        {
          "sku": "LTV719449/39/39",
          "stock": 100
        },
      ];

      when(mockStockLevelRepository.getStockLevels()).thenResolve(mockStockData);
      when(mockTransactionRepository.getTransactions()).thenResolve(mockTransactionData);

      const result = await service.getStockLevel('LTV719449/39/39');

      expect(result).toEqual({ sku: 'LTV719449/39/39', qty: 97 });
    });

    it('should calculate the total stock sold correctly when dealing with a mixture of refunds and orders.', async () => {
      const mockTransactionData: Transaction[] = [
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Order,
          "qty": 1
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Refund,
          "qty": 1
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Order,
          "qty": 1
        }
      ];

      const mockStockData: StockLevel[] = [
        {
          "sku": "LTV719449/39/39",
          "stock": 100
        },
      ];

      when(mockStockLevelRepository.getStockLevels()).thenResolve(mockStockData);
      when(mockTransactionRepository.getTransactions()).thenResolve(mockTransactionData);

      const result = await service.getStockLevel('LTV719449/39/39');

      expect(result).toEqual({ sku: 'LTV719449/39/39', qty: 99 });
    });

    it('should only process transactions for the given sku.', async () => {
      const mockTransactionData: Transaction[] = [
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Order,
          "qty": 1
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Refund,
          "qty": 1
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Order,
          "qty": 1
        },
        {
          "sku": "FKO136294/98/95",
          "type": TransactionType.Order,
          "qty": 10
        },
        {
          "sku": "FKO136294/98/95",
          "type": TransactionType.Refund,
          "qty": 2
        },
      ];

      const mockStockData: StockLevel[] = [
        {
          "sku": "LTV719449/39/39",
          "stock": 100
        },
        {
          "sku": "FKO136294/98/95",
          "stock": 100
        },
      ];

      when(mockStockLevelRepository.getStockLevels()).thenResolve(mockStockData);
      when(mockTransactionRepository.getTransactions()).thenResolve(mockTransactionData);

      const result = await service.getStockLevel('LTV719449/39/39');

      expect(result).toEqual({ sku: 'LTV719449/39/39', qty: 99 });
    });

    it('should return the original stock level unchanged if there are not associated transactions.', async () => {
      const mockTransactionData: Transaction[] = [];

      const mockStockData: StockLevel[] = [
        {
          "sku": "LTV719449/39/39",
          "stock": 10
        },
      ];

      when(mockStockLevelRepository.getStockLevels()).thenResolve(mockStockData);
      when(mockTransactionRepository.getTransactions()).thenResolve(mockTransactionData);

      const result = await service.getStockLevel('LTV719449/39/39');

      expect(result).toEqual({ sku: 'LTV719449/39/39', qty: 10 });
    });

    it('should assume a starting quantity of 0 for skus not present in stock.json.', async () => {
      const mockTransactionData: Transaction[] = [
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Refund,
          "qty": 1
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Refund,
          "qty": 1
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Refund,
          "qty": 1
        }
      ];

      const mockStockData: StockLevel[] = [];

      when(mockStockLevelRepository.getStockLevels()).thenResolve(mockStockData);
      when(mockTransactionRepository.getTransactions()).thenResolve(mockTransactionData);

      const result = await service.getStockLevel('LTV719449/39/39');

      expect(result).toEqual({ sku: 'LTV719449/39/39', qty: 3 });
    });

    it('should throw an error if orders exceed stock levels available.', async () => {
      const mockTransactionData: Transaction[] = [
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Order,
          "qty": 1
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Order,
          "qty": 1
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Order,
          "qty": 1
        }
      ];

      const mockStockData: StockLevel[] = [
        {
          "sku": "LTV719449/39/39",
          "stock": 1
        },
      ];

      when(mockStockLevelRepository.getStockLevels()).thenResolve(mockStockData);
      when(mockTransactionRepository.getTransactions()).thenResolve(mockTransactionData);

      try {
        await service.getStockLevel('LTV719449/39/39');
        fail();
      } catch(error) {
        expect(error.message).toEqual('Error: No stock available to fulfill orders.');
      }
    });

    it('the stock level should not change if there are equal refund quantities to order quantities.', async () => {
      const mockTransactionData: Transaction[] = [
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Order,
          "qty": 2
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Order,
          "qty": 2
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Refund,
          "qty": 2
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Refund,
          "qty": 2
        }
      ];

      const mockStockData: StockLevel[] = [
        {
          "sku": "LTV719449/39/39",
          "stock": 1
        },
      ];

      when(mockStockLevelRepository.getStockLevels()).thenResolve(mockStockData);
      when(mockTransactionRepository.getTransactions()).thenResolve(mockTransactionData);

      const result = await service.getStockLevel('LTV719449/39/39');

      expect(result).toEqual({ sku: 'LTV719449/39/39', qty: 1 });
    });

    it('the stock level should increase if there are more refunds than orders.', async () => {
      const mockTransactionData: Transaction[] = [
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Order,
          "qty": 2
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Order,
          "qty": 2
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Refund,
          "qty": 4
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Refund,
          "qty": 4
        }
      ];

      const mockStockData: StockLevel[] = [
        {
          "sku": "LTV719449/39/39",
          "stock": 1
        },
      ];

      when(mockStockLevelRepository.getStockLevels()).thenResolve(mockStockData);
      when(mockTransactionRepository.getTransactions()).thenResolve(mockTransactionData);

      const result = await service.getStockLevel('LTV719449/39/39');

      expect(result).toEqual({ sku: 'LTV719449/39/39', qty: 5 });
    });

    it('the stock level should decrease if there are more orders than refunds.', async () => {
      const mockTransactionData: Transaction[] = [
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Order,
          "qty": 4
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Order,
          "qty": 4
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Refund,
          "qty": 2
        },
        {
          "sku": "LTV719449/39/39",
          "type": TransactionType.Refund,
          "qty": 2
        }
      ];

      const mockStockData: StockLevel[] = [
        {
          "sku": "LTV719449/39/39",
          "stock": 5
        },
      ];

      when(mockStockLevelRepository.getStockLevels()).thenResolve(mockStockData);
      when(mockTransactionRepository.getTransactions()).thenResolve(mockTransactionData);

      const result = await service.getStockLevel('LTV719449/39/39');

      expect(result).toEqual({ sku: 'LTV719449/39/39', qty: 1 });
    });
  });
});