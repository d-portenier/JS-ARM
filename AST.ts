

interface AST {
    equals(other: AST): Boolean;
};


class Num implements AST {
    constructor(public value: number) { }

    equals(other: AST): Boolean {
        return other instanceof Num &&
            this.value == other.value;
    }
}


class Id implements AST {
    constructor(public value: string) { }

    equals(other: AST): Boolean {
        return other instanceof Id &&
            other.value == this.value;
    }
}

class Not implements AST {
    constructor(public term: AST) { }

    equals(other: AST): Boolean {
        return other instanceof Not &&
            other.term.equals(this.term);
    }
}

class Equal implements AST {
    constructor(public left: AST, public right: AST) { }

    equals(other: AST): Boolean {
        return other instanceof Equal &&
            other.left.equals(this.left) &&
            other.right.equals(this.right);
    }
}

class NotEqual implements AST {
    constructor(public left: AST, public right: AST) { }

    equals(other: AST): Boolean {
        return other instanceof NotEqual &&
            other.left.equals(this.left) &&
            other.right.equals(this.right);
    }
}

class Add implements AST {
    constructor(public left: AST, public right: AST) { }

    equals(other: AST): Boolean {
        return other instanceof Add &&
            other.left.equals(this.left) &&
            other.right.equals(this.right);

    }
}

class Subtract implements AST {
    constructor(public left: AST, public right: AST) { }

    equals(other: AST): Boolean {
        return other instanceof Subtract &&
            other.left.equals(this.left) &&
            other.right.equals(this.right);
    }
}

class Multiply implements AST {
    constructor(public left: AST, public right: AST) { }

    equals(other: AST): Boolean {
        return other instanceof Multiply &&
            other.left.equals(this.left) &&
            other.right.equals(this.right);
    }

}

class Divide implements AST {
    constructor(public left: AST, public right: AST) { }

    equals(other: AST): Boolean {
        return other instanceof Divide &&
            other.left.equals(this.left) &&
            other.right.equals(this.right);
    }
}


class Call implements AST {
    constructor(public callee: string,
        public args: Array<AST>) { }

    equals(other: AST): Boolean {
        return other instanceof Call &&
            this.callee === other.callee &&
            this.args.length === other.args.length &&
            this.args.every((arg, i) =>
                arg.equals(other.args[i]));
    }
}

class Return implements AST {
    constructor(public term: AST) { }

    equals(other: AST): Boolean {
        return other instanceof Return &&
            other.term.equals(this.term);
    }
}

class Block implements AST {
    constructor(public statements: Array<AST>) { }

    equals(other: AST): Boolean {
        return other instanceof Block &&
            this.statements.length === other.statements.length &&
            this.statements.every((state, i) =>
                state.equals(other.statements[i]));
    }
}

class If implements AST {
    constructor(public conditional: AST,
        public consequence: AST,
        public alternative: AST
    ) { }

    equals(other: AST): Boolean {
        return other instanceof If &&
            this.conditional.equals(other.conditional) &&
            this.consequence.equals(other.consequence) &&
            this.alternative.equals(other.alternative);
    }
}

class Funct implements AST {
    constructor(public name: string,
        public parameters: Array<string>,
        public body: AST
    ) { }

    equals(other: AST): Boolean {
        return other instanceof Funct &&
            this.name === other.name &&
            this.parameters.length === other.parameters.length &&
            this.parameters.every((param,i) => 
                param === other.parameters[i]) &&
            this.body.equals(other.body);
    }
}

class Var implements AST {
    constructor(public name: string,
        public value: AST
    ) {}

    equals(other: AST): Boolean {
        return other instanceof Var &&
            this.name === other.name &&
            this.value.equals(other.value);
    }
}

class Assign implements AST {
    constructor(public name: string,
                public value: AST
    ) {}

    equals(other: AST): Boolean {
        return other instanceof Assign &&
            this.name === other.name &&
            this.value.equals(other.value);
    }
}

class While implements AST {
    constructor(public conditional: AST,
        public body: AST
    ) {}

    equals(other: AST): Boolean {
        return other instanceof While &&
            this.conditional.equals(other.conditional) &&
            this.body.equals(other.body);
    }
}


