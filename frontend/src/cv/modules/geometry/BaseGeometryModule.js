const BaseGeometryModule = {
    initBaseGeometryModule() {
        this.updateCanvasGeometry = this.updateCanvasGeometry.bind(this)
    },

    updateCanvasGeometry() {
        this.canvasAxial.style = `transform: translate(${this.x}px, ${this.y}px) scale(${this.scaleValue}); margin:auto;`
        if (this.state['fourImage']) {
            this.canvasAxialClear.style = `transform: translate(${this.x}px, ${this.y}px) scale(${this.scaleValue}); margin:auto;`
        }
    }
}

export default BaseGeometryModule