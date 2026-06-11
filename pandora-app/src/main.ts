import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Insere ao index.html a chamada a API do Google Maps
const src = `https://maps.googleapis.com/maps/api/js?key=${environment.GOOGLE_MAPS_KEY}&libraries=visualization`;
// document.write(`<script src="${src}" async defer></script>`);

const script = document.createElement('script');
script.setAttribute('src', src);
script.async = true;
script.defer = true;
document.head.appendChild(script);
// 
if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
