import { Injectable } from '@angular/core';
import { DexieCrud } from '../classes/dexie-crud';
import { IScoutFieldResponse } from '../models/scouting.models';
import { AppDatabaseService } from './app-database.service';
import { IUser } from '../models/user.models';
import { LoadedStores } from '../models/idb.store.model';
import { IUserLinks } from '../models/navigation.models';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  User!: DexieCrud<IUser, number>;
  UserLinks!: DexieCrud<IUserLinks, number>;

  ScoutFieldResponse!: DexieCrud<IScoutFieldResponse, number>;

  LoadedStores!: DexieCrud<LoadedStores, number>;

  constructor(private appDB: AppDatabaseService) {
    this.User = new DexieCrud<IUser, number>(this.appDB.UserTable);
    this.UserLinks = new DexieCrud<IUserLinks, number>(this.appDB.UserLinksTable);

    this.ScoutFieldResponse = new DexieCrud<IScoutFieldResponse, number>(this.appDB.ScoutFieldResponseTable);

    this.LoadedStores = new DexieCrud<LoadedStores, number>(this.appDB.LoadedStoresTable);
  }
}
