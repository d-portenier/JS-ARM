

export interface AST {
    emit(): void;
    equals(other: AST): boolean;
};

let emit = console.log;

export class Num implements AST {
    constructor(public value: number) { }

    emit() {
        emit(`  ldr r0, =${this.value}`);
    }

    equals(other: AST): boolean {
        return other instanceof Num &&
            this.value == other.value;
    }
}


export class Id implements AST {
    constructor(public value: string) { }

    emit() { throw Error("Not implemented yet"); }

    equals(other: AST): boolean {
        return other instanceof Id &&
            other.value == this.value;
    }
}

export class Not implements AST {
    constructor(public term: AST) { }

    emit() { 
        this.term.emit();
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

    emit() { 
        this.left.emit();
        emit(`  push {r0, ip}`);
        this.right.emit();
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

    emit() { 
        this.left.emit();
        emit(`  push {r0, ip}`);
        this.right.emit();
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

    emit() { 
        this.left.emit();
        emit(`  push {r0, ip}`);
        this.right.emit();
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

    emit() { 
        this.left.emit();
        emit(`  push {r0, ip}`);
        this.right.emit();
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

    emit() { 
        this.left.emit();
        emit(`  push {r0, ip}`);
        this.right.emit();
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

    emit() { 
        this.left.emit();
        emit(`  push {r0, ip}`);
        this.right.emit();
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

    emit() { 
        let count = this.args.length;
        if (count === 0) {
            emit(`  bl ${this.callee}`);
        } else if (count === 1) {
            this.args[0].emit();
            emit(`  bl ${this.callee}`);
        } else if (count >= 2 && count <= 4) {
            emit(`  sub sp, sp, #16`);
            this.args.forEach((arg,i) => {
                arg.emit();
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

    emit() { throw Error("Not implemented yet"); }

    equals(other: AST): boolean {
        return other instanceof Return &&
            other.term.equals(this.term);
    }
}

export class Block implements AST {
    constructor(public statements: Array<AST>) { }

    emit() {
        this.statements.forEach((statm) => 
            statm.emit());
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

    emit() { throw Error("Not implemented yet"); }

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

    emit() { throw Error("Not implemented yet"); }

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

    emit() { throw Error("Not implemented yet"); }

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

    emit() { throw Error("Not implemented yet"); }

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

    emit() { throw Error("Not implemented yet"); }

    equals(other: AST): boolean {
        return other instanceof While &&
            this.conditional.equals(other.conditional) &&
            this.body.equals(other.body);
    }
}

export class Main implements AST {
    constructor(public statements: Array<AST>) {}

    emit() {
        emit(`.global main`);
        emit(`main:`);
        emit(`  push {fp, lr}`);
        this.statements.forEach((statement)=>
            statement.emit());
        emit(`  mov r0, #0`);
        emit(`  pop {fp, pc}`);
    }

    equals(other: AST): boolean {
        return other instanceof Main &&
            this.statements.length === other.statements.length &&
            this.statements.every((stat,i) => 
                other.statements[i] === stat);
    }
}

export class Assert implements AST {
    constructor(public condition: AST) {}

    emit() {
        this.condition.emit();
        emit(`  cmp r0, #1`);
        emit(`  moveq r0, #'.'`);
        emit(`  movne r0, #'F'`);
        emit(`  bl putchar`);
    }

    equals(other: AST): boolean {
        return other instanceof Assert &&
            this.condition.equals(other.condition);
    }
}