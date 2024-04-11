import { Injectable } from '@angular/core';
import { DexieCrud } from '../classes/dexie-crud';
import { IScoutFieldResponse } from '../models/scouting.models';
import { AppDatabaseService } from './app-database.service';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  ScoutFieldResponse!: DexieCrud<IScoutFieldResponse, number>;

  constructor(private appDB: AppDatabaseService) {
    this.ScoutFieldResponse = new DexieCrud<IScoutFieldResponse, number>(this.appDB.ScoutFieldResponseTable);
  }
}
