const gf = p => {
    const sqrt = []
    const inv = []
    for (let i = 0; i < p / 2; ++i) {
        sqrt[i * i % p] = i
    }
    for (let i = 0; i < p; i++) {
        for (let j = i; j < p; j++) {
            if (i * j % p === 1) {
                inv[i] = j
                inv[j] = i
                break
            }
        }
    }

    function G (n) {this.n = (n % p + p) % p}
    G.prototype.add = function (other) {
        const n = typeof other == 'number' ? other : other.n 
        return new G(this.n + n)
    }
    G.prototype.sub = function (other) {
        const n = typeof other == 'number' ? other : other.n 
        return new G(this.n - n)
    }
    G.prototype.mul = function (other) {
        const n = typeof other == 'number' ? other : other.n 
        return new G(this.n * n)
    }
    G.prototype.inv = function () {return new G(inv[this.n])}
    G.prototype.sqrt = function () {return new G(sqrt[this.n])}
    G.prototype.pow = function (n) {return new G(this.n ** n % p)}
    G.prototype.inv2 = function () {
        const t = [0, 1], r = [p, this.n]
        while (r[1]) {
            const q = Math.floor(r[0] / r[1]);
            t.splice(0, 2, t[1], t[0] - q * t[1])
            r.splice(0, 2, r[1], r[0] - q * r[1])
        }
        return new G(t[0] > 0 ? t[0] : t[0] + p)
    }
    G.prototype.neg = function () {return new G(-this.n)}
    G.prototype.sym = function () {return this.n < p /2 ? this.n : this.n - p}
    return G
}

const ec = (a, b, p) => {
    const G = gf(p)
    function Point (x, y) {
        this.x = typeof x === 'number' ? new G(x) : x
        this.y = typeof y === 'number' ? new G(y) : y
    }
    Point.prototype.double = function () {
        const {x, y} = this
        const s = x.pow(2).mul(3).add(a).mul(y.mul(2).inv()) // (3x^2+a)/(2y)
        const x2 = s.pow(2).add(new G(-2).mul(x))
        const y2 = x.sub(x2).mul(s).sub(y)
        return new Point(x2, y2)
    }
    Point.prototype.add = function ({x:x2, y:y2}) {
        const {x:x1, y:y1} = this
        const s = y2.sub(y1).mul(x2.sub(x1).inv())
        const x3 = s.pow(2).sub(x1).sub(x2)
        const y3 = x1.sub(x3).mul(s).sub(y1)
        return new Point(x3, y3)
    }
    Point.prototype.neg = function () {
        return new Point(this.x, this.y.neg())
    }
    Point.prototype.generate = function* () {
        const g = this
        let gn = this.double()
        yield g
        do {
            yield gn
            gn = gn.add(g)
        } while (g.x.n !== gn.x.n)
        yield gn
    }
    Point.prototype.eq = function (other) {
        return this.x.n === other.x.n && this.y.n === other.y.n
    }
    Point.prototype.onCurve = function () {
        const {x, y} = this
        return y.pow(2).n === x.pow(3).add(x.mul(a)).add(b).n
    }
    const count = () => {
        let cnt = 0
        for (let i = 0; i < p; ++i)
            for (let j = 0; j < p; ++j)
                cnt += new Point(i, j).onCurve()
        return cnt
    }
    const points = []
    for (let i = 0; i < p; ++i) {
        const x = new G(i)
        const y = x.pow(3).add(x.mul(a)).add(b).sqrt()
        if (!Number.isNaN(y.n)) {
            points.push(new Point(x, y))
            if (y.n)
                points.push(new Point(x, y.neg()))
        }
    }
    return {Point, count, points}
}

// const {Point:Pt, points:ps} = ec(0, 3, 7); a = new Pt(1, 2); b = new Pt(2, 2)
// c = a.add(b)
// console.log(c)
// console.log(ps)
// gs = Array.from(a.generate())
// console.log(gs)
console.log(ec(0, 1, 7).points)