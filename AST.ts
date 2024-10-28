
class Label {
    static counter = 0;
    value: number;

    constructor() {
        this.value = Label.counter++;
    }

    toString() {
        return `.L${this.value}`;
    }
}

export class Environment {
    constructor(public locals: Map<string, number>,
                public nextLocalOffset: number) {}
}

export interface AST {
    emit(env: Environment): void;
    equals(other: AST): boolean;
};

let emit = console.log;

export class Num implements AST {
    constructor(public value: number) { }

    emit(env: Environment) {
        emit(`  ldr r0, =${this.value}`);
    }

    equals(other: AST): boolean {
        return other instanceof Num &&
            this.value == other.value;
    }
}


export class Id implements AST {
    constructor(public value: string) { }

    emit(env: Environment) { 
        let offset = env.locals.get(this.value);
        if (offset) {
            emit(`  ldr r0, [fp, #${offset}]`);
        } else {
            throw Error(`Undefined variable: ${this.value}`);
        }
    }

    equals(other: AST): boolean {
        return other instanceof Id &&
            other.value == this.value;
    }
}

export class Not implements AST {
    constructor(public term: AST) { }

    emit(env: Environment) { 
        this.term.emit(env);
        emit(`  cmp r0, #0`);
        emit(`  moveq r0, #1`);
        emit(`  movne r0, #0`);
    }

    equals(other: AST): boolean {
        return other instanceof Not &&
            other.term.equals(this.term);
    }
}

export class Equal implements AST {
    constructor(public left: AST, public right: AST) { }

    emit(env: Environment) { 
        this.left.emit(env);
        emit(`  push {r0, ip}`);
        this.right.emit(env);
        emit(`  pop {r1, ip}`);
        emit(`  cmp r0, r1`);
        emit(`  moveq r0, #1`);
        emit(`  movne r0, #0`);
    }

    equals(other: AST): boolean {
        return other instanceof Equal &&
            other.left.equals(this.left) &&
            other.right.equals(this.right);
    }
}

export class NotEqual implements AST {
    constructor(public left: AST, public right: AST) { }

    emit(env: Environment) { 
        this.left.emit(env);
        emit(`  push {r0, ip}`);
        this.right.emit(env);
        emit(`  pop {r1, ip}`);
        emit(`  cmp r0, r1`);
        emit(`  moveq r0, #0`);
        emit(`  movne r0, #1`);
    }

    equals(other: AST): boolean {
        return other instanceof NotEqual &&
            other.left.equals(this.left) &&
            other.right.equals(this.right);
    }
}

export class Add implements AST {
    constructor(public left: AST, public right: AST) { }

    emit(env: Environment) { 
        this.left.emit(env);
        emit(`  push {r0, ip}`);
        this.right.emit(env);
        emit(`  pop {r1, ip}`);
        emit(`  add r0, r1, r0`);
    }

    equals(other: AST): boolean {
        return other instanceof Add &&
            other.left.equals(this.left) &&
            other.right.equals(this.right);

    }
}

export class Subtract implements AST {
    constructor(public left: AST, public right: AST) { }

    emit(env: Environment) { 
        this.left.emit(env);
        emit(`  push {r0, ip}`);
        this.right.emit(env);
        emit(`  pop {r1, ip}`);
        emit(`  sub r0, r1, r0`);
    }

    equals(other: AST): boolean {
        return other instanceof Subtract &&
            other.left.equals(this.left) &&
            other.right.equals(this.right);
    }
}

export class Multiply implements AST {
    constructor(public left: AST, public right: AST) { }

    emit(env: Environment) { 
        this.left.emit(env);
        emit(`  push {r0, ip}`);
        this.right.emit(env);
        emit(`  pop {r1, ip}`);
        emit(`  mul r0, r1, r0`);
    }

    equals(other: AST): boolean {
        return other instanceof Multiply &&
            other.left.equals(this.left) &&
            other.right.equals(this.right);
    }

}

export class Divide implements AST {
    constructor(public left: AST, public right: AST) { }

    emit(env: Environment) { 
        this.left.emit(env);
        emit(`  push {r0, ip}`);
        this.right.emit(env);
        emit(`  pop {r1, ip}`);
        emit(`  udiv r0, r1, r0`);
    }

    equals(other: AST): boolean {
        return other instanceof Divide &&
            other.left.equals(this.left) &&
            other.right.equals(this.right);
    }
}


export class Call implements AST {
    constructor(public callee: string,
        public args: Array<AST>) { }

    emit(env: Environment) { 
        let count = this.args.length;
        if (count === 0) {
            emit(`  bl ${this.callee}`);
        } else if (count === 1) {
            this.args[0].emit(env);
            emit(`  bl ${this.callee}`);
        } else if (count >= 2 && count <= 4) {
            emit(`  sub sp, sp, #16`);
            this.args.forEach((arg,i) => {
                arg.emit(env);
                emit(`  str r0, [sp, #${4 * i}]`);
            });
            emit(`  pop {r0, r1, r2, r3}`);
            emit(`  bl ${this.callee}`);
        } else {
            throw Error("More tan 4 arguments: not supported");
        }
    }

