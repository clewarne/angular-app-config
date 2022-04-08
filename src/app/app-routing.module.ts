import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrerenderPageComponent } from 'src/app/pages/prerender-page/prerender-page.component';

const routes: Routes = [{
  path: 'prerender',
  component: PrerenderPageComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
