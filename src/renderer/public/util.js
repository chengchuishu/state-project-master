var fs = require('fs')
import _ from 'lodash'

export function isObject(val) {
    return Object.prototype.toString.call(val) === "[object Object]";
}

export function isEmpty(val) {
    return (
        val === undefined ||
        val === null ||
        (typeof val === "string" && val.length === 0) ||
        (isArray(val) && val.length === 0) ||
        (typeof val === "number" && isNaN(val))
    );
}

export function getQueryString(name) {
    if (name == undefined || name == null || name == '') {
        console.error('获取参数失败');
        return false
    }
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return decodeURI(r[2]);
    } else {
        return null;
    }
}

export function isAllEmpty(...args) {
    for (let i = 0; i < args.length; i++) {
        if (!isEmpty(args[i])) {
            return false;
        }
    }
    return true;
}

export function isAllFalse(...args) {
    for (let i = 0; i < args.length; i++) {
        if (args[i]) {
            return false;
        }
    }
    return true;
}

export function isAllTrue(...args) {
    for (let i = 0; i < args.length; i++) {
        if (!args[i]) {
            return false;
        }
    }
    return true;
}

export function isAllNotEmpty(...args) {
    for (let i = 0; i < args.length; i++) {
        if (isEmpty(args[i])) {
            return false;
        }
    }
    return true;
}

export function isDate(val) {
    return Object.prototype.toString.call(val) === "[object Date]";
}

export function isArray(val) {
    return Object.prototype.toString.call(val) === "[object Array]";
}

export function isNumber(val) {
    return Object.prototype.toString.call(val) === "[object Number]";
}

export function isUndefined(val) {
    return Object.prototype.toString.call(val) === "[object Undefined]";
}

export function isString(val) {
    return Object.prototype.toString.call(val) === "[object String]";
}

export function isFunction(val) {
    return Object.prototype.toString.call(val) === "[object Function]";
}

export function isRegExp(val) {
    return Object.prototype.toString.call(val) === "[object RegExp]";
}

export function isSameDay(d1, d2) {
    if (arguments.length < 2) {
        return false;
    }

    let date1, date2;

    if (isDate(d1)) {
        date1 = d1;
    } else if (isNumber(d1)) {
        if (String(d1).length === 10) d1 = parseInt(d1) * 1000;
        date1 = new Date(d1);
    } else {
        date1 = new Date(d1);
    }

    if (isDate(d2)) {
        date2 = d2;
    } else if (isNumber(d2)) {
        if (String(d2).length === 10) d2 = parseInt(d2) * 1000;
        date2 = new Date(d2);
    } else {
        date2 = new Date(d2);
    }

    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

export function isToday(d) {
    if (arguments.length === 0) {
        return false;
    }

    return isSameDay(Date.now(), d);
}

export function parseTime(time, cFormat) {
    if (arguments.length === 0) {
        return null;
    }

    const format = cFormat || "{y}-{m}-{d} {h}:{i}:{s}";
    let date;
    if (isDate(time)) {
        date = time;
    } else if (isNumber(time)) {
        if (String(time).length === 10) time = parseInt(time) * 1000;
        date = new Date(time);
    } else {
        date = new Date(time);
    }

    const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
    };

    const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key];
        if (key === "a")
            return ["一", "二", "三", "四", "五", "六", "日"][value - 1];
        if (result.length > 0 && value < 10) {
            value = "0" + value;
        }
        return value || 0;
    });

    return time_str;
}


export function scrollTo(element, to, duration) {
    if (duration <= 0) return;
    const difference = to - element.scrollTop;
    const perTick = (difference / duration) * 10;
    setTimeout(() => {
        element.scrollTop = element.scrollTop + perTick;
        if (element.scrollTop === to) return;
        scrollTo(element, to, duration - 10);
    }, 10);
}

export function toggleClass(element, className) {
    if (!element || !className) {
        return;
    }
    let classString = element.className;
    const nameIndex = classString.indexOf(className);
    if (nameIndex === -1) {
        classString += "" + className;
    } else {
        classString =
            classString.substr(0, nameIndex) +
            classString.substr(nameIndex + className.length);
    }
    element.className = classString;
}

export function addClass(element, className) {
    if (!element || !className) {
        return;
    }
    let classString = element.className;
    const nameIndex = classString.indexOf(className);
    if (nameIndex === -1) {
        classString += "" + className;
        element.className = classString;
    }
}

export function removeClass(element, className) {
    if (!element || !className) {
        return;
    }
    let classString = element.className;
    const nameIndex = classString.indexOf(className);
    if (nameIndex !== -1) {
        classString =
            classString.substr(0, nameIndex) +
            classString.substr(nameIndex + className.length);
        element.className = classString;
    }
}

