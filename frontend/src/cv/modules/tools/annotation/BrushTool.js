import cv from "@techstark/opencv-js"

const BrushTool = {
    initBrushTool() {
        this.brushSize = 5
        this.contourFillFlag = cv.RETR_TREE

        this.findContours = this.findContours.bind(this)
        this.brushSizeChange = this.brushSizeChange.bind(this)
        this.drawCircle = this.drawCircle.bind(this)
    },

    findContours(mask) {
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        let binMask = new cv.Mat();

        cv.cvtColor(mask, binMask, cv.COLOR_RGB2GRAY);
        cv.threshold(binMask, binMask, 2, 255, cv.THRESH_BINARY);
        if (this.contourFillFlag === undefined) {
            this.contourFillFlag = cv.RETR_TREE
        }
        cv.findContours(binMask, contours, hierarchy, this.contourFillFlag, cv.CHAIN_APPROX_SIMPLE)

        binMask.delete()
        hierarchy.delete()
        return contours
    },

    drawCircle(color, thickness) {
        cv.circle(this.mask, this.mousePosition, this.brushSize, color, thickness, cv.LINE_AA)
        cv.circle(this.viz, this.mousePosition, this.brushSize, color, thickness, cv.LINE_AA)
    },

    brushSizeChange(e) {
        this.brushSize = parseInt(e.target.value)
        if ((this.tool === 'BrushTool') || (this.tool === 'EraserTool')) {
            this.cursorSize = this.brushSize
        }
    }
}

export default BrushTool