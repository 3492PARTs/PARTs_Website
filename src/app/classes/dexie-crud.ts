import Dexie, { Collection, IndexableType, PromiseExtended, UpdateSpec } from "dexie";
import { IFilterDelegate } from "../models/dexie.models";

export class DexieCrud<T, Tkey> {
    dbSet: Dexie.Table<T, Tkey>;

    constructor(dbSet: Dexie.Table<T, Tkey>) {
        this.dbSet = dbSet;
    }

    getAll(filterDelegate: IFilterDelegate | undefined = undefined): PromiseExtended<T[]> {
        if (!!filterDelegate) {
            return this.filterDB(filterDelegate).toArray();
        }
        return this.dbSet.toArray();
    }

    getFirst(filterDelegate: IFilterDelegate): PromiseExtended<T | undefined> {
        return this.filterDB(filterDelegate).first();
    }

    getLast(filterDelegate: IFilterDelegate): PromiseExtended<T | undefined> {
        return this.filterDB(filterDelegate).last();
    }

    getById(id: Tkey) {
        return this.dbSet.get(id);
    }

    private filterDB(filterDelegate: IFilterDelegate): Collection<T, IndexableType, T> {
        return filterDelegate(this.dbSet);
    }

    async AddAsync(item: T): Promise<void> {
        await this.dbSet.add(item);
    }

    async AddOrEditAsync(item: T): Promise<void> {
        await this.dbSet.put(item);
    }

    async AddBulkAsync(items: T[]) {
        const batchSize = 1000;
        let processed = 0;

        while (processed < items.length) {
            const batch = items.slice(processed, processed + batchSize);
            await this.dbSet.bulkPut(batch);
            processed += batchSize;
        }
    }

    async UpdateAsync(id: Tkey, changes: UpdateSpec<T>): Promise<void> {
        await this.dbSet.update(id, changes);
    }

    async RemoveAsync(id: Tkey): Promise<void> {
        await this.dbSet.delete(id);
    }

    async RemoveRangeAsync(ids: Tkey[]): Promise<void> {
        await this.dbSet.bulkDelete(ids);
    }

    async RemoveAllAsync(): Promise<void> {
        await this.dbSet.clear();
    }
}