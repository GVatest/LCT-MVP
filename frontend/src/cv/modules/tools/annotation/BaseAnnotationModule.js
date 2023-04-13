const BaseAnnotationModule = {
    initBaseAnnotationModule() {
        this.cursorSize = 5
        this.mousePosition = {x: 0, y: 0}
        this.mask = this.emptyMask3C.clone()
        this.viz = this.emptyMask3C.clone()
        this.emptyColor = [0, 0, 0, 0]
        this.whiteColor = [255, 255, 255, 0]
        this.currentColor = [0, 255, 0, 0]
    }
}

export default BaseAnnotationModule