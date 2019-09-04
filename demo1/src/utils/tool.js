import { className } from './config';

export const getElementNode = (name, id) => { // 获取元素
  return document.getElementsByClassName(`js-${name}-${id}`)[0];
}

export const setStyle = (element, style) => {
  Object.keys(style).forEach((item) => {
    element.style[item] = style[item];
  });
};

// 生成一个不重复的函数名，用来做 jsonp 请求的回调
export const getCallbackName = (fn) => {
  const name = `fn_${new Date().getTime()}`;
  window[name] = fn;
  return name;
};

export const deleteNode = (node) => { // 删除节点
  if (Array.isArray(node)) {
    node.forEach(item => item.remove());
  } else {
    node.remove();
  }
};

function stringToByteArr(str){
  var array = new Array(str.length);
  var i;
  var il;

  for (i = 0, il = str.length; i < il; ++i) {
    array[i] = str.charCodeAt(i) & 0xff;
  }

  return array;

}

function strRepeat(target, n){
  return (new Array(n + 1)).join(target);
}

function XOREncode(d, name){
  var k;
  if (d.length > name.length){
    k = strRepeat(name, Math.floor(d.length/name.length)) + name.substring(0, d.length%name.length);
  } else {
    k = name.substring(0, d.length);
  }

  var encodeStr = '';
  for(let i=0; i<d.length; i++) {
     encodeStr += String.fromCharCode(d[i].charCodeAt(0).toString(10) ^ k[i].charCodeAt(0).toString(10)); // XORing with letter 'K'
  }
  return encodeStr;
}

function byteToString(uint8arr) {
  if (!uint8arr) {
    return '';
  }
  return String.fromCharCode.apply(null, new Uint8Array(uint8arr));
};

export const gzip = (trace, callbackName) => {
  if(window.Zlib){
    var gzip = new Zlib.Gzip(stringToByteArr(XOREncode(JSON.stringify(trace), callbackName)));
    var compressed_fp_json = byteToString(gzip.compress());
    var base64_fp = window.btoa(compressed_fp_json).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '.');
    return base64_fp;
  }
}

export const jsonToParams = (json) => Object.keys(json).map(function (key) {
  return encodeURIComponent(key) + "=" + encodeURIComponent(typeof json[key] === 'object' ? JSON.stringify(json[key]) : json[key]);
}).join("&");

export const deepObjectMerge = (FirstOBJ, SecondOBJ) => { // 深度合并对象
  for (var key in SecondOBJ) {
      FirstOBJ[key] = FirstOBJ[key] && FirstOBJ[key].toString() === "[object Object]" ?
          deepObjectMerge(FirstOBJ[key], SecondOBJ[key]) : FirstOBJ[key] = SecondOBJ[key];
  }
  return FirstOBJ;
}

export function deepCopy(obj) {
  const objClone = Array.isArray(obj) ? [] : {};
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      if (obj.hasOwnProperty(key)) { // eslint-disable-line
        if (obj[key] && typeof obj[key] === 'object') {
          objClone[key] = deepCopy(obj[key]);
        } else {
          objClone[key] = obj[key];
        }
      }
    });
  }
  return objClone;
}

export const deleteCallBack = (key) => {
  delete window[key];
};
