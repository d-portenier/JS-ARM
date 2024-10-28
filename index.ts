import parser from "./Parser"
import { Environment } from "./AST";

let env = new Environment(new Map<string,number>(), 0);

let source = `
  function factorial(n) {
    var result = 1;
    while (n != 1) {
      result = result * n;
      n = n - 1  ;
    }
    return result;
  }
`;


parser.parseStringToCompletion(`
function assert(x) {
  if (x) {
    putchar(46);
  } else {
    putchar(70);
  }
}
`).emit(env)


parser.parseStringToCompletion(`
  function factorial(n) {
    if (n == 0) {
      return 1;
    } else {
      return n * factorial(n-1);
    }
  }



  function main() {
    // test function calls with recursion and return
    assert(factorial(5) == 120);
  
    // Test Variables
    var x = 4 + 2 * (12 -2);
    var y = 3* (5+1);
    var z = x + y;
    assert(z == 42);

    // Test Assignment
    z = 0;
    assert(z == 0);

    // Test While Loop
    var i = 1;
    while (i != 5) {
      i = i + 1;
    }
    assert (i == 5);
}
`).emit(env);