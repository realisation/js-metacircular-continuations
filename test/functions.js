const commons = require('./commons')
const AsyncInterpreter = commons.AsyncInterpreter
const expect = commons.expect

describe('vanilla function calls', function () {

  it('function should accept undefined as an argument and return it',  function (done) {

    new AsyncInterpreter(
      ' function test(a) { return a }; test(undefined); '
    ).evaluate().then(function(value) {
      expect(value).to.equal(undefined)
      done()
    }).catch(function (err) { 
      done(err) 
    })

  })

  it('Function returning "zult" should return "zult"', function (done) {

    new AsyncInterpreter(
      'function crashTest () { return "zult" }; crashTest() '
    ).evaluate().then(function (value) {
      expect(value).to.equal('zult')
      done()
    }).catch(function (err) { done(err) }) 
  })

  it('declared function can accept a property after being called', function (done) {

    new AsyncInterpreter(
      ' function one() {};  one();  one.two = 3; one.two '
    ).evaluate().then(function (value) {
      expect(value).to.equal(3)
      done()
    }).catch(function (err) { done(err) })

  })

}) 

describe('bind', function () {

  it('.bind should bind `this` and return a new function and call it immediately', function (done) {

    new AsyncInterpreter(
      '(function(b, c, d) {return this.a + b + c + d}).bind({a: 1})(2, 3, 4)'
    ).evaluate().then(function (value) {
      expect(value).to.equal(10)
      done()
    }).catch(function (err) { 

      done(err) 
    
    })

  })

  it('should execute .bind properly', function (done) {

    new AsyncInterpreter(
      ' var x = { x: 33 }; function y () { return this.x }; var z = y.bind(x); z(); '
    ).evaluate().then(function (value) {
      expect(value).to.equal(33)
      done()
    }).catch(function (err) { done(err) })

  })

  it('should execute .bind repeatedly with arguments', function (done) {

    new AsyncInterpreter(
      '(function(){return arguments}).bind(null, 2).bind(null,3)(4,5)'
    ).evaluate().then(function (value) {
      expect(value).to.deep.equal({ '0': 2, '1': 3, '2': 4, '3': 5 })
      done()
    }).catch(function (err) { done(err) })

  })

  it('should isolate repeated partial application of arguments with .bind', function (done) {

    new AsyncInterpreter(
      'function binder(a,b,c,d){return a + b + c + d}; var half = binder.bind(null, 1,2); [half.bind(null,3,4)(),half(4,5)]'
    ).evaluate().then(function (value) {
      expect(value).to.deep.equal([10,12])
      done()
    }).catch(function (err) { done(err) })

  })


})

