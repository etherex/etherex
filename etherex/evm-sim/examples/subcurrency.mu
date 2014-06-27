this.store[this.origin()] = 1000000

exit compile {
    var to = this.data[0]
    var from = this.origin()
    var value = this.data[1]

    if this.store[from] > value {
        this.store[from] = this.store[from] - value
        this.store[to] = this.store[to] + value
        exit 1
    }
}
