//import { Parser, ParseResult } from "./Parser.ts
import Parser from "./Parser"

let {regexp, constant, error, zeroOrMore, maybe} = Parser;

let whitespace = regexp(/[ \n\r\t]+/y);
let comments = regexp(/[/][/].*/y).or(regexp(/[/][*].*[*][/]/sy));
let ignored = zeroOrMore(whitespace.or(comments));

let token  = (pattern: RegExp) =>
    regexp(pattern).bind((value) => 
        ignored.and(constant(value)));

let FUNCTION = token(/function\b/y);
let IF = token(/if\b/y);
let ELSE = token(/else\b/y);
let RETURN = token(/return\b/y);
let VAR = token(/var\b/y);
let WHILE = token(/while\b/y);

let COMMA = token(/[,]/y);
let SEMICOLON = token(/;/y);
let LEFT_PAREN = token(/[(]/y);
let RIGHT_PAREN = token(/[)]/y);
let LEFT_BRACE = token(/[{]/y);
let RIGHT_BRACE = token(/[}]/y);

let NUMBER = token(/[0-9]+/y).map((digits) => new Num(parseInt(digits, 10)));
// Produces String
let ID = token(/[a-zA-Z_][a-zA-Z0-9_]*/y);
// Produces AST
let id = ID.map((x) => new Id(x))

let NOT = token(/!/y).map((_) => Not);
let EQUAL = token(/==/y).map((_) => Equal);
let NOT_EQUAL = token(/!=/y).map((_) => NotEqual);
let PLUS = token(/[+]/y).map((_) => Add);
let MINUS = token(/[-]/y).map((_) => Subtract);
let STAR = token(/[*]/y).map((_) => Multiply);
let SLASH = token(/[/]/y).map((_) => Divide);
let ASSIGN = token(/=/y).map((_) => Assign);

/* Expression Parser of the BASE LANGUAGE
args <- (expression (COMMA expression)*)?
call <- ID LEFT_PAREN args RIGHT_PAREN
atom <- call / ID / NUMBER
      / LEFT_PAREN expression RIGHT_PAREN
unary <- NOT? atom
product <- unary ((STAR / SLASH) unary)*
sum <- product ((PLUS / MINUS) product)*
comparison <- sum ((EQUAL / NOT_EQUAL) sum)*
expression <- comparison
*/

// Initialize with error-parser
let expression: Parser<AST>  = Parser.error("Expression parser used before definition")

// args <- (expression (COMMA expression)*)?
let args: Parser<Array<AST>> = 
    expression.bind((arg) => 
        zeroOrMore(COMMA.and(expression)).bind((args) => 
            constant([arg, ...args])).or(constant([])));

// call <- ID LEFT_PAREN args RIGHT_PAREN
let call : Parser<AST> = ID.bind((callee) => 
    LEFT_PAREN.and(args.bind((args) => 
        RIGHT_PAREN.and(constant(new Call(callee, args))))));

// atom <- call / ID / NUMBER / LEFT_PAREN expression RIGHT_PAREN
let atom :Parser<AST> = call.or(id).or(NUMBER).or(
    LEFT_PAREN.and(expression).bind((expr) => 
        RIGHT_PAREN.and(constant(expr))));

// unary <- NOT? atom
let unary :Parser<AST> = maybe(NOT).bind((not) => 
    atom.map((term) => not ? new Not(term) : term));

// product <- unary ((STAR / SLASH) unary)*
let product :Parser<AST> = unary.and(zeroOrMore(STAR.or(SLASH).and(unary)));

// sum <- product ((PLUS / MINUS) product)*
let sum = product.and(zeroOrMore(PLUS.or(MINUS).and(product)));

// comparison <- sum ((EQUAL / NOT_EQUAL) sum)*

// expression <- comparison


expression.parseStringToCompletion("")




