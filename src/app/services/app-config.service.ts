import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  public config: any;

  constructor(private http: HttpClient) {
  }

  /**
   * Call to api endpoint that loads the config and then override any local environment settings with the response
   */
  async loadAppConfig() {
    try {
      const data = await lastValueFrom(this.http.get('/api/config', { headers: { skip: 'true' } }));
      this.config = { ...environment, ...data };
    } catch (err) {
      console.warn('Unable to reach config service, using environment file.');
    }
  }
}
