import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { delay } from 'rxjs/operators';
import { Urlbase } from 'src/app/classes/urls';
import { SessionManagerService } from 'src/app/services/sessionManager/session-manager.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-select-client',
  templateUrl: './select-client.component.html',
  styleUrls: ['./select-client.component.scss']
})
export class SelectClientComponent implements OnInit {

  constructor(private router: Router,private httpClient: HttpClient, private sessionManager : SessionManagerService,) { }

  headers = new HttpHeaders({
    'Content-Type':  'application/json',
  });

  ccClient:string=""

  ngOnInit(): void {
  }

  clientList: any[]  = [];

  regresarAMesa(){
    this.router.navigate(['detailmesa']);
  }


  searchClient(doc:string){
    const identificacionCliente = doc
    this.httpClient.get(Urlbase.tercero + '/persons/search?doc_person='+String(identificacionCliente),{ headers: this.headers,withCredentials:true }).subscribe(data =>{
      console.log(data)
      //@ts-ignore
      this.clientList = data
      if(this.clientList.length<=0){
        this.router.navigate(['createclient']);
      }
    });
  }

  setClient(item:any){
    this.httpClient.post(Urlbase.facturacion + '/billing/asociar_tercero_bill?idthird='+item.id_PERSON+'&idbill='+this.sessionManager.returnMesa().id_BILL,{},{ headers: this.headers,withCredentials:true }).subscribe(response =>{
      if(response == 1){
        Swal.fire('Exito!', 'Se asoció el cliente exitosamente', 'success');
        delay(1000);
        let mesa = this.sessionManager.returnMesa();
        mesa.cliente = item.fullname;
        this.sessionManager.setMesa(mesa);
        this.regresarAMesa();
      }else{
        Swal.fire('Ups', 'Se presentó un error al asociar el cliente.', 'error');
      }
    });
  }


}
