

export interface AST {
    equals(other: AST): boolean;
};


export class Num implements AST {
    constructor(public value: number) { }

    equals(other: AST): boolean {
        return other instanceof Num &&
            this.value == other.value;
    }
}


export class Id implements AST {
    constructor(public value: string) { }

    equals(other: AST): boolean {
        return other instanceof Id &&
            other.value == this.value;
    }
}

export class Not implements AST {
    constructor(public term: AST) { }

    equals(other: AST): boolean {
        return other instanceof Not &&
            other.term.equals(this.term);
    }
}

export class Equal implements AST {
    constructor(public left: AST, public right: AST) { }

    equals(other: AST): boolean {
        return other instanceof Equal &&
            other.left.equals(this.left) &&
            other.right.equals(this.right);
    }
}

export class NotEqual implements AST {
    constructor(public left: AST, public right: AST) { }

    equals(other: AST): boolean {
        return other instanceof NotEqual &&
            other.left.equals(this.left) &&
            other.right.equals(this.right);
    }
}

export class Add implements AST {
    constructor(public left: AST, public right: AST) { }

    equals(other: AST): boolean {
        return other instanceof Add &&
            other.left.equals(this.left) &&
            other.right.equals(this.right);

    }
}

export class Subtract implements AST {
    constructor(public left: AST, public right: AST) { }

    equals(other: AST): boolean {
        return other instanceof Subtract &&
            other.left.equals(this.left) &&
            other.right.equals(this.right);
    }
}

export class Multiply implements AST {
    constructor(public left: AST, public right: AST) { }

    equals(other: AST): boolean {
        return other instanceof Multiply &&
            other.left.equals(this.left) &&
            other.right.equals(this.right);
    }

}

export class Divide implements AST {
    constructor(public left: AST, public right: AST) { }

    equals(other: AST): boolean {
        return other instanceof Divide &&
            other.left.equals(this.left) &&
            other.right.equals(this.right);
    }
}


export class Call implements AST {
    constructor(public callee: string,
        public args: Array<AST>) { }

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

    equals(other: AST): boolean {
        return other instanceof Return &&
            other.term.equals(this.term);
    }
}

export class Block implements AST {
    constructor(public statements: Array<AST>) { }

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

    equals(other: AST): boolean {
        return other instanceof While &&
            this.conditional.equals(other.conditional) &&
            this.body.equals(other.body);
    }
}


