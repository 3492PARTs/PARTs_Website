import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { IEntitySyncDTO } from '../models/dexie.models';
import { CacheService } from './cache.service';
import { APIService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private refreshSubject: Subject<IEntitySyncDTO> = new Subject();

  constructor(private cacheService: CacheService, private api: APIService) { }

  async get(loadingScreen: boolean, endpoint: string, params: { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> } | undefined = undefined, repo: string, filterDelegate: any = undefined,
    onNext?: (result: any) => void, onError?: (error: any) => void, onComplete?: () => Observable<any>,
  ) {
    return this.api.get(loadingScreen, endpoint, params, (result: any) => {
      if (onNext) onNext(result);
    }, async (error: any) => {

      let cacheData = await (this.cacheService as any)[repo].getAll(
        filterDelegate
      );
      if (onNext && cacheData && cacheData.length > 0) {
        onNext(cacheData);
      }
      else if (onError) onError(error);
    }, () => {
      if (onComplete) onComplete();
    });
  }


  /**
   *
   * @param repo Name of EntityRepo to be used
   * @param endpoint API Endpoint with API URL
   * @returns list of data fetched from api or cache
   */
  /*
  async getListAsync(
    repo: string,
    endpoint: string,
    filterDelegate: any = undefined
  ) {
    // get data from cache first if availble

    let cacheData = await (this.cacheService as any)[repo].getAll(
      filterDelegate
    );

    // if cache data is available then return the data
    let isCachedDataAvailable = cacheData?.length > 0;
    if (
      isCachedDataAvailable ||
      (!isCachedDataAvailable && (await this.isStoreLoaded(repo)))
    ) {
      return cacheData;
    }

    let apiData =
      chunkLoadStrategy === undefined
        ? await this.apiService.GetAll(endpoint).toPromise()
        : await this.apiService.GetAllChunks(endpoint, chunkLoadStrategy);
    if (apiData?.status) {
      // if API call was successful and there is any data then add the data to cache
      if (apiData?.response?.length > 0) {
        await (this.cacheService as any)[repo].AddBulkAsync(apiData?.response);
      }
      await this.loadClientDbStore(repo);
      if (!!filterDelegate) {
        return await (this.cacheService as any)[repo].getAll(filterDelegate);
      }

      return apiData.response;
    } else {
      // TODO
      // if some error occurs then show a dialog
      console.error('Error in Data Service: ', apiData?.response);
    }
    
}

  async updateCache(data: IEntitySyncDTO) {
  //if store is not loaded then no need of sync notification
  if (!(await this.isStoreLoaded(data.Table))) {
    return;
  }

  // add record to cache
  if (data.State == EntityStateEnum.Added) {
    await (this.cacheService as any)[data.Table].AddOrEditAsync(data.Entity);
  }
  // delete record from cache
  if (data.State == EntityStateEnum.Deleted) {
    let entity: any = data.Entity;
    await (this.cacheService as any)[data.Table].RemoveAsync(entity.Id);
  }
  // update record from cache
  if (data.State == EntityStateEnum.Modified) {
    let entity: any = data.Entity;
    await (this.cacheService as any)[data.Table].UpdateAsync(
      entity.Id,
      entity
    );
  }
  this.refreshSubject.next(data);
}

  async isStoreLoaded(storeName: string) {
  let record = await this.cacheService.LoadedStores.getById(1);
  if (record && (record as any)[storeName] == true) {
    return true;
  }
  return false;
}

  async loadClientDbStore(storeName: string) {
  let patch = {};
  (patch as any)[storeName] = true;
  await this.cacheService.LoadedStores.UpdateAsync(1, { ...patch });
}
*/
}
