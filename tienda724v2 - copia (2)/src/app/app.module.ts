import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { MenuComponent } from './components/menu/menu.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { MesasComponent } from './components/mesas/mesas.component';
import { DetailMesaComponent } from './components/detail-mesa/detail-mesa.component';
import { AddProductsMesaComponent } from './components/add-products-mesa/add-products-mesa.component';
import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { CajaComponent } from './components/caja/caja.component';
import { AbrirCajaComponent } from './components/abrir-caja/abrir-caja.component';
import { NgxCurrencyModule } from "ngx-currency";
import { CustomHttpInterceptor } from "./services/sessionManager/custom-http.interceptor";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgxSpinnerModule } from "ngx-spinner";
import { SelectClientComponent } from './components/select-client/select-client.component';
import { CreateClientComponent } from './components/create-client/create-client.component'
import { CookieService } from 'ngx-cookie-service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MenuComponent,
    MesasComponent,
    DetailMesaComponent,
    AddProductsMesaComponent,
    CajaComponent,
    AbrirCajaComponent,
    SelectClientComponent,
    CreateClientComponent,
  ],
  imports: [
    VirtualScrollerModule,
    ScrollingModule,
    FormsModule,
    NgxCurrencyModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    NgbModule
  ],
  providers: [
    CookieService,
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptor,
      multi: true,
    },
    {provide: LocationStrategy, useClass: HashLocationStrategy},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
