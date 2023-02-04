

class vector{
    constructor(x = 0, y = 0, radius = null, angle = null){
        if(radius == null && angle == null){
            this.x = x,
            this.y = y
        }else{
            let pox = (x + radius * Math.cos(angle * Math.PI / 180))
            this.x = Math.round(pox)
            let poy = (y + radius * Math.sin(angle * Math.PI / 180))
            this.y = Math.round(poy)
        }
    }
    value(){
        return [this.x, this.y]
    }
}

class matrix_2by2{
    constructor(i_x = 1, i_y = 0, j_x = 0, j_y = 1){
        if (i_x instanceof vector && i_y instanceof vector) {
            this.i = i_x.value(),
            this.j = i_y.value()
        } else {
            this.i = [i_x, i_y],
            this.j = [j_x, j_y]
        }
    }
    addition(vec1, vec2){
        return [vec1.x + vec2.x, vec1.y + vec2.y]
    }
    subtraction(vec1, vec2){
        return [vec1.x - vec2.x, vec1.y - vec2.y]
    }
    multiplication(sca, vec){
        return [new Big(sca).times(vec.x).toNumber(), new Big(sca).times(vec.y).toNumber()]
    }
    linear_transformation(vec){
        let [a, c] = new matrix_2by2().multiplication(vec.x, new vector(...this.i))
        let [b, d] = new matrix_2by2().multiplication(vec.y, new vector(...this.j))
        return new vector(...new matrix_2by2().addition(new vector(a, c), new vector(b, d)))
    }
    linear_composition(matrix){
        let new_i = this.linear_transformation(new vector(...matrix.i))
        let new_j = this.linear_transformation(new vector(...matrix.j))
        return new matrix_2by2(new_i, new_j)
    }
    pow(y = 2){
        y = new Big(y).round(0, Big.roundDown).toNumber()
        let matrix_t = this
        for (let i = 1; i < y; i++) {
            matrix_t = matrix_t.linear_composition(this)
        }
        return matrix_t
    }
    determinant(){
        let [a, c] = this.i
        let [b, d] = this.j
        return (a * d - b * c)
    }
    inverse(){
        let [a, c, b, d] = [...this.i, ...this.j].map(item => item / this.determinant())
        return new matrix_2by2(new vector(d, -c), new vector(-b, a))
    }
    rank(){
        let rank = 2
        if(this.determinant() == 0)
        {
            rank = (this.i == [0, 0] && this.j == [0, 0]) ? 0 : 1
        }
        return rank
    }
    null(x = 1){
        let [a, c] = this.i
        let [b, d] = this.j
        let base_vec = new vector(0, 0)
        if (this.rank() != 0) {
            if(a == 0 && c != 0){
                let [c, a] = this.i
                let [d, b] = this.j
            }
            [base_vec.x, base_vec.y] = (a != 0) ? [-(new Big(b).div(a)), 1] : (a == 0 && c == 0 && !(b == 0 && d == 0)) ? [1, 0] : [base_vec.x, base_vec.y]
        }
        return new matrix_2by2().multiplication(x, base_vec)
    }
    dot_products(vec1, vec2){
        return (new matrix_2by2(new vector(vec1.x, 0), new vector(vec1.y, 0)).linear_transformation(vec2)).x
    }
    cross_products_2by2(vec1, vec2){
        return new matrix_2by2(vec1, vec2).determinant()
    }
    dot_products_3by3(vec1, vec1_z, vec2, vec2_z, total = true){
        vec1.z = vec1_z, vec2.z = vec2_z
        let res = new vector()
        res.x = new matrix_2by2().dot_products(new vector(vec1.x, 0), new vector(vec2.x, 0))
        res.y = new matrix_2by2().dot_products(new vector(vec1.y, 0), new vector(vec2.y, 0))
        res.z = new matrix_2by2().dot_products(new vector(vec1.z, 0), new vector(vec2.z, 0))
        return total ? res.x + res.y + res.z : res
    }
    cross_products(vec1, vec1_z, vec2, vec2_z){
        vec1.z = vec1_z, vec2.z = vec2_z
        let res = new vector()
        res.x = new matrix_2by2(new vector(vec1.y, vec1.z), new vector(vec2.y, vec2.z)).determinant()
        res.y = new matrix_2by2(new vector(vec1.x, vec1.z), new vector(vec2.x, vec2.z)).determinant()
        res.z = new matrix_2by2(new vector(vec1.x, vec1.y), new vector(vec2.x, vec2.y)).determinant()
        return new matrix_2by2().dot_products_3by3(res, res.z, new vector(1, 1), 1, false)
    }
    linear_transformation_translate(basis_matrix, vec){
        return (basis_matrix.inverse().linear_composition(this.linear_composition(basis_matrix))).linear_transformation(vec)
    }
    trace(){
        let [a, c] = this.i
        let [b, d] = this.j
        return (a + d)
    }
    eigenvalue(){
        let m = new Big(this.trace()).div(2).toNumber()
        let p = this.determinant()
        let e1 = m - Math.sqrt(new Big(m).pow(2) - p)
        let e2 = m + Math.sqrt(new Big(m).pow(2) - p)
        return e1 == e2 || isNaN(e1) ? [e1] : [e1, e2]
    }
    eigenvector(){
        let eigen_val = this.eigenvalue()
        let res = new Map()
        if (!isNaN(eigen_val[0])) {
            let [a, c] = this.i
            let [b, d] = this.j
            for (const key in eigen_val) {
                res.set(eigen_val[key], new vector(...new matrix_2by2(new vector(a - eigen_val[key], c), new vector(b, d - eigen_val[key])).null()))
            }
        }
        return res
    }
    orthonormal(vec_res = null){
        let res = false
        if (new matrix_2by2().dot_products(new vector(...this.i), new vector(...this.j)) == 0 && new Big(this.determinant()).abs().toNumber() == 1) {
            res = true
            if (vec_res != null) {
                res = new vector(new matrix_2by2().dot_products(vec_res, new vector(...this.i)), new matrix_2by2().dot_products(vec_res, new vector(...this.j)))
            }
        }
        return res
    }
    cramers_rule(vec_res){
        let ori_x = new Big(new matrix_2by2(vec_res, new vector(...this.j)).determinant()).div(this.determinant()).toNumber()
        let ori_y = new Big(new matrix_2by2(new vector(...this.i), vec_res).determinant()).div(this.determinant()).toNumber()
        return new vector(ori_x, ori_y)
    }
}