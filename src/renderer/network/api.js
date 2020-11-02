import {http} from './http';
import ApiList from './api.json'

// let HOST_API = process.env.HOST_API;

//测试环境
// const HOST_HOLOWEB = "http://127.0.0.1:8986/";
// const HOST_HOLOWEB = "http://10.11.23.138:81/";
// let HOST_API = "http://10.11.23.136:8080/holo/";
// let HOST_HOLO_API = "http://10.11.23.136:8080/holo/";
// let HOST_AUTHOR_API = "http://10.11.23.136:8080/"

//生产环境
const HOST_HOLOWEB = "http://desk.holo.aiyunshen.com/";
let HOST_API = "http://api.holo.aiyunshen.com/holo/";
let HOST_HOLO_API = "http://api.holo.aiyunshen.com/holo/";
let HOST_AUTHOR_API = 'https://api.holo.aiyunshen.com/'


let api = {
    getUrl(key,type){
        //暂时不配置环境变量
        if(type == 'uat'){
            return HOST_API+ApiList[key]
        }else if(type == 'auth'){
            return HOST_AUTHOR_API+ApiList[key]
        }else{
            return HOST_HOLO_API+ApiList[key]
        }
    },
    getHoloCarouselList:(params)=>
      http.get(`${HOST_HOLO_API}holo/carousel/list`,params),

    getHoloDisplayConfig:(params)=>
        http.get(`${HOST_HOLO_API}holo/display/config`,params),

    /**
     *
     * @returns {*|Promise<any>}
     */
    getHoloworks: (page, size) => http.get(HOST_API + 'api/work/getallbystatus', {
        page: page ? page: 0,
        size: size ? size: 10,
        status: 1
    }),

    /**
     *
     *
     * @returns {*|Promise<any>}
     */
    getMedias: (page, size) => http.get(HOST_API + 'api/media/getall', {
        page: page ? page : 0,
        size: size ? size : 10
    }),
};

export {
    api,
    HOST_HOLOWEB
}
