import { AST, Num, Id, Not, Equal, NotEqual, Add, Subtract, Multiply, Divide, Call, Return, Block, If, Funct, Var, Assign, While } from "./AST"


interface Parser<T> {
    parse(s: Source): ParseResult<T> | null;
}

class Source {
    constructor(public string: string,
        public index: number) { }

    match(regexp: RegExp): (ParseResult<string> | null) {
        console.assert(regexp.sticky);
        regexp.lastIndex = this.index;
        let match = this.string.match(regexp);
        if (match) {
            let value = match[0];
            let newIndex = this.index + value.length;
            let source = new Source(this.string, newIndex);
            return new ParseResult(value, source);
        }
        return null;
    }
}

class ParseResult<T> {
    constructor(public value: T,
        public source: Source
    ) { }
}

class Parser<T> {
    constructor(
        public parse: (s: Source) => (ParseResult<T> | null) 
    ) {}

    static regexp(regexp: RegExp) : Parser<string> {
        return new Parser(source => source.match(regexp))
    }

    static constant<U>(value: U): Parser<U> {
        return new Parser(source => 
            new ParseResult(value,source));
    }

    static error<U>(message: string): Parser<U> {
        return new Parser(source => {
            throw Error(message);
        });
    }

    or(parser: Parser<T>): Parser<T> {
        return new Parser((source) => {
            let result = this.parse(source);
            if (result)
                return result;
            else
                return parser.parse(source);
        });
    }

    static zeroOrMore<U>(parser: Parser<U>): 
                Parser<Array<U>> {
        return new Parser(source => {
            let results = [];
            let item = null;
            while (item = parser.parse(source)) {
                source = item.source;
                results.push(item.value);
            }
            return new ParseResult(results, source);
        });
    }

    bind<U>(callback: (value:T) => Parser<U>): Parser<U> {
        return new Parser((source) => {
            let result = this.parse(source);
            if (result) {
                let value = result.value;
                let source = result.source;
                return callback(value).parse(source);
            } else {
                return null;
            }
        });
    }

    and<U>(parser: Parser<U>): Parser<U> {
        return this.bind((_) => parser);
    }

    map<U>(callback: (t:T) => U): Parser<U> {
        return this.bind((value) => 
            constant(callback(value)));
    }

    static maybe<U>(parser: Parser<U | null>) {
        return parser.or(constant(null));
    }

    parseStringToCompletion(string: string): T {
        let source = new Source(string, 0);

        let result = this.parse(source);
        if (!result)
            throw Error("Parse error at index 0");

        let index = result.source.index;
        if (index != result.source.string.length)
            throw Error("Parse error at index " + index);

        return result.value
    }
}

let { regexp, constant, error, zeroOrMore, maybe } = Parser;

let whitespace = regexp(/[ \n\r\t]+/y);
let comments = regexp(/[/][/].*/y).or(regexp(/[/][*].*[*][/]/sy));
let ignored = zeroOrMore(whitespace.or(comments));

let token = (pattern: RegExp) =>
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
let iden = ID.map((x) => new Id(x));

let NOT = token(/!/y).map((_) => Not);
let EQUAL = token(/==/y).map((_) => Equal);
let NOT_EQUAL = token(/!=/y).map((_) => NotEqual);
let PLUS = token(/[+]/y).map((_) => Add);
let MINUS = token(/[-]/y).map((_) => Subtract);
let STAR = token(/[*]/y).map((_) => Multiply);
let SLASH = token(/[/]/y).map((_) => Divide);
let ASSIGN = token(/=/y).map((_) => Assign);


// ==== Expresion Parsing ====

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
let expression: Parser<AST> = error("Expression parser used before definition")

// args <- (expression (COMMA expression)*)?
let args: Parser<Array<AST>> = 
  expression.bind((arg) =>
    zeroOrMore(COMMA.and(expression)).bind((args) =>
      constant([arg, ...args]))).or(constant([]));

// call <- ID LEFT_PAREN args RIGHT_PAREN
let call: Parser<AST> = ID.bind((callee) =>
  LEFT_PAREN.and(args.bind((args) =>
    RIGHT_PAREN.and(constant(new Call(callee, args))))));

// atom <- call / ID / NUMBER / LEFT_PAREN expression RIGHT_PAREN
let atom: Parser<AST> = call.or(iden).or(NUMBER).or(
  LEFT_PAREN.and(expression).bind((expr) =>
    RIGHT_PAREN.and(constant(expr))));

// unary <- NOT? atom
let unary: Parser<AST> = maybe(NOT).bind((not) =>
  atom.map((term) => not ? new Not(term) : term));

// Infix-pattern
let infix = (operatorParser: Parser<any>, termParser: Parser<AST>) =>
  termParser.bind((term) =>
    zeroOrMore(operatorParser.bind((operator) =>
      termParser.bind((term) =>
        constant({ operator, term })))).map((operatorTerms) =>
          operatorTerms.reduce((left, { operator, term }) =>
            new operator(left, term), term)));

// product <- unary ((STAR / SLASH) unary)*
let product: Parser<AST> = infix(STAR.or(SLASH), unary);

