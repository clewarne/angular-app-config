import { Component } from '@angular/core';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  title = 'angular-app-config';
  config: any;

  constructor(private appConfig: AppConfigService) {
    this.config = JSON.stringify(appConfig.config);
  }
}
