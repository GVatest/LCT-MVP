const ResizeModule = {
    initResizeModule() {
        this.scaleValue = 1 // Значение относительного размера
        this.scaleFactor = 0.1 // Значение, на которое будет изменяться относительный размер (в % / 100)
        this.maxScaleValue = 5 // Максимальный размер увеличения
        this.minScaleValue = 0.1 // Максимальный размер уменьшения

        this.canvasSizeChange = this.canvasSizeChange.bind(this)
    },

    canvasSizeChange(increase) {
        if (increase) {
            this.scaleValue = this.scaleValue * (1 + this.scaleFactor)
            this.scaleValue = Math.min(this.scaleValue, this.maxScaleValue)
        }
        else {
            this.scaleValue = this.scaleValue * (1 - this.scaleFactor)
            this.scaleValue = Math.max(this.scaleValue, this.minScaleValue)
        }
        this.updateCanvasGeometry()
    }
}

export default ResizeModule