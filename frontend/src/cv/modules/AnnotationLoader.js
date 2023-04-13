import cv from "@techstark/opencv-js"
import axios from "axios"
import { BASE_URL } from "../../constans"
import JSZip from "jszip"

const AnnotationLoader = {
    initAnnotationLoader() {
        this.createJsonData = this.createJsonData.bind(this)
        this.saveJsonData = this.saveJsonData.bind(this)
        this.exportJsonData = this.exportJsonData.bind(this)
        this.uploadJsonData = this.uploadJsonData.bind(this)
        this.importJsonData = this.importJsonData.bind(this)
        this.loadJsonData = this.loadJsonData.bind(this)
        this.superCoolLoadData = this.superCoolLoadData.bind(this)
    },

    createJsonData() {
        const points = []
        for (let i = 0; i < this.allContours.size(); ++i) {
            const ci = this.allContours.get(i)
            points.push([])
            for (let j = 0; j < ci.data32S.length; j += 2){
                let p = {}
                p.x = ci.data32S[j]
                p.y = ci.data32S[j+1]
                points[i].push(p)
            }
        }
        const data = {
            'contours': points,
            'rulers': this.rulers,
            'polygons': this.polygons,
            'points': this.points}
        return data
    },

    saveJsonData() {
        console.log('save!')
        const myData = this.createJsonData(); 
        const json = JSON.stringify(myData, null, 2);
        const body = [{"dst": this.axial_json_paths[this.axial_idx], "object": json}]
        const config = {
            headers: {
                "Authorization": this.authRequestHeader.value
            }
        }
        axios.post(BASE_URL + `api/study/${this.props.params.uid}`, body, config)
        .then((response) => {
            console.log(response.data["success"])
        }).catch((err) => {
            console.log(err)
        })
    },

    exportJsonData() {
        this.saveJsonData()
        const config = {
            headers: {
                "Authorization": this.authRequestHeader.value,
            }
        }
        axios.get(BASE_URL + `api/study/markup/${this.props.params.uid}`, config)
        .then((response) => {

            const link = document.createElement("a")
            link.href = BASE_URL + response.data.url
            link.download = "markup.zip"
            link.click();

        }).catch((e) => {
            console.log(e)
        })
    },

    importJsonData(file) {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            this.loadJsonData(e.target.result);
        };

        if (file.type === "application/json") {
            fileReader.readAsText(file, "UTF-8");
        } else if ("application/zip") {

            const config = {
                headers: {
                    "Authorization": this.authRequestHeader.value,
                }
            }

            const zip = new JSZip()
            zip.file("markup.zip", file)
            zip.generateAsync({ type: "blob" }).then((content) => {
                const formData = new FormData();
                formData.append("file", content);
                axios.post(BASE_URL + `api/study/markup/${this.props.params.uid}`, formData, config)
                .then((response) => {
                    console.log(response)
                }).catch((e) => {
                    console.log(e)
                })
            });  
        }
        this.closePopup()

        this.uploadJsonData()
        this.forceUpdate()
    },

    superCoolLoadData(data) {
        this.clearMask()
        const contours = new cv.MatVector()
        const points = data.contours
        let polygon
        let square_point_data, npts, square_points, pts, array_polygon
        this.mask = this.emptyMask3C.clone()

        for (let i=0; i < points.length; i++) {
            polygon = [...points[i]]
            array_polygon = []
            for (let j=0; j < polygon.length; j++) {
                array_polygon.push(polygon[j].x)
                array_polygon.push(polygon[j].y)
            }
            square_point_data = new Int32Array(array_polygon)
            npts = polygon.length; pts = new cv.MatVector()
            square_points = cv.matFromArray(npts, 1, cv.CV_32SC2, square_point_data)
            pts.push_back(square_points)
            cv.fillPoly(this.mask, pts, this.currentColor)
        }
        
        cv.drawContours(this.mask, contours, -1, this.currentColor, -1, cv.LINE_AA)
        this.rulers = [...data['rulers']]
        this.polygons = [...data['polygons']]
        this.points = [...data['points']]
        let floodFillMask = new cv.Mat()
        cv.cvtColor(this.floodFillMask, floodFillMask, cv.COLOR_GRAY2BGR)
        cv.bitwise_or(this.mask, floodFillMask, this.viz)
    },

    loadJsonData(data) {
        data = JSON.parse(data)
        this.superCoolLoadData(data)
        this.updateImage()
    },

    uploadJsonData() {
        let url = this.axial_json_paths[this.axial_idx]
        axios.get(BASE_URL + url).then((response) => {
            try {
                const data = JSON.parse(response.data)
                this.superCoolLoadData(data)
                this.updateImage()
            }
            catch (e) {
                const data = response.data
                this.superCoolLoadData(data)
                this.updateImage()
            }
        })        
    }
}

export default AnnotationLoader