export function debounce(func, wait, immediate) {
    let timeout, args, context, timestamp, result;

    const later = function() {
        // 据上一次触发时间间隔
        const last = +new Date() - timestamp;

        // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
        if (last < wait && last > 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
            if (!immediate) {
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            }
        }
    };

    return function(...args) {
        context = this;
        timestamp = +new Date();
        const callNow = immediate && !timeout;
        // 如果延时不存在，重新设定延时
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };
}

export function formatTime(time) {
    if (!time) {
        return 'error'
    }
    let s = parseInt(time);
    let m = 0;
    let h = 0;
    let day = 0;
    let mouth = 0;
    let year = 0;
    if (s > 60) {
        m = parseInt(s / 60);

        s = parseInt(s % 60);

        if (m > 60) {
            h = parseInt(m / 60);

            m = parseInt(m % 60);
            if (h > 24) {
                day = parseInt(h / 24);

                h = parseInt(h % 24);

                if (day > 30) {
                    mouth = parseInt(day / 30);

                    day = parseInt(day % 30);
                    if (mouth > 12) {
                        year = parseInt(mouth / 12);

                        mouth = parseInt(mouth % 12);
                    }
                }
            }
        }
    }
    var result = "" + parseInt(s) + "秒";

    if (m > 0) {
        result = "" + parseInt(m) + "分" + result;
    }
    if (h > 0) {
        result = "" + parseInt(h) + "小时" + result;
    }
    if (day > 0) {
        result = "" + parseInt(day) + "天" + result;
    }
    if (mouth > 0) {
        result = "" + parseInt(mouth) + "个月" + result;
    }
    if (year > 0) {
        result = "" + parseInt(year) + "年" + result;
    }

    return result;
}

/* 文件流下载文件 */
export function fnDownLoad(file, fileName) {
    let blob = new Blob([file], {
        type: "application/vnd.ms-excel;charset=UTF-8"
    });
    if (typeof window.navigator.msSaveBlob !== "undefined") {
        window.navigator.msSaveBlob(blob, `${fileName}`);
    } else {
        let URL = window.URL || window.webkitURL;
        let objectUrl = URL.createObjectURL(blob);
        if (fileName) {
            var a = document.createElement("a");
            // safari doesn't support this yet
            if (typeof a.download === "undefined") {
                window.location = objectUrl;
            } else {
                a.href = objectUrl;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } else {
            window.location = objectUrl;
        }
    }
}

// 根据楼栋id过滤出楼栋名称
export function handlBuildingName(id, listData) {
    if (isEmpty(id) || isEmpty(listData)) {
        console.error("缺少楼栋信息")
        return ''
    }
    let list = listData.filter(item => {
        return id === item.buildingId
    })

    let name = list.length > 0 && list[0].desc || ''
    return name ? name : ''
}

// 根据机器人状态id过滤出状态名称
export function handlStatusName(id, listData) {
    if (isEmpty(id) || isEmpty(listData)) return ''
    let list = listData.filter(item => {
        return id === item.code
    })

    let name = list.length > 0 && list[0].desc || ''
    return name ? name : ''
}

// 根据楼栋id 和 楼层id 过滤出楼层名称
export function handleFloorName(b_id, id, listData) {
    if (isEmpty(id) || isEmpty(b_id) || isEmpty(listData)) return ''

    listData = listData.filter(item => {
        return b_id === item.buildingId
    })

    let list = listData[0].floorList.filter(item => {
        return item.floorId === id
    })

    let name = list.length > 0 && list[0].desc || ''
    return name ? name : ''
}

//将base64转换为文件
export function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {
        type: mime
    });
}

//图片尺寸处理
export function photoImgLoad(type, e) {
    var domObj = e.target;
    var h = domObj.offsetHeight,
        w = domObj.offsetWidth;
    domObj.style.position = 'absolute';
    if (type == 'headerPhoto') {
        domObj.style.width = '100%';
        domObj.style.height = 'auto';
        domObj.style.top = '50%';
        domObj.style.marginTop = (-domObj.offsetHeight / 2) + 'px';
        /*if(h-w<=3||w-h<=3){
          domObj.style.height= '100%';
          domObj.style.top=0;
          domObj.style.marginTop=0
        }*/
        return false
    }
    if (h > w) {
        domObj.style.height = '100%';
        domObj.style.width = 'auto';
        domObj.style.left = '50%';
        domObj.style.marginLeft = (-domObj.offsetWidth / 2) + 'px';
    } else if (h < w) {
        domObj.style.height = 'auto';
        domObj.style.width = '100%';
        domObj.style.top = '50%';
        domObj.style.marginTop = (-domObj.offsetHeight / 2) + 'px';
    }
}

