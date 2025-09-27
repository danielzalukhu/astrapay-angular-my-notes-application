import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { NotesComponent } from '../app/components/notes/notes.component';

@NgModule({
  declarations: [
    AppComponent,
    NotesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule, // Required for ngModel    
    HttpClientModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent],  
  entryComponents: []
})
export class AppModule {
}
