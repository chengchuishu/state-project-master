import os from 'os'
import fs from 'fs'
import path from 'path'
import store from '@/vuexText/startValus';

export const appUserBaseDir = path.join(os.homedir(), 'YunshenStateMachine');
export const dataMapResource = path.join(appUserBaseDir, 'dataMapResource');

const dataMapFileName = 'dataMap.json';
const defaultDataMap = ["service","event","callback"];
//console.log(path.dirname(appUserBaseDir),"--------------------/////--------------------------")
export const initResourse = function(){
    if(!fs.existsSync(appUserBaseDir)){
        mkDirsSync(appUserBaseDir);
    }
    if(!fs.existsSync(dataMapResource)){
        mkDirsSync(dataMapResource);
    }

    if(!fs.existsSync(path.join(dataMapResource, dataMapFileName))){
        dataMapWriteEvent(JSON.stringify({dataMap: defaultDataMap}));
    }else{
        setDataMapFromFile();
    }

}

initResourse();

//数据集写入
export function dataMapWriteEvent(jsonString){
    fs.writeFileSync(path.join(dataMapResource, dataMapFileName), jsonString);
    setDataMapFromFile();
}

//数据集更新
export function setDataMapFromFile(){
    let jsonString = fs.readFileSync(path.join(dataMapResource, dataMapFileName));
    store.dispatch('setDataMap',jsonString?JSON.parse(jsonString).dataMap:[]);
}

// 递归创建目录 同步方法
export function mkDirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkDirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}