export const loadCss = function(src){
    if(checkCss(src)){
        return
    }
    //引入css
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.href = src;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    head.appendChild(link);

    function checkCss(href){
        let links = document.getElementsByTagName("link");
        for(let i = 0;i<links.length;i++){
            if(href == links[i].href){
                return true
            }
        }

        return false
    }
}


export const loadJs = function(url, callback) {

    if(Object.prototype.toString.call(url) == "[object String]"){
        loadUrlItem(url,callback);
    }else if(Object.prototype.toString.call(url) == "[object Array]"){
        let urls = url,i=0;

        recursionLoad(i);
        function recursionLoad(num){
          if(num<urls.length){
            loadUrlItem(urls[num],()=>{
              recursionLoad(i++)
            })
          }else{
            callback();
          }
        }

    }else{
        console.error('参数错误！');
    }

    function loadUrlItem(url,callback){
        let check = checkScriptSrc(url);
        if(check){
            if (typeof(callback) != "undefined") {
                callback();
            }
            return
        }
        var script = document.createElement('script');
        script.type = "text/javascript";
        if (typeof(callback) != "undefined") {
            if (script.readyState) {
                script.onreadystatechange = function() {
                    if (script.readyState == "loaded" || script.readyState == "complete") {
                        script.onreadystatechange = null;
                        callback();
                    }
                }
            } else {
                script.onload = function() {
                    callback();
                }
            }
        }
        script.src = url;
        document.body.appendChild(script);
    }

    function checkScriptSrc(src){
        let scripts = document.getElementsByTagName("script");
        for(let i = 0;i<scripts.length;i++){
            if(src == scripts[i].src){
                return true
            }
        }

        return false
    }

}


export function autoAddEllipsis(pStr, pLen) {
    let _ret = cutString(pStr, pLen)
    let _cutFlag = _ret.cutflag
    let _cutStringn = _ret.cutstring

    if (_cutFlag == '1') {
        return `${_cutStringn}...`
    } else {
        return _cutStringn
    }

    function cutString(pStr, pLen) {
        // 原字符串长度
        let _strLen = pStr.length
        let _tmpCode
        let _cutString
            // 默认情况下，返回的字符串是原字符串的一部分
        let _cutFlag = '1'
        let _lenCount = 0
        let _ret = false

        if (_strLen <= pLen / 2) {
            _cutString = pStr
            _ret = true
        }
        if (!_ret) {
            for (let i = 0; i < _strLen; i++) {
                if (isFull(pStr.charAt(i))) {
                    _lenCount += 2
                } else {
                    _lenCount += 1
                }
                if (_lenCount > pLen) {
                    _cutString = pStr.substring(0, i)
                    _ret = true
                    break
                } else if (_lenCount == pLen) {
                    _cutString = pStr.substring(0, i + 1)
                    _ret = true
                    break
                }
            }
        }
        if (!_ret) {
            _cutString = pStr
            _ret = true
        }
        if (_cutString.length == _strLen) {
            _cutFlag = '0'
        }

        return {
            cutstring: _cutString,
            cutflag: _cutFlag
        }
    }

    function isFull(pChar) {
        for (let i = 0; i < pChar.strLen; i++) {
            if (pChar.charCodeAt(i) > 128) {
                return true
            } else {
                return false
            }
        }
    }
}

export const getOffsetLeft = function(obj,id) {
    var tmp = obj.offsetLeft;
    var val = obj.offsetParent;
    while (val != null) {
        if(val.hasAttribute("id")&&val.getAttribute("id")==id){
            break;
        }
        tmp += val.offsetLeft;
        val = val.offsetParent;
    }
    return tmp;
}


export const getOffsetTop = function(obj,id) {
    var tmp = obj.offsetTop;
    var val = obj.offsetParent;
    while (val != null&&val.getAttribute("id")!=id) {
        if(val.hasAttribute("id")&&val.getAttribute("id")==id){
            break;
        }
        tmp += val.offsetTop;
        val = val.offsetParent;
    }
    return tmp;
}

export const getOffsetBottom = function(obj,id) {
    var tmp = obj.OffsetBottom;
    var val = obj.offsetParent;
    while (val != null&&val.getAttribute("id")!=id) {
        if(val.hasAttribute("id")&&val.getAttribute("id")==id){
            break;
        }
        tmp += val.OffsetBottom;
        val = val.offsetParent;
    }
    return tmp;
}