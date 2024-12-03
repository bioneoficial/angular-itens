import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    AppRoutingModule
  ],
})
export class AppModule { }
