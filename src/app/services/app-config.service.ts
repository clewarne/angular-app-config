import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { APP_ID, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

const RESULT_KEY = makeStateKey<any>('app-config.result');

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  public config: any;

  constructor(private http: HttpClient, private readonly transferState: TransferState,
              @Inject(PLATFORM_ID) private readonly platformId: Object,
              @Inject(APP_ID) private appId: string) {
  }

  /**
   * Call to api endpoint that loads the config and then override any local environment settings with the response
   */
  async loadAppConfig() {
    const platform = isPlatformBrowser(this.platformId) ?
      'in the browser' : 'on the server';
    console.log(`loadAppConfig : Running ${platform} with appId=${this.appId}`);

    const found = this.transferState.hasKey(RESULT_KEY);
    console.log('found: ', found, this.transferState);
    try {
      if (found) {
        this.config = this.transferState.get<any>(RESULT_KEY, null);
        console.log('yay we have the thing from the server', this.config);
      } else {
        const data = await lastValueFrom(this.http.get('http://localhost:4000/api/config', { headers: { skip: 'true' } }));
        this.config = { ...environment, ...data };
        this.transferState.set(RESULT_KEY, this.config);
        console.log('done api call', this.config, this.transferState);
      }
    } catch (err) {
      this.config = { ...environment };
      this.transferState.set(RESULT_KEY, this.config);
      console.warn('Unable to reach config service, using environment file.', this.transferState);
    }
  }
}
