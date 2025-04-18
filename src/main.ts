import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Amplify } from 'aws-amplify';
import outputs from './amplify_outputs.json';
import { register } from 'swiper/element/bundle';

Amplify.configure(outputs);

// Register Swiper custom elements
register();

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
