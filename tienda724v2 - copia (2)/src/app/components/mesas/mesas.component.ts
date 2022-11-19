import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, OnDestroy, NgZone  } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SessionManagerService } from 'src/app/services/sessionManager/session-manager.service';
import { Urlbase } from '../../classes/urls';

@Component({
  selector: 'app-mesas',
  templateUrl: './mesas.component.html',
  styleUrls: ['./mesas.component.scss']
})
export class MesasComponent implements OnInit, OnDestroy {

  constructor(private httpClient : HttpClient,
              private sessionManager : SessionManagerService,
              private router: Router,
              private zone: NgZone) { }
  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  tableList:any;
  tableListShow:any;
  tableListGreen:any = [];
  tableListPurple:any;
  tableListBlue:any;
  tableListOrange:any;
  tableListYellow:any;
  tableListRed:any;
  tableToOpen:any;
  inventoryList:any;
  idObject:any;
  tableName:any;
  rolList:any;
  username:any;
  clientName:any;
  obj: any;
  canItOpenTable:any = false;
  private unsubscribe$?: NodeJS.Timeout;
  getPedidosMesaUrl = Urlbase.facturacion + "/billing/getPedidosMesa?id_store="+this.sessionManager.returnIdStore()+"&id_bill_type="+86+"&id_bill_state="+801;

  ngOnInit(): void {

    console.log("ID_OBJECT")
    console.log(this.sessionManager.returnIdObject())
    if(this.sessionManager.returnIdObject().roles[0].id_rol==51){
      this.getPedidosMesaUrl = Urlbase.facturacion + "/billing/getPedidosMesaADR?id_store="+this.sessionManager.returnIdStore()+"&id_bill_type="+86+"&id_bill_state="+801+"&id_third="+this.sessionManager.returnIdObject().id_third;
    }
    //@ts-ignore
    document.getElementById("defaultOpen").click();

    this.httpClient.get(Urlbase.tienda + "/products2/inventoryList?id_store="+this.sessionManager.returnIdStore(),{ headers: this.headers,withCredentials:true }).subscribe(data => {
      console.log(data)
      this.inventoryList = data;
      //CPrint("this is InventoryList: "+JSON.stringify(data))
      this.canItOpenTable = true;
    });

    this.idObject = this.sessionManager.returnIdObject();
    this.obj = this.sessionManager.returnIdObject();
    this.rolList = this.obj.roles;
    this.clientName = this.obj.third.fullname;
    this.username = this.obj.usuario;

    this.getPedidosMesa();

    this.unsubscribe$ = setInterval(() => {
      this.getPedidosMesa();
    }, 15000)
  }




  ngOnDestroy(): void {
    clearInterval(this.unsubscribe$);
  }

  getPedidosMesa(){
    this.httpClient.get(this.getPedidosMesaUrl,{ headers: this.headers,withCredentials:true }).subscribe(response => {
      this.zone.run(() => {
        console.log(response)
        if(this.obj.roles[0].id_rol!=51){
          this.tableList = response;
          this.tableListShow = response;
          this.tableListGreen = this.tableList.filter((item:any) => item.purchase_DATE == null)
          this.tableListPurple = this.tableList.filter((item:any) => item.violeta > 0)
          this.tableListBlue = this.tableList.filter((item:any) => item.naranja <= 0 && item.amarillo <= 0 && item.azul && item.rojo == 0)
          this.tableListOrange = this.tableList.filter((item:any) => item.naranja > 0)
          this.tableListYellow = this.tableList.filter((item:any) => item.naranja <= 0 && item.amarillo > 0)
          this.tableListRed = this.tableList.filter((item:any) => item.rojo > 0)
        }else{
          this.tableList = response;
          this.tableListGreen = this.tableList.filter((item:any) => item.purchase_DATE == null )
          this.tableListPurple = this.tableList.filter((item:any) => item.violeta > 0)
          this.tableListBlue = this.tableList.filter((item:any) => item.naranja <= 0 && item.amarillo <= 0 && item.azul && item.rojo == 0)
          this.tableListOrange = this.tableList.filter((item:any) => item.naranja > 0)
          this.tableListYellow = this.tableList.filter((item:any) => item.naranja <= 0 && item.amarillo > 0)
          this.tableListRed = this.tableList.filter((item:any) => item.rojo > 0)
          this.tableListShow = this.tableList.filter((item:any) => { return !(item.naranja == 0 && item.amarillo == 0 && item.azul == 0 && item.rojo == 0 && item.violeta == 0) })
        }
      });
    })
  }

  getRolString(){
    let response = "";
    this.rolList.forEach((i: { rol: string; }) => {
      response = response + i.rol+"/ "
    });
    return response;
  }

  getDateInMinutes(date:any){
    if(date == null){
      return null;
    }
    let today = new Date();
    let dif = today.getTime() - (new Date(date)).getTime();
    return Math.round((Math.round(dif/1000)/60))
  }