// sum <- product ((PLUS / MINUS) product)*
let sum: Parser<AST> = infix(PLUS.or(MINUS), product);

// comparison <- sum ((EQUAL / NOT_EQUAL) sum)*
let comparison = infix(EQUAL.or(NOT_EQUAL), sum);

// expression <- comparison
expression.parse = comparison.parse;

// expression.parseStringToCompletion("x*y+z")



/// ==== Statement Parsing ====

/*
returnStatement <- RETURN expression SEMICOLON
expressionStatement <- expression SEMICOLON
ifStatement <-
  IF LEFT_PAREN expression RIGHT_PAREN
    statement
  ELSE
    statement
whileStatement <-
  WHILE LEFT_PAREN expression RIGHT_PAREN statement
varStatement <- VAR ID ASSIGN expression SEMICOLON
assignmentStatement <- ID ASSIGN EXPRESSION SEMICOLON
blockStatement <- LEFT_BRACE statement* RIGHT_BRACE
parameters <- (ID (COMMA ID)*)?
functionStatement <-
  FUNCTION ID LEFT_PAREN parameters RIGHT_PAREN
  blockStatement
statement <- returnStatement
           / ifStatement
           / whileStatement
           / varStatement
           / assignmentStatemnt
           / blockStatement
           / functionStatement
           / expressionStatement
*/


let statement: Parser<AST> = error("Statement parser used before definition");

// returnStatement <- RETURN expression SEMICOLON
let returnStatement: Parser<AST> = RETURN.and(expression).bind((term) =>
  SEMICOLON.and(constant(new Return(term))));

// expressionStatement <- expression SEMICOLON
let expressionStatement: Parser<AST> = expression.bind((term) =>
  SEMICOLON.and(constant(term)));

// ifStatement <-
//   IF LEFT_PAREN expression RIGHT_PAREN
//     statement
//   ELSE
//     statement
let ifStatement: Parser<AST> = IF.and(LEFT_PAREN).and(expression).bind((cond) =>
  RIGHT_PAREN.and(statement).bind((conseq) =>
    ELSE.and(statement).bind((altern) =>
      constant(new If(cond, conseq, altern)))));

// whileStatement <-
//   WHILE LEFT_PAREN expression RIGHT_PAREN statement
let whileStatement: Parser<AST> = WHILE.and(LEFT_PAREN).and(expression).bind((conditional) =>
  RIGHT_PAREN.and(statement).bind((body) =>
    constant(new While(conditional, body))));

// varStatement <- VAR ID ASSIGN expression SEMICOLON
let varStatement: Parser<AST> = VAR.and(ID).bind((name) =>
  ASSIGN.and(expression).bind((value) =>
    SEMICOLON.and(constant(new Var(name, value)))));

// assignmentStatement <- ID ASSIGN EXPRESSION SEMICOLON
let assinmentStatement: Parser<AST> = ID.bind((name) =>
    ASSIGN.and(expression).bind((value) => 
      SEMICOLON.and(constant(new Assign(name, value)))));

// blockStatement <- LEFT_BRACE statement* RIGHT_BRACE
let blockStatement: Parser<Block> = LEFT_BRACE.and(zeroOrMore(statement).bind((statements) => 
  RIGHT_BRACE.and(constant(new Block(statements)))));

// parameters <- (ID (COMMA ID)*)?
let parameters: Parser<Array<string>> = ID.bind((param) => 
  zeroOrMore(COMMA.and(ID)).bind((params) =>
    constant([param, ...params]))).or(constant([]));

// functionStatement <-
//   FUNCTION ID LEFT_PAREN parameters RIGHT_PAREN
//   blockStatement
let functionStatement: Parser<AST> = FUNCTION.and(ID).bind((name) =>
  LEFT_PAREN.and(parameters).bind((params) =>
    RIGHT_PAREN.and(blockStatement).bind((block) =>
      constant(new Funct(name, params, block)))));

// statement <- returnStatement
//            / ifStatement
//            / whileStatement
//            / varStatement
//            / assignmentStatemnt
//            / blockStatement
//            / functionStatement
//            / expressionStatement
let statementParser: Parser<AST> = returnStatement
  .or(functionStatement)
  .or(ifStatement)
  .or(whileStatement)
  .or(varStatement)
  .or(assinmentStatement)
  .or(blockStatement)
  .or(expressionStatement);

statement.parse = statementParser.parse;

let parser: Parser<AST> = ignored.and(zeroOrMore(statement)).map((statements) =>
  new Block(statements));

export default parser;

// let expected = new Block([
//   new Funct("factorial", ["n"], new Block([
//     new Var("result", new Num(1)),
//     new While(new NotEqual(new Id("n"),
//                            new Num(1)), new Block([
//       new Assign("result", new Multiply(new Id("result"),
//                                         new Id("n"))),
//       new Assign("n", new Subtract(new Id("n"),
//                                    new Num(1))),
//     ])),
//     new Return(new Id("result")),
//   ])),
// ]);

// let result = parser.parseStringToCompletion(source);

// console.assert(result.equals(expected));