    equals(other: AST): boolean {
        return other instanceof Call &&
            this.callee === other.callee &&
            this.args.length === other.args.length &&
            this.args.every((arg, i) =>
                arg.equals(other.args[i]));
    }
}

export class Return implements AST {
    constructor(public term: AST) { }

    emit(env: Environment) { 
        this.term.emit(env);
        emit(`  mov sp, fp`);
        emit(`  pop {fp, pc}`);
    }

    equals(other: AST): boolean {
        return other instanceof Return &&
            other.term.equals(this.term);
    }
}

export class Block implements AST {
    constructor(public statements: Array<AST>) { }

    emit(env: Environment) {
        this.statements.forEach((statm) => 
            statm.emit(env));
     }

    equals(other: AST): boolean {
        return other instanceof Block &&
            this.statements.length === other.statements.length &&
            this.statements.every((state, i) =>
                state.equals(other.statements[i]));
    }
}

export class If implements AST {
    constructor(public conditional: AST,
        public consequence: AST,
        public alternative: AST
    ) { }

    emit(env: Environment) {
        let ifFalseLabel = new Label();
        let endIfLabel = new Label();
        this.conditional.emit(env);
        emit(`  cmp r0, #0`);
        emit(`  beq ${ifFalseLabel}`);
        this.consequence.emit(env);
        emit(`  b ${endIfLabel}`);
        emit(`${ifFalseLabel}:`);
        this.alternative.emit(env);
        emit(`${endIfLabel}:`);
    }

    equals(other: AST): boolean {
        return other instanceof If &&
            this.conditional.equals(other.conditional) &&
            this.consequence.equals(other.consequence) &&
            this.alternative.equals(other.alternative);
    }
}

export class Funct implements AST {
    constructor(public name: string,
        public parameters: Array<string>,
        public body: AST
    ) { }

    emit(_: Environment) { 
        if (this.parameters.length > 4)
            throw Error("More than 4 parameters in Function Definition: not supported");

        emit(``);
        emit(`.global ${this.name}`);
        emit(`${this.name}:`)
        this.emitPrologue();
        let env = this.setUpEnvironment();
        this.body.emit(env);
        this.emitEpilogue();
    }

    setUpEnvironment() {
        let locals = new Map();
        this.parameters.forEach((param, i) => {
            locals.set(param, 4*i - 16);
        });
        return new Environment(locals, -20);
    }

    emitPrologue() {
        emit(`  push {fp, lr}`);
        emit(`  mov fp, sp`);
        emit(`  push {r0, r1, r2, r3}`);
    }

    emitEpilogue() {
        emit(`  mov sp, fp`);
        emit(`  mov r0, #0`);
        emit(`  pop {fp, pc}`);
    }

    equals(other: AST): boolean {
        return other instanceof Funct &&
            this.name === other.name &&
            this.parameters.length === other.parameters.length &&
            this.parameters.every((param,i) => 
                param === other.parameters[i]) &&
            this.body.equals(other.body);
    }
}

export class Var implements AST {
    constructor(public name: string,
        public value: AST
    ) {}

    emit(env: Environment) { 
        this.value.emit(env);
        emit(`  push {r0, ip}`);
        // This wasts up to 50% of memory, as we need 8 byte alignment
        env.locals.set(this.name, env.nextLocalOffset - 4);
        env.nextLocalOffset -= 8;
    }

    equals(other: AST): boolean {
        return other instanceof Var &&
            this.name === other.name &&
            this.value.equals(other.value);
    }
}

export class Assign implements AST {
    constructor(public name: string,
                public value: AST
    ) {}

    emit(env: Environment) { 
        this.value.emit(env);
        let offset = env.locals.get(this.name);
        if (offset) {
            emit(`  str r0, [fp, #${offset}]`);
        } else {
            throw Error(`Undefined variable: ${this.name}`);
        }
    }

    equals(other: AST): boolean {
        return other instanceof Assign &&
            this.name === other.name &&
            this.value.equals(other.value);
    }
}

export class While implements AST {
    constructor(public conditional: AST,
        public body: AST
    ) {}

    emit(env: Environment) { 
        let loopStart = new Label();
        let loopEnd = new Label();

        emit(`${loopStart}:`);
        this.conditional.emit(env);
        emit(`  cmp r0, #0`);
        emit(`  beq ${loopEnd}`);
        this.body.emit(env);
        emit(`  b ${loopStart}`);
        emit(`${loopEnd}:`)
    }

    equals(other: AST): boolean {
        return other instanceof While &&
            this.conditional.equals(other.conditional) &&
            this.body.equals(other.body);
    }
}


