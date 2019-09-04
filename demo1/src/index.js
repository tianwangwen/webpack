import './assets/css/index.css';
import './utils/newSuperCode';

(function(){
    var a = new SuperCode({
        type: 'text',
        s: '12',
        onCallback: (isValidated) => { console.log(isValidated ? '通过' : '没有') },
        // textStyle: {
        //     // width: 10,
        //     background: '#000',
        // }
    });
    var b = new SuperCode({
        type: 'drag',
        s: '33',
        // messageStyle: {
        //     height: 50,
        //     background: '#000',
        // }
    });
    const btn = document.getElementById('btn');
    const btn2 = document.getElementById('btn2');
    const btn3 = document.getElementById('btn3');
    btn.addEventListener('click', function() {
        a.show();
        // setTimeout(() => a.hide(), 3000);
    }, false);
    btn2.addEventListener('click', function() {
        b.show();
    }, false);
})()
