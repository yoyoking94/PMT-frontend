import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(), // pour HttpClient si vous l'utilisez
    provideRouter(routes), // pour activer le router et ses services comme ActivatedRoute
  ],
}).catch((err) => console.error(err));
