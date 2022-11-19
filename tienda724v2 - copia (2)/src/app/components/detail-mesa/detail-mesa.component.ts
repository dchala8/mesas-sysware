import { SessionManagerService } from './../../services/sessionManager/session-manager.service';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Urlbase } from '../../classes/urls';
import { Subject } from 'rxjs';
import UIkit from 'uikit';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-detail-mesa',
  templateUrl: './detail-mesa.component.html',
  styleUrls: ['./detail-mesa.component.scss']
})
export class DetailMesaComponent implements OnInit {

  userActivity:any;
  userInactive: Subject<any> = new Subject();

  constructor(private router: Router,
              private sessionManager : SessionManagerService,
              private httpClient: HttpClient,
              public datePipe: DatePipe,) {
                this.setTimeout();
                this.userInactive.subscribe(() => {try{console.log('user has been inactive for 20s');
                                                   var modal = UIkit.modal("#modal-test");
                                                   modal.hide();
                                                   var modal2 = UIkit.modal("#sure-cancel-order-tables");
                                                   modal2.hide();
                                                   var modal3 = UIkit.modal("#manual");
                                                   modal3.hide();
                                                   var modal4 = UIkit.modal("#modal-agregar-pago");
                                                   modal4.hide();
                                                   var modal6 = UIkit.modal("#modal-procesos");
                                                   modal6.hide();
                                                   this.router.navigate(['adminrestaurant']);}catch(e){
                                                    this.router.navigate(['adminrestaurant'])
                                                   }
                                                  });
               }
  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });
  cantidadDinero:number=0;
  porcentaje:number=0;
  objMesa: any;
  obj: any;
  productList: any;
  productListToShow: any;
  nota:any="";
  rolList:any;
  username:any;
  clientName:any;
  setStatus:any = 1599;
  productToEdit:any={
    producto: "",
    fecha_EVENTO: ""
  };
  facturarDisabled:any = false;
  appCode:any = "";
  id_person:any = -1;
  cancelado:any;
  tip = 10;
  getProductosPedidoMesaUrl = Urlbase.facturacion + "/billing/getProductosPedidoMesa?id_bill="+this.sessionManager.returnMesa().id_BILL;
  allCheck:Boolean = false;
  ngOnInit(): void {
    this.objMesa = this.sessionManager.returnMesa();
    this.obj = this.sessionManager.returnIdObject();

    console.log("ID_OBJECT")
    console.log(this.sessionManager.returnIdObject())
    if(this.sessionManager.returnIdObject().roles[0].id_rol==51){
      this.getProductosPedidoMesaUrl = Urlbase.facturacion + "/billing/getProductosPedidoMesaADR?id_bill="+this.sessionManager.returnMesa().id_BILL+"&id_third="+this.sessionManager.returnIdObject().id_third;
    }

    this.httpClient.get(Urlbase.facturacion + "/billing/getCanceledTable?idBill="+this.objMesa.id_BILL,{ headers: this.headers,withCredentials:true }).subscribe( (response:any)=>{
        this.cancelado = response;
      }
    )
    this.rolList = this.obj.roles;
    this.clientName = "";
    this.username = this.obj.usuario;
    this.httpClient.get(this.getProductosPedidoMesaUrl,{ headers: this.headers,withCredentials:true }).subscribe(response => {
      //@ts-ignore
      this.productList = response;


      //@ts-ignore
      this.productListToShow = response.filter(i => i.ownbarcode !== '45000198');

      if(this.productListToShow.length<=0 && localStorage.getItem("checkReload")=="1"){
        this.goToAddProducts()
      }

      console.log(this.productListToShow)
    })
    this.clientName = this.objMesa.cliente;
  }

  setCerrarMesa1(val:any){
    this.cantidadDinero = (val*this.objMesa.totalprice)/100;
  }

  setCerrarMesa2(val:any){
    this.porcentaje =(val*100)/this.objMesa.totalprice;
  }


  returnTotal(){
    try{
      return this.productListToShow[0].totalprice;
    }catch(Exception){
      return 0;
    }
  }

  setAllCheck(){

    if(this.obj.roles[0].id_rol==51){

      for(let a=0;a<this.productListToShow.length;a++){

        if(this.productListToShow[a].color!='VIOLETA' && this.productListToShow[a].color!='AZUL' && this.productListToShow[a].color!='NEGRO' && this.productListToShow[a].color!='NARANJA'){
          if(this.allCheck){
            this.productListToShow[a].check = true
          }else{
            this.productListToShow[a].check = false
          }
        }

      }

    }else{

      for(let a=0;a<this.productListToShow.length;a=a+1){
        console.log(this.productListToShow[a])
        if(this.allCheck==true){
          console.log("IN")
          this.productListToShow[a].check = true
        }else{
          console.log("IN2")
          this.productListToShow[a].check = false
        }
      }


    }

  }


  returnMeseroName(){
    try{
      let mesero = this.objMesa.mesero.split(" ");
      return mesero[0]+" "+mesero[2];
    }catch(exception){
      return this.objMesa.mesero;
    }
  }

  returnClienteName(){
    try{
      let cliente = this.objMesa.cliente.split(" ");
      return cliente[0]+" "+cliente[2];
    }catch(exception){
      console.log(exception)
      return this.objMesa.cliente;
    }
  }


  setTimeout() {
    this.userActivity = setTimeout(() => this.userInactive.next(undefined), 20000);
  }

  @HostListener('window:keydown')
  @HostListener('window:mousemove') refreshUserState() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }


  getTotal(){
    this.productListToShow.forEach((element:any) => {

    });
  }


  goMenu(){
    clearTimeout(this.userActivity);
    this.router.navigate(['menu']);
  }


  logOut(){
    localStorage.removeItem("ID");
    localStorage.removeItem("idStore");
    localStorage.removeItem("mesa");
    localStorage.removeItem("storeName");
    localStorage.removeItem("ID_CAJA");
    clearTimeout(this.userActivity);
    this.router.navigate(['login']);
  }


  getRolString(){
    let response = "";
    this.rolList.forEach((i: { rol: string; }) => {
      response = response + i.rol+"/ "
    });
    return response;
  }


  regresarAMesas(){
    this.sessionManager.deleteMesa();
    clearTimeout(this.userActivity);
    this.router.navigate(['adminrestaurant']);
  }


  nextStatusDoubleClick = false;
  nextStatus(item:any){
    if(this.nextStatusDoubleClick){
      return;
    }else{
      this.nextStatusDoubleClick = true;
    }

    let idestadoorigen;
    let idestadofinal;

    if(this.obj.roles[0].id_rol!=52){
    if(item.estado=='CANCELADO'){
      idestadoorigen = 1599;
      idestadofinal = 1599;

      this.objMesa.negro--;
      this.objMesa.negro++;
    }

    if(item.estado=='ENTREGADO EN MESA'){
      idestadoorigen = 1503;
      idestadofinal = 1503
      this.objMesa.azul--;
      this.objMesa.azul++;
    }

    if(item.estado=='ENTREGADO A MESERO'){
      idestadoorigen = 1502;
      idestadofinal = 1503

      this.objMesa.naranja--;
      this.objMesa.azul++;
    }

    if(item.estado=='EN PROCESO'){
      idestadoorigen = 1501;
      idestadofinal = 1502

      this.objMesa.amarillo--;
      this.objMesa.naranja++;
    }

    if(item.estado=='PENDIENTE'){
      idestadoorigen = 1500;
      idestadofinal = 1501;
      this.objMesa.rojo--;
      this.objMesa.amarillo++;
    }

    if((item.estado!="CANCELADO")){

      this.httpClient.post(Urlbase.facturacion + "/billing/actualizarEstadoPedidoMesa?ID_DETALLE_DETAIL_BILL="+item.id_DETALLE_DETAIL_BILL+"&IDESTADODESTINO="+idestadofinal+"&notas=' '&IDESTADOORIGEN="+idestadoorigen+"&IDTHIRDUSER="+this.obj.id_third+"&ACTOR=P",{},{ headers: this.headers,withCredentials:true }).subscribe(response => {
        this.nextStatusDoubleClick = !this.nextStatusDoubleClick
        if(response == 1){
          this.regresarAMesas();
          this.httpClient.get(this.getProductosPedidoMesaUrl,{ headers: this.headers,withCredentials:true }).subscribe(response => {
            //@ts-ignore
            this.productList = response;
            //@ts-ignore
            this.productListToShow = response.filter(i => i.ownbarcode !== '45000198');
          })
        }
      })
    }else{
      this.nextStatusDoubleClick = !this.nextStatusDoubleClick
    }
  }else{
    if(item.estado=='CANCELADO'){
      idestadoorigen = 1599;
      idestadofinal = 1599;

      this.objMesa.negro--;
      this.objMesa.negro++;
    }

    if(item.estado=='ENTREGADO EN MESA'){
      idestadoorigen = 1503;
      idestadofinal = 1503
      this.objMesa.azul--;
      this.objMesa.azul++;
    }

    if(item.estado=='PENDIENTE'){
      idestadoorigen = 1500;
      idestadofinal = 1503;
      this.objMesa.rojo--;
      this.objMesa.amarillo++;
    }

    if((item.estado!="CANCELADO")){

      this.httpClient.post(Urlbase.facturacion + "/billing/actualizarEstadoPedidoMesa?ID_DETALLE_DETAIL_BILL="+item.id_DETALLE_DETAIL_BILL+"&IDESTADODESTINO="+idestadofinal+"&notas=' '&IDESTADOORIGEN="+idestadoorigen+"&IDTHIRDUSER="+this.obj.id_third+"&ACTOR=P",{},{ headers: this.headers,withCredentials:true }).subscribe(response => {
        this.nextStatusDoubleClick = !this.nextStatusDoubleClick
        if(response == 1){
          this.regresarAMesas();
          this.httpClient.get(this.getProductosPedidoMesaUrl,{ headers: this.headers,withCredentials:true }).subscribe(response => {
            //@ts-ignore
            this.productList = response;
            //@ts-ignore
            this.productListToShow = response.filter(i => i.ownbarcode !== '45000198');
          })
        }
      })
    }else{
      this.nextStatusDoubleClick = !this.nextStatusDoubleClick
    }
  }


  }

  getDateInMinutes(date:any){
    if(date == null){
      return null;
    }
    let today = new Date();
    let dif = today.getTime() - (new Date(date)).getTime();
    return Math.round((Math.round(dif/1000)/60))
  }

  getStoreName(){
    return this.sessionManager.returnStoreName();
  }

  cancelarPedidoDoubleClick = false;
  cancelTable(){
    if(this.cancelarPedidoDoubleClick){
      return;
    }else{
      this.cancelarPedidoDoubleClick = false;
      this.httpClient.post(Urlbase.facturacion +"/billing/actualizarEstadoMesa?IDBILL="+this.objMesa.id_BILL+"&IDESTADODESTINO="+99+"&nota="+this.nota+"&IDESTADOORIGEN="+801+"&IDTHIRDUSER="+this.obj.id_third+"&ACTOR=P",{},{ headers: this.headers,withCredentials:true }).subscribe(result => {
        if(result == 1){
          this.regresarAMesas();
          //this.dialogRef.close();
          clearTimeout(this.userActivity);
          this.router.navigate(['adminrestaurant']);
          localStorage.removeItem("mesa");
        }else{
          alert("Se presento un error al cancelar la mesa");
        }
      })
    }
  }

  productToEditDoubleClick=false;
  notasForModal2:any="";
  setProductToEdit(product: any){
    console.log(product)
    if(this.productToEditDoubleClick){
      return;
    }else{
      try{
        this.notasForModal2 = product.notas.split(";").filter((item:any) => !item.includes("' '") )
      }catch(Exception){
        this.notasForModal2 = [];
      }
      this.productToEditDoubleClick=true;
      console.log(product);
      this.setStatus = 1599;
      this.productToEdit = product;
      this.productToEditDoubleClick=false;
    }
  }

  print(element:any){
    console.log(element)
  }

  send(){
    let list = this.productListToShow.filter((element:any)=>  element.check==true);

    for(let a=0; a<list.length; a++){
      this.productToEdit = list[a];
      this.readySend();
    }

    this.httpClient.post(Urlbase.facturacion + "/billing/actualizarEstadoPedidoMesa/list",{list: this.listToSend},{}).subscribe(response=>{
      this.httpClient.get(this.getProductosPedidoMesaUrl,{ headers: this.headers,withCredentials:true }).subscribe(response => {
        //@ts-ignore
        this.productList = response;

        //@ts-ignore
        this.productListToShow = response.filter(i => i.ownbarcode !== '45000198');

        console.log(this.productListToShow)
        this.listToSend= []
      })
    })

  }

  sendCancel(){
    let list = this.productListToShow.filter((element:any)=>  element.check==true);

    for(let a=0; a<list.length; a++){
      this.productToEdit = list[a];
      this.readySendCancel();
    }

    this.httpClient.post(Urlbase.facturacion + "/billing/actualizarEstadoPedidoMesa/list",{list: this.listToSend},{}).subscribe(response=>{
      this.httpClient.get(this.getProductosPedidoMesaUrl,{ headers: this.headers,withCredentials:true }).subscribe(response => {
        //@ts-ignore
        this.productList = response;

        //@ts-ignore
        this.productListToShow = response.filter(i => i.ownbarcode !== '45000198');

        console.log(this.productListToShow)
        this.listToSend= []
      })
    })

  }

  listToSend: any = [];

  readySend(){
    let item = this.productToEdit;


    let idestadoorigen;
    let idestadofinal;
    idestadofinal = this.setStatus;
    if(this.obj.roles[0].id_rol!=52){
      if(this.obj.roles[0].id_rol!=51){
        //@ts-ignore
        if(item.estado=='CANCELADO'){
          idestadoorigen = 1599;
          idestadofinal = 1599;
        }
        //@ts-ignore
        if(item.estado=='ENTREGADO EN MESA'){
          idestadoorigen = 1503;
          idestadofinal = 1503;
        }
        //@ts-ignore
        if(item.estado=='ENTREGADO A MESERO'){
          idestadoorigen = 1502;
          idestadofinal = 1503;
        }
      }
      //@ts-ignore
      if(item.estado=='EN PROCESO'){
        idestadoorigen = 1501;
        idestadofinal = 1502;
      }
      //@ts-ignore
      if(item.estado=='PENDIENTE'){
        idestadoorigen = 1500;
        idestadofinal = 1501;
      }

      if((item.estado!="CANCELADO")){
        //@ts-ignore

        let object = {
          ID_DETALLE_DETAIL_BILL: item.id_DETALLE_DETAIL_BILL,
          IDESTADODESTINO: idestadofinal,
          NOTAS: this.nota,
          IDESTADOORIGEN: idestadoorigen,
          IDTHIRDUSER: this.obj.id_third,
          ACTOR: "P"
        }

        this.listToSend.push(object);
        }
    }else{
      if(this.obj.roles[0].id_rol!=51){
        //@ts-ignore
        if(item.estado=='CANCELADO'){
          idestadoorigen = 1599;
          idestadofinal = 1599;
        }
        //@ts-ignore
        if(item.estado=='ENTREGADO EN MESA'){
          idestadoorigen = 1503;
          idestadofinal = 1503;
        }
      }

      //@ts-ignore
      if(item.estado=='PENDIENTE'){
        idestadoorigen = 1500;
        idestadofinal = 1503;
      }

      if((item.estado!="CANCELADO")){
        //@ts-ignore

        let object = {
          ID_DETALLE_DETAIL_BILL: item.id_DETALLE_DETAIL_BILL,
          IDESTADODESTINO: idestadofinal,
          NOTAS: this.nota,
          IDESTADOORIGEN: idestadoorigen,
          IDTHIRDUSER: this.obj.id_third,
          ACTOR: "P"
        }

        this.listToSend.push(object);
        }
    }




  }

  readySendCancel(){
    let item = this.productToEdit;


    let idestadoorigen;
    let idestadofinal;
    idestadofinal = this.setStatus;
    if(this.obj.roles[0].id_rol!=51){
      //@ts-ignore
      if(item.estado=='CANCELADO'){
        idestadoorigen = 1599;
        idestadofinal = 1599;
      }
      //@ts-ignore
      if(item.estado=='ENTREGADO EN MESA'){
        idestadoorigen = 1503;
        idestadofinal = 1599;
      }
      //@ts-ignore
      if(item.estado=='ENTREGADO A MESERO'){
        idestadoorigen = 1502;
        idestadofinal = 1599;
      }
    }
    //@ts-ignore
    if(item.estado=='EN PROCESO'){
      idestadoorigen = 1501;
      idestadofinal = 1599;
    }
    //@ts-ignore
    if(item.estado=='PENDIENTE'){
      idestadoorigen = 1500;
      idestadofinal = 1599;
    }

    if((item.estado!="CANCELADO")){
      //@ts-ignore

      let object = {
        ID_DETALLE_DETAIL_BILL: item.id_DETALLE_DETAIL_BILL,
        IDESTADODESTINO: idestadofinal,
        NOTAS: this.nota,
        IDESTADOORIGEN: idestadoorigen,
        IDTHIRDUSER: this.obj.id_third,
        ACTOR: "P"
      }

      this.listToSend.push(object);
      }



  }


  goToAddProducts(){
    clearTimeout(this.userActivity);
    this.router.navigate(['addproductsmesa']);
  }

  goToSelectClient(){
    clearTimeout(this.userActivity);
    this.router.navigate(['selectclient']);
  }


  itemForDetailModal:any ="";
  notasForModal:any = []

  showItem(item:any){
    console.log(item);
    this.itemForDetailModal = item.producto;
    try{
      this.notasForModal = item.notas.split(";").filter((item:any) => !item.includes("' '") )
    }catch(Exception){
      this.notasForModal = [];
    }
  }

  getListToTest(item:any){
    return item.notas.split(";").filter((item:any) => !item.includes("' '") );
  }




  closeBill(){

    console.log("facturar");

    this.facturarDisabled = true;
    let idpayment = 1;


    let note = this.nota;
    let discount = 0;

    let detail = "{"+idpayment+","+this.objMesa.totalprice+","+0+"}"
    this.httpClient.post(Urlbase.facturacion +"/billing/facturarPedidoMesa?idthirdemployee="+this.obj.id_third+"&idthird="+this.obj.id_third_father+"&idbilltype="+1+"&notes="+" "+this.objMesa.mesa+" - Inicio  "+this.datePipe.transform(new Date(this.objMesa.purchase_DATE),"HH:mm")+" - Fin    "+this.datePipe.transform(new Date(),"HH:mm")+" - Tiempo "+this.getDateInMinutes(this.objMesa.purchase_DATE)+" Minutos - "+note+"&idthirddestinity="+this.id_person+"&idcaja="+1+"&idstore="+this.sessionManager.returnIdStore()+"&idthirddomiciliario="+-888+"&idpaymentmethod="+idpayment+"&idwaytopay="+1+"&approvalcode="+this.appCode+"&idbankentity="+1+"&idbillstate="+1+"&detallesbill="+"test"+"&descuento="+discount+"&numdocumentoadicional="+123+"&idthirdvendedor="+-888+"&detallespago="+detail+"&idbillpedido="+this.objMesa.id_BILL+"&nota="+" Mesa "+this.objMesa.mesa_NUMBER+" - Fecha inicio: "+this.objMesa.purchase_DATE+" - Fecha Finalizacion: "+this.datePipe.transform(new Date(),"dd/MM/yyyy HH:mm")+" - Tiempo Transcurrido: "+this.getDateInMinutes(this.objMesa.purchase_DATE)+" Minutos - "+note+"&idthirduser="+this.obj.id_third+"&actor=P",{}).subscribe(result => {
      if(result != 0){
        this.httpClient.get(Urlbase.facturacion+"/billing/UniversalPDF?id_bill="+result+"&pdf=0&cash=0&restflag=1&size="+false,{responseType: 'text'}).subscribe(response =>{
          window.open(Urlbase.facturas+"/"+response, "_blank");
          //this.dialogRef.close();
          this.facturarDisabled = false;
        })
      }else{
        this.facturarDisabled = false;

      }
    },
    error => {this.facturarDisabled = false;})
  }



  sendCloseTable(){
    console.log(this.objMesa)
    let tipValue = -1
    if(this.tip==-1){
      tipValue = this.cantidadDinero
    }else{
      tipValue = (this.objMesa.totalprice*this.tip)/100
    }
    this.httpClient.post(Urlbase.facturacion+'/billing/agregar_servicio_mesa?idbill='+this.objMesa.id_BILL+'&barcode=10101010101011&valor='+tipValue+'&idstore='+this.sessionManager.returnIdStore(),{},{ headers: this.headers,withCredentials:true }).subscribe((response:any)=>{
      this.httpClient.post(Urlbase.facturacion+'/billing/cerrar_mesa?idbill='+this.objMesa.id_BILL,{},{ headers: this.headers,withCredentials:true }).subscribe((response2:any)=>{
        this.router.navigate(['adminrestaurant'])
      })
    })
  }


}
