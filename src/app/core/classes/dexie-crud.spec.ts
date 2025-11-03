import Dexie from 'dexie';
import { DexieCrud } from './dexie-crud';

describe('DexieCrud', () => {
  let db: Dexie;
  let table: Dexie.Table<TestItem, number>;
  let crud: DexieCrud<TestItem, number>;

  interface TestItem {
    id: number;
    name: string;
    value: number;
    category?: string;
  }

  beforeEach(async () => {
    // Create a test database
    db = new Dexie('TestDatabase');
    db.version(1).stores({
      testItems: '++id, name, value, category'
    });

    table = db.table('testItems');
    crud = new DexieCrud<TestItem, number>(table);

    // Clear the table before each test
    await table.clear();
  });

  afterEach(async () => {
    await db.delete();
  });

  it('should create an instance', () => {
    expect(crud).toBeTruthy();
  });

  describe('AddAsync', () => {
    it('should add a single item to the database', async () => {
      const item: TestItem = { id: 1, name: 'Test', value: 100 };
      await crud.AddAsync(item);

      const result = await table.toArray();
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Test');
      expect(result[0].value).toBe(100);
    });

    it('should add multiple items individually', async () => {
      await crud.AddAsync({ id: 1, name: 'First', value: 10 });
      await crud.AddAsync({ id: 2, name: 'Second', value: 20 });

      const result = await table.toArray();
      expect(result.length).toBe(2);
    });
  });

  describe('AddBulkAsync', () => {
    it('should add multiple items in bulk', async () => {
      const items: TestItem[] = [
        { id: 1, name: 'Item1', value: 10 },
        { id: 2, name: 'Item2', value: 20 },
        { id: 3, name: 'Item3', value: 30 }
      ];

      await crud.AddBulkAsync(items);

      const result = await table.toArray();
      expect(result.length).toBe(3);
    });

    it('should handle large batches over 1000 items', async () => {
      const items: TestItem[] = [];
      for (let i = 1; i <= 2500; i++) {
        items.push({ id: i, name: `Item${i}`, value: i });
      }

      await crud.AddBulkAsync(items);

      const result = await table.toArray();
      expect(result.length).toBe(2500);
    });

    it('should handle empty array', async () => {
      await crud.AddBulkAsync([]);
      const result = await table.toArray();
      expect(result.length).toBe(0);
    });
  });

  describe('AddOrEditAsync', () => {
    it('should add a new item if it does not exist', async () => {
      const item: TestItem = { id: 1, name: 'New Item', value: 100 };
      await crud.AddOrEditAsync(item);

      const result = await table.toArray();
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('New Item');
    });

    it('should update an existing item', async () => {
      await crud.AddAsync({ id: 1, name: 'Original', value: 50 });
      await crud.AddOrEditAsync({ id: 1, name: 'Updated', value: 150 });

      const result = await table.get(1);
      expect(result?.name).toBe('Updated');
      expect(result?.value).toBe(150);
    });
  });

  describe('AddOrEditBulkAsync', () => {
    it('should add and update multiple items in bulk', async () => {
      await crud.AddAsync({ id: 1, name: 'Existing', value: 100 });

      const items: TestItem[] = [
        { id: 1, name: 'Updated', value: 200 },
        { id: 2, name: 'New', value: 300 }
      ];

      await crud.AddOrEditBulkAsync(items);

      const result = await table.toArray();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Updated');
      expect(result[1].name).toBe('New');
    });

    it('should handle large batches over 1000 items', async () => {
      const items: TestItem[] = [];
      for (let i = 1; i <= 2500; i++) {
        items.push({ id: i, name: `Item${i}`, value: i });
      }

      await crud.AddOrEditBulkAsync(items);

      const result = await table.toArray();
      expect(result.length).toBe(2500);
    });
  });

  describe('UpdateAsync', () => {
    it('should update specific fields of an existing item', async () => {
      await crud.AddAsync({ id: 1, name: 'Original', value: 100 });
      await crud.UpdateAsync(1, { name: 'Modified' });

      const result = await table.get(1);
      expect(result?.name).toBe('Modified');
      expect(result?.value).toBe(100);
    });

    it('should update multiple fields', async () => {
      await crud.AddAsync({ id: 1, name: 'Test', value: 50, category: 'A' });
      await crud.UpdateAsync(1, { name: 'Updated', value: 150 });

      const result = await table.get(1);
      expect(result?.name).toBe('Updated');
      expect(result?.value).toBe(150);
      expect(result?.category).toBe('A');
    });
  });

  describe('RemoveAsync', () => {
    it('should remove a single item by id', async () => {
      await crud.AddAsync({ id: 1, name: 'ToDelete', value: 100 });
      await crud.AddAsync({ id: 2, name: 'ToKeep', value: 200 });

      await crud.RemoveAsync(1);

      const result = await table.toArray();
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(2);
    });

    it('should not throw when removing non-existent item', async () => {
      await expectAsync(crud.RemoveAsync(999)).toBeResolved();
    });
  });

  describe('RemoveBulkAsync', () => {
    it('should remove multiple items by ids', async () => {
      await crud.AddBulkAsync([
        { id: 1, name: 'Item1', value: 10 },
        { id: 2, name: 'Item2', value: 20 },
        { id: 3, name: 'Item3', value: 30 },
        { id: 4, name: 'Item4', value: 40 }
      ]);

      await crud.RemoveBulkAsync([1, 3]);

      const result = await table.toArray();
      expect(result.length).toBe(2);
      expect(result.map(r => r.id)).toEqual([2, 4]);
    });

    it('should handle empty array', async () => {
      await crud.AddAsync({ id: 1, name: 'Item', value: 10 });
      await crud.RemoveBulkAsync([]);

      const result = await table.toArray();
      expect(result.length).toBe(1);
    });
  });

  describe('RemoveAllAsync', () => {
    it('should remove all items from the table', async () => {
      await crud.AddBulkAsync([
        { id: 1, name: 'Item1', value: 10 },
        { id: 2, name: 'Item2', value: 20 },
        { id: 3, name: 'Item3', value: 30 }
      ]);

      await crud.RemoveAllAsync();

      const result = await table.toArray();
      expect(result.length).toBe(0);
    });

    it('should work on empty table', async () => {
      await crud.RemoveAllAsync();
      const result = await table.toArray();
      expect(result.length).toBe(0);
    });
  });

  describe('getAll', () => {
    beforeEach(async () => {
      await crud.AddBulkAsync([
        { id: 1, name: 'Alpha', value: 10, category: 'A' },
        { id: 2, name: 'Beta', value: 20, category: 'B' },
        { id: 3, name: 'Gamma', value: 30, category: 'A' }
      ]);
    });

    it('should get all items when no filter is provided', async () => {
      const result = await crud.getAll();
      expect(result.length).toBe(3);
    });

    it('should filter items using filterDelegate', async () => {
      const result = await crud.getAll(
        (table) => table.where('category').equals('A')
      );
      expect(result.length).toBe(2);
      expect(result[0].category).toBe('A');
      expect(result[1].category).toBe('A');
    });

    it('should return empty array when no items match filter', async () => {
      const result = await crud.getAll(
        (table) => table.where('category').equals('C')
      );
      expect(result.length).toBe(0);
    });
  });

  describe('getById', () => {
    it('should get a single item by id', async () => {
      await crud.AddAsync({ id: 5, name: 'FindMe', value: 555 });

      const result = await crud.getById(5);
      expect(result).toBeDefined();
      expect(result?.name).toBe('FindMe');
      expect(result?.value).toBe(555);
    });

    it('should return undefined for non-existent id', async () => {
      const result = await crud.getById(999);
      expect(result).toBeUndefined();
    });
  });

  describe('getFirst', () => {
    beforeEach(async () => {
      await crud.AddBulkAsync([
        { id: 1, name: 'First', value: 10, category: 'A' },
        { id: 2, name: 'Second', value: 20, category: 'A' },
        { id: 3, name: 'Third', value: 30, category: 'B' }
      ]);
    });

    it('should get the first item matching the filter', async () => {
      const result = await crud.getFirst(
        (table) => table.where('category').equals('A')
      );
      expect(result).toBeDefined();
      expect(result?.category).toBe('A');
    });

    it('should return undefined when no items match', async () => {
      const result = await crud.getFirst(
        (table) => table.where('category').equals('Z')
      );
      expect(result).toBeUndefined();
    });
  });

  describe('getLast', () => {
    beforeEach(async () => {
      await crud.AddBulkAsync([
        { id: 1, name: 'First', value: 10, category: 'A' },
        { id: 2, name: 'Second', value: 20, category: 'A' },
        { id: 3, name: 'Third', value: 30, category: 'B' }
      ]);
    });

    it('should get the last item matching the filter', async () => {
      const result = await crud.getLast(
        (table) => table.where('category').equals('A')
      );
      expect(result).toBeDefined();
      expect(result?.category).toBe('A');
    });

    it('should return undefined when no items match', async () => {
      const result = await crud.getLast(
        (table) => table.where('category').equals('Z')
      );
      expect(result).toBeUndefined();
    });
  });

  describe('filterAll', () => {
    beforeEach(async () => {
      await crud.AddBulkAsync([
        { id: 1, name: 'Apple', value: 10 },
        { id: 2, name: 'Banana', value: 20 },
        { id: 3, name: 'Cherry', value: 30 },
        { id: 4, name: 'Apricot', value: 15 }
      ]);
    });

    it('should filter items using a custom function', async () => {
      const result = await crud.filterAll((item) => item.value > 15);
      expect(result.length).toBe(2);
      expect(result[0].value).toBeGreaterThan(15);
      expect(result[1].value).toBeGreaterThan(15);
    });

    it('should filter using complex conditions', async () => {
      const result = await crud.filterAll(
        (item) => item.name.startsWith('A') && item.value < 20
      );
      expect(result.length).toBe(2);
      expect(result.every(r => r.name.startsWith('A'))).toBe(true);
      expect(result.every(r => r.value < 20)).toBe(true);
    });

    it('should return empty array when no items match', async () => {
      const result = await crud.filterAll((item) => item.value > 1000);
      expect(result.length).toBe(0);
    });

    it('should return all items when filter always returns true', async () => {
      const result = await crud.filterAll(() => true);
      expect(result.length).toBe(4);
    });
  });
});
