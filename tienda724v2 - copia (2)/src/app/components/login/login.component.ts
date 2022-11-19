import { Component, OnInit } from '@angular/core';
import { Urlbase } from '../../classes/urls';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import * as jQuery from 'jquery';
import 'bootstrap-notify';
import { SessionManagerService } from 'src/app/services/sessionManager/session-manager.service';
import {AuthLoginResult} from "../../types/auth.types";
let $: any = jQuery;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private router: Router,
              private sessionManager: SessionManagerService,
              ) { }


  usuario: string = "";
  clave: string = "";

  ngOnInit(): void {

  }

  showNotification(from:any, align:any, id_type?: any, msn?: any, typeStr?: any){
    const type = ['', 'info', 'success', 'warning', 'danger'];

    const color = Math.floor((Math.random() * 4) + 1);

    $.notify({
      icon: "notifications",
      message: msn ? msn : "<b>Noficación automatica </b>"

    }, {
        type: typeStr ? typeStr : type[id_type ? id_type : 2],
        timer: 200,
        placement: {
          from: from,
          align: align
        }
      });
  }

  login(){
    this.sessionManager.login(this.usuario,this.clave).then(value => {
      this.router.navigate(["/adminrestaurant"], { relativeTo: this.route });
    }).catch(reason => {
      alert("Se presentó un problema al intentar iniciar sesión.")
    })
  }

}
