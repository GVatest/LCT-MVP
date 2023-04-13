import cv from "@techstark/opencv-js"

const SlicingModule = {
    initSlicingModule() {
        this.axial_idx = 0
        this.saggital_idx = 0
        this.coronal_idx = 0
        this.isFourImages = false

        this.prevAxial = this.prevAxial.bind(this)
        this.nextAxial = this.nextAxial.bind(this)
        this.prevCoronal = this.prevCoronal.bind(this)
        this.nextCoronal = this.nextCoronal.bind(this)
        this.prevSaggital = this.prevSaggital.bind(this)
        this.nextSaggital = this.nextSaggital.bind(this)
        this.updateStatus = this.updateStatus.bind(this)
    }, 

    updateStatus() {
        if (this.isAnnotated()) {
            this.state['axialStat'][this.axial_idx] = 1
        }
        else {
            this.state['axialStat'][this.axial_idx] = 0
        }
    },
    
    prevAxial() {
        if (this.axial_idx === this.axial_length - 1) {
            return
        }
        this.saveJsonData()
        this.updateStatus()

        this.axial_idx = this.axial_idx + 1
        this.axialImage = this.getSliceImage('axial')
        this.blurredImage = new cv.Mat();
        let ksize = new cv.Size(3, 3);
        cv.GaussianBlur(this.axialImage, this.blurredImage, ksize, 0, 0, cv.BORDER_DEFAULT);

        this.uploadJsonData()
        this.forceUpdate()
    },

    nextAxial() {
        if (this.axial_idx === 0) {
            return
        }
        this.saveJsonData()
        this.updateStatus()

        this.axial_idx = Math.max(0, this.axial_idx - 1)
        this.axialImage = this.getSliceImage('axial')
        this.blurredImage = new cv.Mat();
        let ksize = new cv.Size(3, 3);
        cv.GaussianBlur(this.axialImage, this.blurredImage, ksize, 0, 0, cv.BORDER_DEFAULT);

        this.uploadJsonData()
        this.forceUpdate()
    },

    prevSaggital() {
        // this.saveJsonData()
        this.saggital_idx = Math.max(0, this.saggital_idx - 1)
        this.saggitalImage = this.getSliceImage('saggital')
        this.updateImage()
        this.forceUpdate()
        // this.uploadJsonData()
    },

    nextSaggital() {
        // this.saveJsonData()
        this.saggital_idx = Math.min(this.saggital_idx + 1, this.saggital_length - 1)
        this.saggitalImage = this.getSliceImage('saggital')
        this.updateImage()
        this.forceUpdate()
        // this.uploadJsonData()
    },

    prevCoronal() {
        // this.saveJsonData()
        this.coronal_idx = Math.max(0, this.coronal_idx - 1)
        this.coronalImage = this.getSliceImage('coronal')
        this.updateImage()
        this.forceUpdate()
        // this.uploadJsonData()
    },

    nextCoronal() {
        // this.saveJsonData()
        this.coronal_idx = Math.min(this.coronal_idx + 1, this.coronal_length - 1)
        this.coronalImage = this.getSliceImage('coronal')
        this.updateImage()
        this.forceUpdate()
        // this.uploadJsonData()
    },
}

export default SlicingModule