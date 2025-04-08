// app.module.ts or store.module.ts
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { authReducer } from './auth.reducer';

@NgModule({
  declarations: [],
  imports: [
    // Register the authReducer under the 'auth' key in the store
    StoreModule.forRoot({ auth: authReducer }),
  ],
  providers: [],
  bootstrap: [],
})
export class AppModule {}
