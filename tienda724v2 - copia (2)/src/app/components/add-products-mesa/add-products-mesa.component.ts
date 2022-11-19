import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { SessionManagerService } from 'src/app/services/sessionManager/session-manager.service';
import { Urlbase } from '../../classes/urls';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-add-products-mesa',
  templateUrl: './add-products-mesa.component.html',
  styleUrls: ['./add-products-mesa.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AddProductsMesaComponent implements OnInit {

  userActivity:any;

  userActivity2:any;

  userInactive: Subject<any> = new Subject();

  userInactive2: Subject<any> = new Subject();

  opcionesModal = false
  opcionesModal2 = false
  agregadaModal = false
  mainWindow = false
  text = ""
  obj: any;
  objMesa: any;
  EstadoBusquedaProducto = -1;
  listaElem : any[] = [];
  inventoryList: any[] = [];
  inputForCode:any = "";
  productsObject:any = [];
  productsObject2:any = [];
  disableDoubleClickSearch = false;
  storageList:any;
  taxesList:any;
  api_uri = Urlbase.tienda;
  categories:any;
  inventorylistCopy:any[] = [];
  selectedCategoryName="TODAS";
  selectedCategory = -1;
  subCategoryList:any;
  subCategoryName:any="";
  selectedSubCategory:any;
  rolList:any;
  username:any;
  clientName:any;
  commonStateDTO:any = {

    state:Number,
    creation_date:Date,
    update_date:Date,

  };
  priceList = []
  desagregada = true
  constructor(private httpClient : HttpClient,
              private sessionManager : SessionManagerService,
              private router: Router,
              private spinner: NgxSpinnerService) {
                this.setTimeout2();


                this.userInactive2.subscribe(() => {console.log('user has been inactive for 3');
                                                  if(this.productsObject.length<=0){
                                                    this.router.navigate(['adminrestaurant']);
                                                   }
                                                  else{
                                                    this.setTimeout2();
                                                   }
                                                 });
              }

  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });


  ngOnInit(): void {
    this.objMesa = this.sessionManager.returnMesa();
    this.getPriceListToUse();
    this.getStorages();
    this.getCategories();
    this.obj = this.sessionManager.returnIdObject();
    this.rolList = this.obj.roles;
    this.clientName = this.obj.third.fullname;
    this.username = this.obj.usuario;
  }

  setTimeout2() {
    this.userActivity2 = setTimeout(() => this.userInactive2.next(undefined), 180000);
  }

  setTimeout() {
    this.userActivity = setTimeout(() => this.userInactive.next(undefined), 20000);
  }

  @HostListener('document:keydown')
  @HostListener('document:mousemove') refreshUserState() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }

  getPriceListToUse(){
    this.httpClient.get(Urlbase.tienda+"/price-list/priceList?idstore="+this.sessionManager.returnIdStore(),{ headers: this.headers,withCredentials:true }).subscribe((response:any) => {
      this.priceList =response;
      this.getInventoryList();
      // this.inventoriesService.getInventory(this.locStorage.getIdStore()).subscribe(res => {
      //   this.locStorage.setInventoryList(res);
      // })
      //this.getInventoryList(this.locStorage.getIdStore());
    })
  }

  getRolString(){
    let response = "";
    this.rolList.forEach((i: { rol: string; }) => {
      response = response + i.rol+"/ "
    });
    return response;
  }

  getStoreName(){
    return this.sessionManager.returnStoreName();
  }

  goToMesa(){
    clearTimeout(this.userActivity);
    localStorage.removeItem("checkReload");
    this.router.navigate(['detailmesa']);
  }

  getDisccountedPrice(price:any){
    return price*0.9;
  }

  itemObject:any = {code: "",
                    id_CATEGORY: 0,
                    id_INVENTORY_DETAIL: 0,
                    id_PRODUCT_STORE: 0,
                    id_TAX: 0,
                    img: null,
                    inventario_DISPONIBLE: "",
                    ownbarcode: "",
                    product_STORE_CODE: "",
                    product_STORE_NAME: "",
                    quantity: 0,
                    standard_PRICE:0,
                    status: ""};

  setItem(item:any){
    this.itemObject = item
  }



  getInventoryList(){
    this.httpClient.get(Urlbase.tienda+"/products2/inventoryListActivos?id_store="+this.sessionManager.returnIdStore(),{ headers: this.headers,withCredentials:true }).subscribe(data => {
      console.log("inventoryList")
      console.log(data)
      //@ts-ignore
      this.inventoryList = data;
      //@ts-ignore
      this.inventorylistCopy = data;


      this.inventoryList.forEach((element:any) => {
        //@ts-ignore
        element.priceGen = this.priceList.filter((item:any) => item.id_PRODUCT_STORE == element.id_PRODUCT_STORE)[0].price
        //@ts-ignore
        element.discountCode =this.priceList.filter((item:any) => item.id_PRODUCT_STORE == element.id_PRODUCT_STORE)[0].pct_descuento
      })


      if(this.inventoryList.length>=100){
        this.listaElem = this.inventoryList.slice(0,100)
      }else{
        this.listaElem = this.inventoryList
      }




      },
      (error: any) =>{
      },
      () => {
      if (this.inventoryList.length > 0) {

      }
    });

  }

  getStorages() {
    this.httpClient.get(Urlbase.tienda + "/store/s?id_store="+this.sessionManager.returnIdStore(),{ headers: this.headers,withCredentials:true }).subscribe((res)=>{
      this.storageList = res;
    });

  }

  getCategories() {
    this.httpClient.get(Urlbase.tienda + "/products2/categoryNodes?id_store="+this.sessionManager.returnIdStore(),{ headers: this.headers,withCredentials:true }).subscribe((res)=>{
      this.categories = res;
      this.selectedCategoryName = this.categories[0].category;
      this.selectedCategory = this.categories[0].id_category;
      this.subCategoryList = this.categories[0].hijos;
      this.subCategoryName = this.categories[0].category;
      let idListToFilter:any[] = [];
      idListToFilter.push(this.categories[0].id_category);
      for(let i:any=0;i<this.categories[0].hijos.length;i=i+1){
        let element = this.categories[0].hijos[i];
        idListToFilter.push(this.categories[0].hijos[i].id_category);
      }
      this.inventoryList = this.inventorylistCopy.filter((element:any) =>{
        return idListToFilter.includes(element.id_CATEGORY);
      })
      if(this.inventoryList.length>=100){
        this.listaElem = this.inventoryList.slice(0,100);
      }else{
        this.listaElem = this.inventoryList;
      }
    });

  }


  setCategoryAll(){
    this.selectedCategoryName="TODAS"
    this.selectedCategory = -1;
    this.subCategoryList = [];
    this.inventoryList = this.inventorylistCopy;
    if(this.inventoryList.length>=100){
      this.listaElem = this.inventoryList.slice(0,100);
    }else{
      this.listaElem = this.inventoryList;
    }
  }

  filterByCategory(item:any){
    if(item.hijos!=null){

    }
  }

  getImgURL(item:any){
    if(item.img == null){
      return {'background-image': 'url(https://tienda724.com/logos/NIT%20900416180-9.jpg)'};
    }else{
      return {'background-image': 'url('+item.img.replace("http://localhost:4200","https://tienda724.com")+')'};
    }
  }


  getImgURL2(item:any){
    if(item.img == null){
      return 'https://tienda724.com/logos/NIT%20900416180-9.jpg';
    }else{
      return item.img.replace("http://localhost:4200","https://tienda724.com");
    }
  }

  getImgURLCategory(item:any){
    if(item.category_URL == null){
      return {'background-image': 'url(https://tienda724.com/logos/NIT%20900416180-9.jpg)'};
    }else{
      return {'background-image': 'url('+item.category_URL.replace("http://localhost:4200","https://tienda724.com")+')'};
    }
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


  setCategory(){
    if(this.selectedCategory == -1){
      this.setCategoryAll();
    }else{

      let item:any = this.categories.find((element:any)=> element.id_category==this.selectedCategory)
      this.selectedCategoryName = item.category;
      this.selectedCategory = item.id_category;
      this.subCategoryList = item.hijos;
      this.subCategoryName = item.category;
      let idListToFilter:any[] = [];
      idListToFilter.push(item.id_category);
      for(let i:any=0;i<item.hijos.length;i=i+1){
        let element = item.hijos[i];
        idListToFilter.push(item.hijos[i].id_category);
      }
      this.inventoryList = this.inventorylistCopy.filter((element:any) =>{
        return idListToFilter.includes(element.id_CATEGORY);
      })
      if(this.inventoryList.length>=100){
        this.listaElem = this.inventoryList.slice(0,100);
      }else{
        this.listaElem = this.inventoryList;
      }

    }
  }

  setSubCategory(item:any){
    console.log(item)
    this.selectedCategoryName = item.category;
    this.selectedCategory = item.id_category;
    if(item.hijos){
      this.subCategoryList = item.hijos;
    }
    this.subCategoryName = item.category;
    let idListToFilter:any[] = [];
    idListToFilter.push(item.id_category);
    this.inventoryList = this.inventorylistCopy.filter((element:any) =>{
      return idListToFilter.includes(element.id_CATEGORY);
    })
    if(this.inventoryList.length>=100){
      this.listaElem = this.inventoryList.slice(0,100);
    }else{
      this.listaElem = this.inventoryList;
    }
  }

  addDetail2(code:any) {
    this.spinner.show();
    console.log(this.disableDoubleClickSearch)
    if(this.disableDoubleClickSearch){
      setTimeout(() => this.spinner.hide(), 1000)
      console.log("DOUBLE CLICK")
      return;
    }else{
      console.log("DOUBLE CLICK")
      // CPrint(code,"da code :3")

      this.disableDoubleClickSearch = true;
      console.log(this.disableDoubleClickSearch)
      // var codeFilter = this.productsObject.filter(item => (String(item.code) === code || String(item.ownbarcode) === code || String(item.product_store_code) === code ));
      if(code == "TEMPOMESA3BANDAS" || code == "TEMPOMESALIBRES" || code == "TEMPOMESAPOOL"){
        this.disableDoubleClickSearch = false;

      setTimeout(() => this.spinner.hide(), 1000)
        console.log("1")
        return;
      }
      // CPrint(codeFilter);
      let key: any;
      this.productsObject.forEach((item:any) => {
        // CPrint("//-----------------------------------");
        // CPrint(item.code);
        // CPrint("//-----------------------------------");
        // CPrint(item.ownbarcode);
        // CPrint("//-----------------------------------");
        // CPrint(item.product_store_code);
        // CPrint("//-----------------------------------");
        if (item.code == code || item.ownbarcode == code || String(item.product_store_code) == code) {
          key = item;
        }
        // else{
        // }
      });


      const product = this.inventoryList.find((item:any) => this.findCode(code, item));
        // var product = this.inventoryList.find(item => (item.code == code || item.ownbarcode == code || String(item.product_STORE_CODE) == code));
        //@ts-ignore
        if (product) {
          this.getPriceListNotAgregated(product, code, product.id_PRODUCT_STORE);
        } else {
          if(localStorage.getItem("SesionExpirada") != "true"){ alert('Ese codigo no esta asociado a un producto.');}
          this.disableDoubleClickSearch = false;
          setTimeout(() => this.spinner.hide(), 1000)
          console.log("4")
        }

      // CPrint("this is array papu: ",this.productsObject)
      // CPrint("this is key", key)
      if (key != null) {
        // CPrint("entro")
        this.productsObject[this.productsObject.indexOf(key)].quantity += 1;
        this.disableDoubleClickSearch = false;
        setTimeout(() => this.spinner.hide(), 1000)
        console.log("5")
      } else {

        const product = this.inventoryList.find((item:any) => this.findCode(code, item));
        // var product = this.inventoryList.find(item => (item.code == code || item.ownbarcode == code || String(item.product_STORE_CODE) == code));
        //@ts-ignore
        if (product) {
          this.getPriceList(product, code, product.id_PRODUCT_STORE);
        } else {
          if(localStorage.getItem("SesionExpirada") != "true"){ alert('Ese codigo no esta asociado a un producto.');}
          this.disableDoubleClickSearch = false;
          setTimeout(() => this.spinner.hide(), 1000)
          console.log("10")
        }
      }
    }

  }


  findCode(code:any, item:any) {

    if (item.ownbarcode == code) {
      return item;
    } else {
      if (String(item.product_STORE_CODE) == code) {
        return item;
      }
    }

  }



  options:any=0


  setItemOptions(i:any){
    this.options = i;
    try{
      this.text = this.productsObject2[this.options].text;
    }catch(e){
      this.text = ""
    }

  }


  getOptions(){
    try{
      return this.productsObject2[this.options].opciones;
    }catch(exception){
      return [];
    }
  }

  getOptionsDescription(){
    try{
      return this.productsObject2[this.options].description.split('-')[0];
    }catch(exception){
      return "";
    }
  }



  clearOptions(){
    this.options = 0;
  }

  saveOptions(){
    console.log("im in")
    this.productsObject2[this.options].text = this.text;
    this.toggleOptions();
  }


  getPriceList(product:any,code:any,id:any){
    this.httpClient.get(Urlbase.tienda+"/store/getOptions?idps=" + id).subscribe(value => {
      this.httpClient.get(Urlbase.tienda + "/store/pricelist?id_product_store="+id,{ headers: this.headers,withCredentials:true }).subscribe((response:any) => {
          if (product) {
            let new_product:any = {
              img: product.img,
              quantity: 1,
              id_storage: this.storageList[0].id_storage,
              price: product.standard_PRICE,
              tax: this.getPercentTax(product.id_TAX),
              id_product_third: product.id_PRODUCT_STORE,
              tax_product: product.id_TAX,
              state: this.commonStateDTO,
              description: product.product_STORE_NAME,
              code: product.code,
              id_inventory_detail: product.id_INVENTORY_DETAIL,
              ownbarcode: product.ownbarcode,
              product_store_code: String(product.product_STORE_CODE),
              pricelist: response,
              priceGen: response[0].price,
              standarPrice: product.standard_PRICE,
              productStoreId: id,
              invQuantity: product.quantity,
              discountCode: response[0].pct_descuento,
              opciones: value,
              text: ""
            };
            new_product.price = product.standard_PRICE;

            this.productsObject.unshift(new_product);
            this.disableDoubleClickSearch = false;
            setTimeout(() => this.spinner.hide(), 1000)
            console.log("6")

          } else {
            this.disableDoubleClickSearch = false;
            setTimeout(() => this.spinner.hide(), 1000)
            console.log("7")
            let codeList;
            this.httpClient.get(Urlbase.tienda + "/products2/code/general?code="+String(code),{ headers: this.headers,withCredentials:true }).subscribe(data => {
              codeList = data;
            //@ts-ignore
            if( data.length == 0 ){
              alert('El codigo no esta asociado a un producto');
            }else{
            }
            });

          }

      },error=>{
        setTimeout(() => this.spinner.hide(), 1000)
        this.disableDoubleClickSearch = false;
        console.log("8")
      });
    },error=>{
      setTimeout(() => this.spinner.hide(), 1000)
      this.disableDoubleClickSearch = false;
      console.log("9")
    });
  }


  getPriceListNotAgregated(product:any,code:any,id:any){
    this.httpClient.get(Urlbase.tienda+"/store/getOptions?idps=" + id).subscribe(value => {
      this.httpClient.get(Urlbase.tienda + "/store/pricelist?id_product_store="+id,{ headers: this.headers,withCredentials:true }).subscribe((response:any) => {
          if (product) {
            let new_product:any = {
              img: product.img,
              quantity: 1,
              id_storage: this.storageList[0].id_storage,
              price: product.standard_PRICE,
              tax: this.getPercentTax(product.id_TAX),
              id_product_third: product.id_PRODUCT_STORE,
              tax_product: product.id_TAX,
              state: this.commonStateDTO,
              description: product.product_STORE_NAME,
              code: product.code,
              id_inventory_detail: product.id_INVENTORY_DETAIL,
              ownbarcode: product.ownbarcode,
              product_store_code: String(product.product_STORE_CODE),
              pricelist: response,
              priceGen: response[0].price,
              standarPrice: product.standard_PRICE,
              productStoreId: id,
              invQuantity: product.quantity,
              discountCode: response[0].pct_descuento,
              opciones: value,
              text: ""
            };
            new_product.price = product.standard_PRICE;

            this.productsObject2.unshift(new_product);
            this.disableDoubleClickSearch = false;
            setTimeout(() => this.spinner.hide(), 1000)
          } else {
            let codeList;
            this.httpClient.get(Urlbase.tienda + "/products2/code/general?code="+String(code),{ headers: this.headers,withCredentials:true }).subscribe(data => {
              codeList = data;
              this.disableDoubleClickSearch = false;
              setTimeout(() => this.spinner.hide(), 1000)
            //@ts-ignore
            if( data.length == 0 ){

              alert('El codigo no esta asociado a un producto');
            }else{
            }
            });

          }

      },error=>{
        this.disableDoubleClickSearch = false;
        setTimeout(() => this.spinner.hide(), 1000)
        console.log("2")
      });
    },error=>{
      setTimeout(() => this.spinner.hide(), 1000)
      this.disableDoubleClickSearch = false;
      console.log("3")
    });
  }



  getPercentTax(idTaxProd:any){
    let thisTax;
    let taxToUse;

    for (thisTax in this.taxesList){
          if(idTaxProd == this.taxesList[thisTax].id_tax_tariff){
            taxToUse = this.taxesList[thisTax].percent/100;
          }
      }

      return taxToUse;
  }


  upQuantity(elemento:any){

    console.log(elemento)
    this.addDetail2(elemento.ownbarcode)

  }

  downQuantity(elemento:any){

    if(1<elemento.quantity){
      elemento.quantity-=1;
    }

  }

  getQuantity(){

    let quantity = 0;

    this.productsObject.forEach(
      (element:any) => {
        quantity = quantity + element.quantity;
      }
    )

    return quantity;

  }


  individualDelete(element:any, i:any){

    console.log(element)

    let elem = this.productsObject.filter( (product:any) => product.product_store_code == element.product_store_code )[0]
    let index = this.productsObject.findIndex(  (product:any) => product.product_store_code == element.product_store_code  );

    if(elem.quantity > 1){
      elem.quantity-=1;
    }else{
      this.productsObject.splice(index,1);
    }
    this.productsObject2.splice(i, 1);
  }


  individualDeleteDesagregada(element:any, i:any){

    console.log(element)

    let elem = this.productsObject.filter( (product:any) => product.product_store_code == element.product_store_code )[0]
    let index = this.productsObject.findIndex(  (product:any) => product.product_store_code == element.product_store_code  );

    if(elem.quantity > 1){
      elem.quantity-=1;
    }else{
      this.productsObject.splice(index,1);
    }
    this.productsObject2.splice(i, 1);
  }



  postNewDetails(){
    let detailList = '';
    //GENERO LA LISTA DE DTOs DE DETALLES
    let notes = "";
    let detailListOpciones = '';
    this.productsObject2.forEach((item:any) => {

      if(item.opciones != [] ||  item.opciones.length!=0){
        item.opciones.forEach((elem:any) => {
          console.log(elem.check)
          if(elem.check){
            notes = notes +  "opciones=" + elem.opcion+";";
          }
        })
      }

      notes=notes+"opciones="+item.text+";";


      if(notes==""){
        detailListOpciones = detailListOpciones+ "{"+item.id_product_third+",0},"
      }else{
        detailListOpciones = detailListOpciones+ "{"+item.id_product_third+","+notes.substring(0,notes.length-1)+"},"
      }


      notes=""

    });

    this.productsObject.forEach((item:any) => {
      if(item.pricelist[0].pct_descuento == 0 ){
        detailList = detailList+ "{"+item.id_product_third+","+item.pricelist[0].price+","+item.tax_product+","+item.quantity+"},"
      }else{
        detailList = detailList+ "{"+item.id_product_third+","+(item.pricelist[0].price-(item.pricelist[0].price * item.pricelist[0].pct_descuento)/100)+","+item.tax_product+","+item.quantity+"},"
      }
    });



    this.httpClient.post(Urlbase.facturacion + "/billing/agregarProductosMesaOpciones?idbill="+this.objMesa.id_BILL+"&detallepedido="+detailList.substring(0, detailList.length - 1)+"&detallepedidomesa="+detailListOpciones,{},{ headers: this.headers,withCredentials:true }).subscribe(response => {

      if(response){
        this.vaciarCarrito();
        localStorage.removeItem("checkReload");
        this.router.navigate(['detailmesa']);
      }else{
        alert("Hubo un problema procesando su solicitud.")
      }

    })
  }


  toggleDesagregada(){
    console.log("TOGGLE")
    this.opcionesModal = !this.opcionesModal;
    this.mainWindow  = !this.mainWindow;
  }


  noDecimal(number:any){
    return Math.ceil(number);
  }


  getPriceTotal(){

    let price = 0;

    this.productsObject.forEach(
      (element:any) => {
        if(element.pricelist[0].pct_descuento == 0 ){
          price = price + (element.pricelist[0].price  * element.quantity);
        }else{
          price = price + ((element.pricelist[0].price-(element.pricelist[0].price * element.pricelist[0].pct_descuento)/100)  * element.quantity);
        }

      }
    )

    return Math.ceil(price);
  }


  listLoad(){

    this.EstadoBusquedaProducto = 1;

    if(this.inputForCode == ""){
      this.listaElem = this.inventoryList.slice(0,100);
      this.listaElem.forEach((element:any) => {
        //@ts-ignore
        element.priceGen = this.priceList.filter((item:any) => item.id_PRODUCT_STORE == element.id_PRODUCT_STORE)[0].price
        //@ts-ignore
        element.discountCode =this.priceList.filter((item:any) => item.id_PRODUCT_STORE == element.id_PRODUCT_STORE)[0].pct_descuento
      })
    }else{

      this.listaElem = [];

      this.listaElem = this.inventoryList.filter(element => element.product_STORE_NAME.toLowerCase().includes(this.inputForCode.toLowerCase()) || element.ownbarcode == this.inputForCode || element.product_STORE_CODE == this.inputForCode)

      if(!(this.listaElem.length<100)){
        this.listaElem = this.listaElem.slice(0,100);
      }

      this.listaElem.forEach((element:any) => {
        //@ts-ignore
        element.priceGen = this.priceList.filter((item:any) => item.id_PRODUCT_STORE == element.id_PRODUCT_STORE)[0].price
        //@ts-ignore
        element.discountCode =this.priceList.filter((item:any) => item.id_PRODUCT_STORE == element.id_PRODUCT_STORE)[0].pct_descuento
      })
    }

    this.EstadoBusquedaProducto = 2;
  }


  vaciarCarrito(){
    while(this.productsObject.length > 0) {
      this.productsObject.pop();
    }
    while(this.productsObject2.length > 0) {
      this.productsObject2.pop();
    }
  }


  toggleOptions(){
    this.opcionesModal = !this.opcionesModal
    this.opcionesModal2 = !this.opcionesModal2
  }

  toggleAgregadas(){
    console.log("TOGGLE")
    this.agregadaModal = !this.agregadaModal;
    this.mainWindow  = !this.mainWindow;
  }


  deleteModal = false;
  listaEliminar:any = []


  toggleDelete(){
    this.agregadaModal = !this.agregadaModal;
    this.deleteModal = !this.deleteModal;
  }


  itemToDelete:any;

  setItemToDelete(item:any){
    console.log(item)
    this.itemToDelete = item;
    for(let i=0;i<this.productsObject2.length;i++){
      if(this.productsObject2[i].id_product_third==item.id_product_third){
        this.listaEliminar.push({item: this.productsObject2[i],index:i})
      }
    }
  }

  cleanLisToDelete(){
    this.listaEliminar=[];
  }



  setTodos(){
    this.getCategories();
  }
}
