import cv from "@techstark/opencv-js"

const ContoursFillTool = {
    initContoursFillTool(){
        this.contourFillFlag = cv.RETR_TREE
        this.contoursFillActivate = this.contoursFillActivate.bind(this)
    },
    
    contoursFillActivate() { 
        if (this.contourFillFlag === cv.RETR_TREE) {
            this.contourFillFlag = cv.RETR_EXTERNAL
        }
        else {
            this.contourFillFlag = cv.RETR_TREE
        }
        this.updateImage()
    }
}

export default ContoursFillTool