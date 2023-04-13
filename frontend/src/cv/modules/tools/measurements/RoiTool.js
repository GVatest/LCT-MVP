import cv from "@techstark/opencv-js"

const RoiTool = {
    initRoiTool() {
        this.RoiSize = 5
        this.contourFillFlag = cv.RETR_TREE
        this.drawRoi = this.drawRoi.bind(this)
        this.RoiSizeChange = this.RoiSizeChange.bind(this)
    },

    calculateRoi() {
        let roiRect = this.njAxialBuffer.slice([null, null], [this.mousePosition.y - this.RoiSize, this.mousePosition.y + this.RoiSize], [this.mousePosition.x - this.RoiSize, this.mousePosition.x + this.RoiSize])
        return roiRect.mean()
    },

    drawRoi(viz) {
        const roi = this.calculateRoi()
        const text = (Math.round(roi * 10) / 10).toString() + 'HU'
        const pos = {'x': this.mousePosition.x + this.RoiSize, 'y': this.mousePosition.y - this.RoiSize}
        if (this.font === undefined) {
            this.font = cv.FONT_HERSHEY_PLAIN
        }
        cv.putText(viz, text, pos, this.font, this.fontScale, this.whiteColor, this.fontThickness, cv.LINE_AA)
        return viz
    },

    RoiSizeChange(e) {
        this.RoiSize = parseInt(e.target.value)
        if (this.tool === 'RoiTool') {
            this.cursorSize = this.RoiSize
        }
    }
}

export default RoiTool