  goToDetail(mesa:any){
    let table = this.tableList.find((element:any) => mesa.id_MESA == element.id_MESA )
    this.sessionManager.setMesa(table);
    localStorage.setItem('checkReload', "1");
    this.router.navigate(['detailmesa']);
  }

  goMenu(){
    this.router.navigate(['menu']);
  }

  disableTableClickDouble = false;
  tableClick(table:any){
    if(this.disableTableClickDouble){
      return;
    }else{
      this.disableTableClickDouble = true;
      this.tableToOpen = table
      this.tableName = table.mesa
      this.disableTableClickDouble = false;
    }

  }

  logOut(){
    clearInterval(this.unsubscribe$);
    localStorage.removeItem("ID");
    localStorage.removeItem("idStore");
    localStorage.removeItem("mesa");
    localStorage.removeItem("storeName");
    localStorage.removeItem("ID_CAJA");
    this.router.navigate(['login']);
  }


  noDecimal(number:any){
    return Math.ceil(number);
  }

  getMesero(mesero:any){
    try{
      return mesero.split(' ')[0]
    }catch(exception ){
      return mesero
    }
  }


  openTable(item:any){

    console.log("ENTRE A ABRIR");

    if(!this.canItOpenTable){
      alert("Espera 30 segundos mientras se terminan de cargar los productos");
      return;
    }

    console.log("ENTRE A ABRIR 2");
    let detailList = "";
    let detailListNew = "";
    let object = this.inventoryList.find((element:any) => element.code === "45000198" || element.ownbarcode === "45000198" );
    detailList = detailList+ "{"+object.id_PRODUCT_STORE+","+object.standard_PRICE+","+object.id_TAX+","+1+"},"
    detailListNew = detailListNew+ "{"+object.id_PRODUCT_STORE+",0},"
    console.log("ENTRE A ABRIR 3");

    //GENERO LA LISTA DE DTOs DE DETALLES
    this.httpClient.post(Urlbase.facturacion+ "/billing/crearPedidoMesa?idstoreclient=11&idthirduseraapp="+this.idObject.id_third+"&idstoreprov="+this.sessionManager.returnIdStore()+"&detallepedido="+detailList.substring(0, detailList.length - 1)+"&descuento="+0+"&idpaymentmethod="+1+"&idapplication="+40+"&idthirdemp="+this.idObject.id_third+"&detallepedidomesa="+detailListNew.substring(0, detailListNew.length - 1)+"&idmesa="+item.id_MESA,{},{ headers: this.headers,withCredentials:true }).subscribe(itemr => {
      console.log("ENTRE A ABRIR 4");
      console.log(itemr)
      if(itemr==1){
        console.log("ENTRE A ABRIR 5");
        //this.showNotification('top', 'center', 3, "<h3>Mesa abierta con <b>EXITO.</b></h3> ", 'info');
        this.httpClient.get(this.getPedidosMesaUrl,{ headers: this.headers,withCredentials:true }).subscribe(response => {
          if(this.obj.roles[0].id_rol!=51){
            this.tableList = response;
            this.tableListShow = response;
            this.tableListGreen = this.tableList.filter((item:any) => item.purchase_DATE == null)
            this.tableListPurple = this.tableList.filter((item:any) => item.violeta > 0)
            this.tableListBlue = this.tableList.filter((item:any) => item.naranja <= 0 && item.amarillo <= 0 && item.azul && item.rojo == 0)
            this.tableListOrange = this.tableList.filter((item:any) => item.naranja > 0)
            this.tableListYellow = this.tableList.filter((item:any) => item.naranja <= 0 && item.amarillo > 0)
            this.tableListRed = this.tableList.filter((item:any) => item.rojo > 0)
          }else{
            this.tableList = response;
            this.tableListGreen = this.tableList.filter((item:any) => item.purchase_DATE == null )
            this.tableListPurple = this.tableList.filter((item:any) => item.violeta > 0)
            this.tableListBlue = this.tableList.filter((item:any) => item.naranja <= 0 && item.amarillo <= 0 && item.azul && item.rojo == 0)
            this.tableListOrange = this.tableList.filter((item:any) => item.naranja > 0)
            this.tableListYellow = this.tableList.filter((item:any) => item.naranja <= 0 && item.amarillo > 0)
            this.tableListRed = this.tableList.filter((item:any) => item.rojo > 0)
            this.tableListShow = this.tableList.filter((item:any) => { return !(item.naranja == 0 && item.amarillo == 0 && item.azul == 0 && item.rojo == 0 && item.violeta == 0) })
          }
          this.goToDetail(item);
        })
      }
    })
  }



  getStoreName(){
    return this.sessionManager.returnStoreName();
  }

  openTab(tabName:any,evt:any) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      //@ts-ignore
      tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    //@ts-ignore
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
  }
}
