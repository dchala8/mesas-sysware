import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Urlbase } from 'src/app/classes/urls';
import { SessionManagerService } from 'src/app/services/sessionManager/session-manager.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.scss']
})
export class CreateClientComponent implements OnInit {

  constructor(private router: Router,private httpClient: HttpClient, private sessionManager : SessionManagerService,) { }

  headers = new HttpHeaders({
    'Content-Type':  'application/json',
  });

  primerNombre:string = "";
  segundoNombre:string = "";
  primerApellido:string = "";
  segundoApellido:string = "";
  docType:string = "3";
  numDoc:string = "";
  direccion:string = "";
  phone:string = "";
  mail:string = "";
  SelectedGen:string = "";
  date:Date = new Date();
  type:string = "P";
  citySel:string = "";
  docList:any [] = [];
  GenderList:any [] = [];
  cityList:any [] = [];


  ngOnInit(): void {
    console.log("mesa")
    console.log()
    this.httpClient.get(Urlbase.tercero +"/documents-types",{headers:this.headers,withCredentials:true}).subscribe(data => {
      console.log("docList")
      console.log(data)
      //@ts-ignore
      this.docList = data;
    })

    this.httpClient.get(Urlbase.tercero + "/thirds/genders",{ headers: this.headers ,withCredentials:true}).subscribe(response => {
      console.log("genders")
      console.log(response)
      //@ts-ignore
      this.GenderList = response;
      //@ts-ignore
      this.SelectedGen = response[0].id_GENERO;
    });

    this.httpClient.get(Urlbase.tercero + "/thirds/cities",{ headers: this.headers,withCredentials:true }).subscribe(response => {
      console.log("cities")
      console.log(response)

      this.httpClient.get(Urlbase.facturacion + "/billing/getIdCityByStore?id_store="+this.sessionManager.returnIdStore(),{ headers: this.headers,withCredentials:true , responseType: 'text'}).subscribe(response2 => {
        console.log(response2)
        //@ts-ignore
        this.citySel = response2;
      });
      //@ts-ignore
      this.cityList = response;
    });
  }

  regresarAMesa(){
    this.router.navigate(['detailmesa']);
  }

  crearCliente(){
    console.log(Urlbase.tercero + "/thirds/newThird?typesa="+this.type+"&nombre1="+this.primerNombre+"&nombre2="+this.segundoNombre+"&nombre3="+this.primerApellido+"&nombre4="+this.segundoApellido+"&doctype="+this.docType+"&docnumber="+this.numDoc+"&addres="+this.direccion.split("#").join("_")+"&id_city="+this.citySel+"&telefono="+this.phone+"&correo="+this.mail+"&idgenero="+this.SelectedGen+"&fechanacimiento="+this.date)
    this.httpClient.post(Urlbase.tercero + "/thirds/newThird?typesa="+this.type+"&nombre1="+this.primerNombre+"&nombre2="+this.segundoNombre+"&nombre3="+this.primerApellido+"&nombre4="+this.segundoApellido+"&doctype="+this.docType+"&docnumber="+this.numDoc+"&addres="+this.direccion.split("#").join("_")+"&id_city="+this.citySel+"&telefono="+this.phone+"&correo="+this.mail+"&idgenero="+this.SelectedGen+"&fechanacimiento="+this.date,{},{headers:this.headers,withCredentials:true}).subscribe(Res=>{
      //@ts-ignore
      this.idThirdResponse = Res;
      if(Res==0){
        Swal.fire('Ups', 'Se presentó un error al crear el cliente.', 'error');
      }else{
        this.httpClient.get(Urlbase.tercero + '/persons/search?doc_person='+String(this.numDoc),{ headers: this.headers,withCredentials:true }).subscribe(data =>{
          //@ts-ignore
          this.httpClient.post(Urlbase.facturacion + '/billing/asociar_tercero_bill?idthird='+data[0].id_PERSON+'&idbill='+this.sessionManager.returnMesa().id_BILL,{},{ headers: this.headers,withCredentials:true }).subscribe(response =>{
            if(response == 1){
              Swal.fire('Exito!', 'Se creó el cliente exitosamente', 'success');
              let mesa = this.sessionManager.returnMesa();
              mesa.cliente = this.primerNombre+" "+this.primerApellido+" "+this.segundoNombre+" "+this.segundoApellido;
              this.sessionManager.setMesa(mesa);
              this.clearData();
              //@ts-ignore
              this.regresarAMesa();
            }else{
              Swal.fire('Ups', 'Se presentó un error al crear el cliente.', 'error');
            }
          });
        });
      }
    })
  }


  clearData(){

    this.primerNombre = "";
    this.segundoNombre = "";
    this.primerApellido = "";
    this.segundoApellido = "";
    this.docType = this.docList[0].id_document_type;
    this.numDoc = "";
    this.direccion = "";
    this.phone = "";
    this.mail = "";
    this.SelectedGen = this.GenderList[0].id_GENERO;;
    this.date = new Date();
    this.type = "P";
    this.citySel = this.cityList[0].id_CITY;

  }

}
