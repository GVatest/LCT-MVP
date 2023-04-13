import { apply_windowing } from "../utils/transforms"
import cv from "@techstark/opencv-js"
import nj from "@d4c/numjs/build/module/numjs.min.js"
import { BASE_URL } from "../../constans"

const WindowingModule = {
    initWindowingModule() {
        this.calculateBaseWindowing = this.calculateBaseWindowing.bind(this)
        this.calculateFullDynamic = this.calculateFullDynamic.bind(this)
        this.updateWindowing = this.updateWindowing.bind(this)
        this.baseWindowingCallback = this.baseWindowingCallback.bind(this)
        this.wwCallback = this.wwCallback.bind(this)
        this.wcCallback = this.wcCallback.bind(this)
        this.updateFields = this.updateFields.bind(this)

        this.parseInstance(BASE_URL + this.axial_paths[this.axial_idx])
    },

    calculateBaseWindowing() {
        this.parseTags(this.rawTags)
    }, 

    calculateFullDynamic() {
        this.windowCenter = Math.round((nj.min(this.njAxialBufferFlatten) + nj.max(this.njAxialBufferFlatten)) / 2)
        this.windowWidth = this.windowCenter -  Math.round(nj.min(this.njAxialBufferFlatten))
    },
    
    updateWindowing() {
        this.Uint8Image = apply_windowing(this.njAxialBufferFlatten, this.windowCenter, this.windowWidth, this.exposure_index)
        this.axialImage = new cv.matFromArray(this.shape[1], this.shape[0], cv.CV_8UC1, this.Uint8Image.tolist())
        cv.cvtColor(this.axialImage, this.axialImage, cv.COLOR_GRAY2BGR)
        // if (this.state['fourImage']) {
        //     this.Uint8Image = apply_windowing(this.njSaggitalBuffer, this.windowCenter, this.windowWidth)
        //     this.saggitalImage = new cv.matFromArray(this.shape[1], this.shape[0], cv.CV_8UC1, this.Uint8Image.tolist())
        //     cv.cvtColor(this.saggitalImage, this.njSaggitalImage, cv.COLOR_GRAY2BGR)
        //     this.Uint8Image = apply_windowing(this.coronalImage, this.windowCenter, this.windowWidth)
        //     this.coronalImage = new cv.matFromArray(this.shape[1], this.shape[0], cv.CV_8UC1, this.Uint8Image.tolist())
        //     cv.cvtColor(this.coronalImage, this.njCoronalImage, cv.COLOR_GRAY2BGR)
        // }
        this.blurredImage = new cv.Mat();
        let ksize = new cv.Size(3, 3);
        cv.GaussianBlur(this.axialImage, this.blurredImage, ksize, 0, 0, cv.BORDER_DEFAULT);
    },

    baseWindowingCallback(e) {
        let value = e.target.value
        if (value === "Базовые значения") {
            this.calculateBaseWindowing()
        }
        if (value === "Полная динамика") {
            this.calculateFullDynamic()
        }
        if (value === "Лёгкие") {
            this.windowCenter = -600
            this.windowWidth = 1500
        }
        if (value === "Мозг") {
            this.windowCenter = 40
            this.windowWidth = 80
        }
        if (value === "Печень") {
            this.windowCenter = 30
            this.windowWidth = 150
        }
        if (value === "Кости") {
            this.windowCenter = 400
            this.windowWidth = 1800
        }
        this.updateFields()
        this.updateWindowing()
        this.updateImage()
    },

    updateFields() {
        let ww_input = document.getElementById("windowWidth")
        ww_input.value = this.windowWidth
        let wc_input = document.getElementById("windowCenter")
        wc_input.value = this.windowCenter
    },

    wwCallback(e) {
        this.windowWidth = parseInt(e.target.value)
        this.updateWindowing()
        this.updateImage()
    },

    wcCallback(e) {
        this.windowCenter = parseInt(e.target.value)
        this.updateWindowing()
        this.updateImage()
    }
}

export default WindowingModule