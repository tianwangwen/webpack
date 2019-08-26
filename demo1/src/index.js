import  _  from  'lodash';
import './style/index.css';
import './style/index.scss';

function  createElement(){

  let  div  =  document.createElement('div');

  div.innerHTML  =  _.join(['my',  'name',  'is',  'leo'],  '');
  div.className = 'box';

  return  div;

}

document.body.appendChild(createElement());
