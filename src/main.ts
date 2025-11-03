import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, {
  providers: [
    ...(appConfig.providers || []),
    importProvidersFrom(MarkdownModule.forRoot())
  ]
});
