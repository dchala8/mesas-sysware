export interface AuthLoginResult {
  id_usuario: string,
  id_aplicacion: number,
  usuario: string,
  menus: string[],
  roles: string[],
  id_third: string,
  third:{
    fist_name: string,
    second_name: string,
    last_name: string,
    second_last_name: string,
    fullname: string,
    document_type: string,
    document: string,
    id_third_father: string,
    id_person: string,
    img: string
  },
  third_father:{
    document: string,
    document_type: string,
    fullname: string
  },
  token: string
}
