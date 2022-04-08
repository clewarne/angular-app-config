import { PlatformLocation } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

const RESULT_KEY = makeStateKey<any>('app-config.result');

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  public config: any;

  constructor(private http: HttpClient,
              private readonly transferState: TransferState,
              private loc: PlatformLocation) {
  }

  /**
   * Call to api endpoint that loads the config and then override any local environment settings with the response
   */
  async loadAppConfig() {
    const found = this.transferState.hasKey(RESULT_KEY);
    try {
      if (found) {
        this.config = this.transferState.get<any>(RESULT_KEY, null);
        this.config.loadedFromServerCache = true;
      } else {
        const data = await lastValueFrom(
          this.http.get(`${this.loc.protocol}//${this.loc.hostname}:${this.loc.port}/api/config`, { headers: { skip: 'true' } }));
        this.config = { ...environment, ...data };
        this.transferState.set(RESULT_KEY, this.config);
      }
    } catch (err) {
      this.config = { ...environment };
      this.transferState.set(RESULT_KEY, this.config);
      console.warn('Unable to reach config service, using environment file.', this.transferState);
    }
  }
}
