import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SessionManagerService } from './../../services/sessionManager/session-manager.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Urlbase } from '../../classes/urls';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  constructor(private router: Router,
              private sessionManager: SessionManagerService,
              private HttpClient:HttpClient) { }

  obj:any;
  menuList:any;
  clientName:any;
  rolList:any;
  docType:any;
  doc:any;
  username:any;
  storeList:any;
  selectedStore:any;
  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  imgurl:String ="";
  ngOnInit(): void {
    this.imgurl = Urlbase.logos+"/"+this.sessionManager.returnLogoURL();
    this.obj = this.sessionManager.returnIdObject();
    this.menuList = this.obj.menus.filter((item:any,index:any,self:any) => index === self.findIndex(
      (t:any) => t.id_menu === item.id_menu
    )).sort(this.dynamicSort("id_menu"));;
    this.clientName = this.obj.third.fullname;
    this.rolList = this.obj.roles;
    this.doc = this.obj.third.document;
    this.docType = this.obj.third.document_type;
    this.username = this.obj.usuario;
    this.getStores();
    console.log(this.menuList);
  }


  getStoreName(){
    return this.sessionManager.returnStoreName();
  }

  dynamicSort(property:any) {
    let sortOrder = 1;
    if(property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a:any,b:any) {
      /* next line works with strings and numbers,
        * and you may want to customize it to your needs
      */
      const result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
    }
  }

  getStores(){
    this.HttpClient.get(Urlbase.tienda+"/store?id_third="+this.obj.id_third,{ headers: this.headers,withCredentials:true }).subscribe(response => {
      this.storeList = response;
      this.selectedStore = this.sessionManager.returnIdStore();
    })
  }

  getRolString(){
    let response = "";
    this.rolList.forEach((i: { rol: string; }) => {
      response = response + i.rol+"/ "
    });
    return response;
  }

  logOut(){
    localStorage.removeItem("ID");
    localStorage.removeItem("idStore");
    localStorage.removeItem("mesa");
    localStorage.removeItem("storeName");
    localStorage.removeItem("ID_CAJA");
    this.router.navigate(['login']);
  }

  capturar(){

    localStorage.removeItem("idStore");
    localStorage.removeItem("ID_CAJA");
    this.sessionManager.setIdStore(this.selectedStore);
    this.setStoreName();
  }

  setStoreName(){
    let item =  this.storeList.filter(this.findElement)
    this.sessionManager.setStoreName(item[0].store_NAME);
  }

  findElement = (element:any) =>{
    return Number(element.id_STORE) == this.selectedStore ;
  }

  goToRoute(route:any){
    this.router.navigate([route]);
  }


}
