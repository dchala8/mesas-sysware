import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthLoginResult} from "../../types/auth.types";
import {Urlbase} from "../../classes/urls";

@Injectable({
  providedIn: 'root'
})
export class SessionManagerService {

  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) { }

  returnIdObject(){

    let idEncoded = localStorage.getItem("ID");

    if(idEncoded){
      let idDecodedString = atob(idEncoded);
      const obj = JSON.parse(idDecodedString);
      return obj;
    }else{
      return null;
    }

  }

  returnIdStore(){

    let idEncoded = localStorage.getItem("idStore");

    if(idEncoded){
      let idDecodedString = atob(idEncoded);
      return idDecodedString;
    }else{
      return null;
    }

  }


  async login(user: string, password: string){
    const loginResult = await this.http.post<AuthLoginResult>(Urlbase.auth+"/login?id_aplicacion=21&dispositivo=WEB",{'usuario':user,'clave':password},{ headers: this.headers,withCredentials:true }).toPromise();
    console.log(loginResult)
    localStorage.setItem('ID', btoa(JSON.stringify(loginResult)));
    localStorage.setItem('at', btoa(loginResult.token));
    const result = await this.http.get<any[]>(Urlbase.tienda+"/store?id_third="+loginResult.id_third,{ headers: this.headers,withCredentials:true }).toPromise()
    localStorage.setItem('idStore', btoa(result[0].id_STORE));
    this.setStoreName(result[0].store_NAME);
  }

  /**
   * this method returns access token or empty string
   */
  returnToken(): string{

    let tokenEnc = localStorage.getItem("at");

    if(tokenEnc){
      let obj = atob(tokenEnc);
      return obj;
    }else{
      return "";
    }

  }

  setIdStore(idStore:any){
    localStorage.setItem("idStore",btoa(idStore));
  }

  setMesa(mesa:any){
    localStorage.setItem("mesa",btoa(JSON.stringify(mesa)));
  }

  returnMesa(){
    let idEncoded = localStorage.getItem("mesa");

    if(idEncoded){
      let idDecodedString = atob(idEncoded);
      const obj = JSON.parse(idDecodedString);
      return obj;
    }else{
      return null;
    }

  }

  deleteMesa(){
    localStorage.removeItem("mesa");
  }

  setStoreName(storeName: any){
    localStorage.setItem("storeName",btoa(storeName));
  }

  returnStoreName(){
    let idEncoded = localStorage.getItem("storeName");

    if(idEncoded){
      let idDecodedString = atob(idEncoded);
      return idDecodedString;
    }else{
      return null;
    }

  }

  setIdCaja(storeName: any){
    localStorage.setItem("ID_CAJA",btoa(storeName));
  }

  returnIdCaja(){
    let idEncoded = localStorage.getItem("ID_CAJA");

    if(idEncoded){
      let idDecodedString = atob(idEncoded);
      return idDecodedString;
    }else{
      return null;
    }

  }

  returnLogoURL(){
    let idObject = this.returnIdObject()
    return idObject.third_father.document_type + " " + idObject.third_father.document + ".jpg";
  }

  setIdClient(idClient:any){
    localStorage.setItem("idClient",btoa(idClient));
  }

  returnIdClient(){
    let idEncoded = localStorage.getItem("idClient");

    if(idEncoded){
      let idDecodedString = atob(idEncoded);
      return idDecodedString;
    }else{
      return null;
    }

  }

}
