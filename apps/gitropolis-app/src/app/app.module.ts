import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent, AppScam } from './app.component';

@NgModule({
  bootstrap: [AppComponent],
  imports: [BrowserAnimationsModule, AppScam],
})
export class AppModule {}
