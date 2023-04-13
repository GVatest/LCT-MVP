import dwv from 'dwv'

const DicomParser = {
    initDicomParser() {
        this.parseInstance = this.parseInstance.bind(this)
        this.parseTags = this.parseTags.bind(this)
    },

    parseTags(rawTags) {
        if ("x00281050" in rawTags) {this.windowCenter = parseInt(rawTags.x00281050.value[0], 10)}
        if ("x00281051" in rawTags) {this.windowWidth = parseInt(rawTags.x00281051.value[0], 10)}
        if ("x00281053" in rawTags) {this.slope = parseInt(rawTags.x00281053.value[0], 10)}
        if ("x00281052" in rawTags) {this.rescaleIntercept = parseInt(rawTags.x00281052.value[0], 10)}
        if ("x00280004" in rawTags) {this.photometricInterpretation = parseInt(rawTags.x00280004.value[0], 10)}
        if ("x00280030" in rawTags) {this.spacing = [parseFloat(rawTags.x00280030.value[0]), parseFloat(rawTags.x00280030.value[1])]}
        this.exposure_index = 1
        if ("x00181412" in rawTags) {
            this.exposure_index = parseFloat(rawTags.x00181412.value[0])
        }
        if ("x00187060" in rawTags) {
            if (rawTags.x00181412.value[0] === "AUTOMATIC") {
                this.exposure_index = 1
            }
        }
    },
    
    parseInstance(url) {
        var request = new XMLHttpRequest()
        this.dicomParser = new dwv.dicom.DicomParser()
        request.open('GET', url)
        request.setRequestHeader("Authorization", this.authRequestHeader["Authorization"])
        request.responseType = 'arraybuffer'
        request.onload = (event) => {
            this.dicomParser.parse(event.target.response)
            this.rawTags  = this.dicomParser.getRawDicomElements()
            this.parseTags(this.rawTags)
        }
        request.send()
    },
}

export default DicomParser