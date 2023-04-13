const MoveModule = {
    initMoveModule() {
        this.x = 0
        this.y = 0
        this.moveCanvas = this.moveCanvas.bind(this)
    },

    moveCanvas(prev, current) {
        this.x = this.x - (prev.x - current.x)
        this.y = this.y - (prev.y - current.y)
        this.updateCanvasGeometry()
    }
}

export default MoveModule