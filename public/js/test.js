/_ ES5 _/
var isMomHappy = false;

// Promise
var willIGetNewPhone = new Promise(
    function (resolve, reject) {
        if (isMomHappy) {
            var phone = {
                brand: 'Samsung',
                color: 'black'
            };
            resolve(phone); // fulfilled
        } else {
            var reason = new Error('mom is not happy');
            reject(reason); // reject
        }

    }
);



var funcName = (params) => params + 2;

(parameters) => { statements }
() => { statements }
parameters => { statements }
^
parameters => expression
// is equivalent to:
function (parameters){
  return expression;
}

var double = num => num * 2