describe('apply', function () {

  it('.apply should bind `this` and unroll arguments array', function (done) {

    new AsyncInterpreter(
      '(function(b, c, d) {return this.a + b + c + d}).apply({a: 1}, [2,3,4])'
    ).evaluate().then(function (value) {
      expect(value).to.equal(10)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  it('should execute .apply properly concerning arguments', function (done) {

    new AsyncInterpreter(
      ' var safari = function (a,b,c) { return a + b + c }; safari.apply(null,[1,2,3]) '
    ).evaluate().then(function (value) {
      expect(value).to.equal(6)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  it('should execute .apply properly concerning the this keyword', function (done) {

    new AsyncInterpreter(
      ' var x = function () { return this.y }; var z = { y: 99 }; x.apply(z) '
    ).evaluate().then(function (value) {
      expect(value).to.equal(99)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

})



describe('call', function () {

  it('.call should use correct `this` and copy remaining arguments', function (done) {

    new AsyncInterpreter(
      '(function(b, c, d) {return this.a + b + c + d}).call({a: 1}, 2, 3, 4)'
    ).evaluate().then(function (value) {
      expect(value).to.equal(10)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  it('should execute .call properly', function (done) {

    new AsyncInterpreter(
      ' var crocodile = { swan: 55 }; function ghostbusters() { return this.swan }; ghostbusters.call(crocodile) '
    ).evaluate().then(function (value) {
      expect(value).to.equal(55)
      done()
    }).catch(function (err) {
      done(err)
    })

  })

})



describe('closures', function () {

  it('Repeated closure calls create intermediate scopes', function (done) {

    new AsyncInterpreter(
      // ' function new_close() { var a = 1; return function() { a = a + 1;  return a } }; var q = new_close(); q(); q(); '
      ' function new_close() { var a = 1; return function() { a = a + 1;  return a } }; var q = new_close(); q(); [q(),(new_close())()] '
    ).evaluate().then(function (value) {
      expect(value).to.deep.equal([3, 2])
      done()
    }).catch(function (err) {

      done(err)
    })
  
  })



  it('should be able to handle a basic closure', function (done) {

    new AsyncInterpreter(
      " var egg = function () { var squeegie = 'hawk'; return function () { return squeegie } }; var basket = egg(); basket(); "
    ).evaluate().then(function (value) {
      expect(value).to.equal('hawk')
      done()
    }).catch(function (err) {
      done(err)
    })

  })

  it('should be able to create closures with classes', function (done) {

    //    function Jello () {
    //      this.anthropocene = 2;
    //      this.future = function () {
    //        this.anthropocene += 36;
    //      };
    //      this.whodunit = function () {
    //        return this.anthropocene;
    //      }
    //    }
    //    var petri = new Jello();
    //    petri.future();
    //    var dish = new Jello();
    //    dish.future();
    //    dish.future();
    //    return petri.whodunit() + dish.whodunit();
    //  })()

    new AsyncInterpreter(
      " (function(){ function Jello () { this.anthropocene = 2; this.future = function () { this.anthropocene += 36; }; this.whodunit = function () { return this.anthropocene; } } var petri = new Jello(); petri.future(); var dish = new Jello(); dish.future(); dish.future(); return petri.whodunit() + dish.whodunit(); })() "
    ).evaluate().then(function (value) {
      expect(value).to.equal(112)
      done()
    }).catch(function (err) {
      done(err)
    })

  })
 

  it('should increment root level variable from two levels of closure nesting', function (done) {

    //  (function() {
    //    var a = 5;
    //    function electric () {
    //      return a
    //    };
    //    function eel () {
    //      a++;
    //      return function () {
    //        var b = a++;
    //        return b
    //      };
    //    };
    //    var sunset = eel();
    //    return sunset() + a + electric();
    //  })()

    new AsyncInterpreter(
      "  (function() { var a = 5; function electric () { return a }; function eel () { a++; return function () { var b = a++; return b }; }; var sunset = eel(); return sunset() + a + electric(); })() "
    ).evaluate().then(function (value) {
      expect(value).to.equal(20)
      done()
    }).catch(function (err) {
      done(err)
    })
  })


  xit('should properly evaluate independent scopes from distinct instances of a single closure', function (done) {

    // function snake () {
    //    var eggs = 0;
    //    return function () {
    //      return eggs++
    //    }
    //  };
    //  var salad = snake();
    //  var somberero = snake();
    //  salad().toString()
    //  salad().toString()
    //  salad().toString()
    //  sombrero().toString()
    //  sombrero().toString()
    //  sombrero().toString() 

    new AsyncInterpreter(
      ' function snake () { var eggs = 0; return function () { return eggs++ } }; var salad = snake(); var sombrero = snake(); salad().toString()'//+ salad().toString() + salad().toString() + sombrero().toString() + sombrero().toString() + sombrero().toString() '
    ).evaluate().then(function (value) {
      expect(value).to.equal('012012')
      done()
    }).catch(function (err) {
      done(err)
    })
  })






})


it('should execute recursive returns correctly ', function (done) {
  new AsyncInterpreter(
    ' (function() { (function(){3 + 4})(); return (function() {return 5})()})() '
  ).evaluate().then(function (value) {
    expect(value).to.equal(5)
    done()
  }).catch(function (err) {
    done(err)
  })
})

it('should execute immediately invoking function expression returning a string', function (done) {

  new AsyncInterpreter(
    ' (function() { return "screw" })() '
  ).evaluate().then(function (value) {
    expect(value).to.equal('screw')
    done()
  }).catch(function (err) {
    done(err)
  })

})


describe('capital F Functions', function (){

  it('should compile and run a function created with the capital F Function primordial', function (done) {

    new AsyncInterpreter(
      ' var a = 5; var b = Function("return a"); b() ' 
    ).evaluate().then(function (value) {
      expect(value).to.equal(5)
      done()
    }).catch(function (err) {
      done(err) 
    })


  }) 


  it('should compile a function that does not have access to nested scope', function (done) {
    
    new AsyncInterpreter(
      ' function a () { var b = 5; var c = Function("return b"); return c(); }; a() '
    ).evaluate().catch(function (err) {
      expect(err instanceof ReferenceError).to.be.true
      done()
    }) 

  })

})



