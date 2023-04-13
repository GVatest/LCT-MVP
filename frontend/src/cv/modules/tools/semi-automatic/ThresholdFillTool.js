import cv from "@techstark/opencv-js"
import { apply_criterion } from "../../../utils/transforms"
import nj from "@d4c/numjs/build/module/numjs.min.js"

const ThresholdFillTool = {
    initThresholdFillTool() {
        this.thresholsdMask = this.emptyMask.clone()
        this.isThresholdFillActive = false
        this.lowThreshValue = 300
        this.highThreshValue = 1000
        this.thresholdFill = this.thresholdFill.bind(this)
    },

    thresholdFill() {
        // Обнуляем маску с заливкой
        this.thresholdFillMask = nj.zeros([1, this.shape[1], this.shape[0]], "uint8")
        let criterion = (x) => ((x >= this.lowThreshValue) && (x <= this.highThreshValue))
        let change = (x) => 128
        this.thresholdFillMask = apply_criterion(this.thresholdFillMask.flatten(), this.njAxialBuffer.flatten(), criterion, change)  
        let newImage = new cv.matFromArray(this.shape[1], this.shape[0], cv.CV_8UC1, this.thresholdFillMask.tolist())
        cv.cvtColor(newImage, newImage, cv.COLOR_GRAY2BGR)
        cv.bitwise_or(this.mask, newImage, this.viz) 
        
        // Clear memory
        newImage.delete()
    }
}

export default ThresholdFillTool