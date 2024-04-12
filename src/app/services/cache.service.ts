import { Injectable } from '@angular/core';
import { DexieCrud } from '../classes/dexie-crud';
import { IScoutFieldResponse } from '../models/scouting.models';
import { AppDatabaseService } from './app-database.service';
import { IUser } from '../models/user.models';
import { LoadedStores } from '../models/idb.store.model';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  ScoutFieldResponse!: DexieCrud<IScoutFieldResponse, number>;
  User!: DexieCrud<IUser, number>;
  LoadedStores!: DexieCrud<LoadedStores, number>;

  constructor(private appDB: AppDatabaseService) {
    this.ScoutFieldResponse = new DexieCrud<IScoutFieldResponse, number>(this.appDB.ScoutFieldResponseTable);
    this.User = new DexieCrud<IUser, number>(this.appDB.UserTable);
    this.LoadedStores = new DexieCrud<LoadedStores, number>(this.appDB.LoadedStoresTable);
  }
}
