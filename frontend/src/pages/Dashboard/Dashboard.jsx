import React from "react";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../../constans";
import dwv from 'dwv'
import cv from "@techstark/opencv-js"
import nj from "@d4c/numjs/build/module/numjs.min.js"
import { apply_windowing } from "../../cv/utils/transforms";
import axios from "axios";
import { NavLink } from "react-router-dom";
import "./Dashboard.css";
import Instrument from "../../elements/Instrument/Instrument";
import exportIcon from "../../assets/images/instruments/export.svg";
import importIcon from "../../assets/images/instruments/import.svg";
import cancel from "../../assets/images/instruments/cancel.svg";
import repeat from "../../assets/images/instruments/repeat.svg";
import PullOutMenu from "../../elements/PullOutMenu/PullOutMenu";
import Instruments from "../../elements/Instruments/Instruments";
import Workspace from "../../elements/Workspace/Workspace";
import AddPopupAnnot from "../../components/AddPopupAnnot/AddPopupAnnot";

import DicomParser from "../../cv/modules/DicomParser";
import EmptyModule from "../../cv/modules/EmptyModule";
import SlicingModule from "../../cv/modules/SlicingModule";
import WindowingModule from "../../cv/modules/WindowingModule";
import AnnotationLoader from "../../cv/modules/AnnotationLoader";
import BaseGeometryModule from "../../cv/modules/geometry/BaseGeometryModule";
import MoveModule from "../../cv/modules/geometry/MoveModule";
import ResizeModule from "../../cv/modules/geometry/ResizeModule";
import ActionCatcher from "../../cv/modules/ActionCatcher";

import BaseAnnotationModule from "../../cv/modules/tools/annotation/BaseAnnotationModule";
import BrushTool from "../../cv/modules/tools/annotation/BrushTool";
import PointTool from "../../cv/modules/tools/annotation/PointTool"; 
import PolygonTool from "../../cv/modules/tools/annotation/PolygonTool";

import RulerTool from "../../cv/modules/tools/measurements/RulerTool";
import RoiTool from "../../cv/modules/tools/measurements/RoiTool";

import FloodFillTool from "../../cv/modules/tools/semi-automatic/FloodFillTool";
import ThresholdFillTool from "../../cv/modules/tools/semi-automatic/ThresholdFillTool";
import ContoursFillTool from "../../cv/modules/tools/semi-automatic/ContoursFillTool";


function withParams(Component) {
    return props => <Component {...props} params={useParams()} />;
}

dwv.image.decoderScripts = {
    "jpeg2000": "/node_modules/dwv/decoders/pdfjs/decode-jpeg2000.js",
    "jpeg-lossless": "/node_modules/dwv/decoders/rii-mango/decode-jpegloss.js",
    "jpeg-baseline": "/node_modules/dwv/decoders/pdfjs/decode-jpegbaseline.js"
};

class AnnotatorWindow extends React.Component {

    constructor (props) {
        super(props)
        this.axial_idx = 0
        this.saggital_idx = 0
        this.coronal_idx = 0
        this.mounted = false

        this.state = {'fourImage': false,
                      'axialStat': [],
                      'saggitalStat': [],
                      'coronalStat': [],
                      "studyState": decodeURI(document.URL.split("?state=").at(-1))}
        this.contoursFillFlag = cv.RETR_TREE
        this.fetchUrl = BASE_URL + `api/study/${this.props.params.uid}`
        this.isOpenAddPopup = false
        this.authRequestHeader = { // заголовки авторизации
            name: "Authorization",
            value: `Bearer ${localStorage.getItem("token")}`
        }

        this.app = new dwv.App();
        
        const handleWindowMouseMoveWindow = (e) => {
            Object.assign(this.absPrevMousePosition, this.absMousePosition);
            this.absMousePosition = {x: e.screenX, y: e.screenY}
        }
        window.addEventListener('mousemove', handleWindowMouseMoveWindow);

        this.createMat = this.createMat.bind(this)
        this.mouseCallback = this.mouseCallback.bind(this)
        this.OpenAddPopup = this.OpenAddPopup.bind(this)
        this.closePopup = this.closePopup.bind(this)
        this.clearMask = this.clearMask.bind(this);
        this.setTool = this.setTool.bind(this);
        this.importBtnCallback = this.importBtnCallback.bind(this)
        this.initAnnotationLoader = this.initAnnotationLoader.bind(this)
        this.initFloodFillTool = this.initFloodFillTool.bind(this)
        this.initThresholdFillTool = this.initThresholdFillTool.bind(this)
        this.initContoursFillTool = this.initContoursFillTool.bind(this)
        this.floodFillActivate = this.floodFillActivate.bind(this)
        this.thresholdFillActivate = this.thresholdFillActivate.bind(this)
        this.toleranceChange = this.toleranceChange.bind(this)
        this.lowThreshValueChange = this.lowThreshValueChange.bind(this)
        this.highThreshValueChange = this.highThreshValueChange.bind(this)
        this.changeView = this.changeView.bind(this)
        this.getSliceImage = this.getSliceImage.bind(this)
        this.loadSlices = this.loadSlices.bind(this)
        this.updateView = this.updateView.bind(this)
        this.loadBuffer = this.loadBuffer.bind(this)
        this.updateIdx = this.updateIdx.bind(this)
        this.isAnnotated = this.isAnnotated.bind(this)

        // SAVE DATA
        this.changeStateCallback = this.changeStateCallback.bind(this)
        
        this.initModules()
        this.initCallbacks()
        this.initChanges()    
        this.setTool('PointerTool')    
    }

    connectMethods() {
        // BASE
        this.initEmptyModule = this.initEmptyModule.bind(this)
        this.initBaseAnnotationModule = this.initBaseAnnotationModule.bind(this)
        this.initDicomParser = this.initDicomParse.bind(this)
        this.initSlicingModule = this.initSlicingModule.bind(this)
        this.initWindowingModule = this.initWindowingModule.bind(this)
        this.initBaseGeometryModule = this.initBaseGeometryModule.bind(this)
        this.initResizeModule = this.initResizeModule.bind(this)
        this.initMoveModule = this.initMoveModule.bind(this)
        this.initActionCatcher = this.initActionCatcher.bind(this)

        // ANNOTATION TOOLS
        this.initBrushTool = this.initBrushTool.bind(this)
        this.initPointTool = this.initPointTool.bind(this)
        this.initPolygonTool = this.initPolygonTool.bind(this)

        // MEASUREMENT TOOLS
        this.initRulerTool = this.initRulerTool.bind(this)

        // SEMI-AUTOMATIC
        this.initFloodFillTool = this.initFloodFillTool.bind(this)
        this.initThresholdFillTool = this.initThresholdFillTool.bind(this)
        this.initContoursFillTool = this.initContoursFillTool.bind(this)
    }

    initApp() {
        this.canvasAxial = document.getElementById("axial")
        this.canvasAxial.oncontextmenu = () => false;
        this.scrollAxial = document.getElementById("scrollAxial")
        this.updateView()
        this.app.init({
            dataViewConfigs: {'*': []}
        });

        const config = {
            headers: {
                "Authorization": this.authRequestHeader.value
            },
            params: {
                axial_id: 0,
                coronal_id: 0,
                saggital_id: 0,
            }
        }

        axios.get(this.fetchUrl, config).then((response) => {
            this.axial_json_paths = response.data["json_paths"]
            this.axial_paths = response.data["slices_paths"]
            this.axial_length = this.axial_paths.length

            let axialStat = []
            for (let i=0; i < this.axial_length; i++) {
                axialStat.push(0)
            }
            let coronalStat = []
            for (let i=0; i < 20; i++) {
                coronalStat.push(0)
            }
            let saggitalStat = []
            for (let i=0; i < 20; i++) {
                saggitalStat.push(0)
            }
            this.state['axialStat'] = axialStat
            this.state['coronalStat'] = coronalStat
            this.state['saggitalStat'] = saggitalStat
            this.setState(this.state)
            
            this.initWindowingModule()
            this.loadSlices()
            const createMatRef = this.createMat()
            const forceUpdate = this.forceUpdate()
            this.app.addEventListener('loadend', createMatRef)
            this.app.addEventListener('loadend', forceUpdate)
        })
    }

    isAnnotated() {
        if (this.polygons.length > 1) {
            return true
        }
        if (this.points.length > 0) {
            return true
        }
        if (this.rulers.length > 0) {
            return true
        }
        if (this.allContours.size() > 0) {
            console.log('contours here!')
            return true
        } 
        return false
    }

    updateView() {
        if (this.state['fourImage']) {
            this.canvasAxialClear = document.getElementById("axial_clear")
            this.canvasAxialClear.oncontextmenu = () => false;
            this.canvasSaggital = document.getElementById("saggital")
            this.canvasSaggital.oncontextmenu = () => false;
            this.canvasCoronal = document.getElementById("coronal")
            this.canvasCoronal.oncontextmenu = () => false;
        }
    }

    loadSlices() {
        let axialPathsTemp = this.axial_paths
        axialPathsTemp = axialPathsTemp.map(x => BASE_URL + x)
        this.app.loadURLs(axialPathsTemp,
            {"requestHeaders": [this.authRequestHeader]})
        }
        

    initCallbacks() {
        this.callbacks = {
            'PointerTool': () => this.setTool("PointerTool"),
            'MoveTool':   () => this.setTool("MoveTool"),
            'BrushTool': () => this.setTool("BrushTool"),
            'AntiBrushTool': () => this.setTool(""),
            'EraserTool': () => this.setTool("EraserTool"),
            'PolygonTool': () => this.setTool("PolygonTool"),
            'PointTool': () => this.setTool("PointTool"),
            'RulerTool': () => this.setTool("RulerTool"),
            'ROI': () => this.setTool("RoiTool"),
            'FloodFillTool': this.floodFillActivate,
            'FloodFill3Tool':() => {},
            'ThresholdFillTool': this.thresholdFillActivate,
            'ContoursFillTool': this.contoursFillActivate,
            'clear': this.clearMask
        }
    }

    changeView() {
        // if ((this.axial_length < this.saggital_length / 5) || (this.axial_length < this.coronal_length / 5)) {
        //     return
        // }
        this.state['fourImage'] = !this.state['fourImage']
        this.setState(this.state)

        this.scaleValue = 0.5
        this.x = 0
        this.y = 0
        this.forceUpdate()
        this.updateView()
        this.updateImage()
    }


    setTool(toolName) {
        this.tool = toolName
        if (this.tool === 'BrushTool') {this.cursorSize = this.brushSize} else {
        if (this.tool === 'EraserTool') {this.cursorSize = this.brushSize} else {
        if (this.tool === 'RoiTool') {this.cursorSize = this.RoiSize} else {
        this.cursorSize = 5}}}  
    }

    setNewCursorSize() {
        this.cursorSize = this.brushSize
    }

    initModules() {
        this.initDicomParser()
        this.initSlicingModule()
        this.initBaseGeometryModule()
        this.initResizeModule()
        this.initMoveModule()
        this.initActionCatcher()

        this.initBrushTool()
        this.initPointTool()
        this.initPolygonTool()

        this.initRulerTool()
        this.initRoiTool()
        
        this.initContoursFillTool()
        this.initAnnotationLoader()
    }

    initChanges() {
        this.changes = {
            'brushSize': this.brushSizeChange,
            'eraserSize': this.brushSizeChange,
            'tolerance': this.toleranceChange,
            'RoiSize': this.RoiSizeChange,
            'topValue': this.highThreshValueChange,
            'bottomValue': this.lowThreshValueChange
        }
    }

    loadBuffer(image) {
        this.geometry = image.getGeometry()
        this.shape = this.geometry.getSize().getValues() // width, height, deep
        this.axialBuffer = image.getBuffer()
        this.axialBuffer = new Float32Array(this.axialBuffer)
        this.njBuffer3D = nj.array(this.axialBuffer)
        this.shape[2] = Math.round(this.njBuffer3D.size / (this.shape[1] * this.shape[0]))
        this.njBuffer3D = this.njBuffer3D.reshape(this.shape[2], this.shape[1], this.shape[0])
    }

    getSliceImage(mode='axial') {
        if (mode === 'axial') {
            this.njAxialBuffer = this.njBuffer3D.slice([this.axial_idx, this.axial_idx + 1], [null, null], [null, null])
            this.njAxialBufferFlatten = nj.array(this.njAxialBuffer.tolist()).flatten()
            this.Uint8Image = apply_windowing(this.njAxialBufferFlatten, this.windowCenter, this.windowWidth, this.exposure_index)       
            let newImage = new cv.matFromArray(this.shape[1], this.shape[0], cv.CV_8UC1, this.Uint8Image.tolist())
            cv.cvtColor(newImage, newImage, cv.COLOR_GRAY2BGR)
            return newImage
        }
        else {if (mode === 'saggital') {
            this.njSaggitalBuffer = this.njBuffer3D.slice([null, null], [this.saggital_idx, this.saggital_idx + 1], [null, null]).reshape(this.shape[2], this.shape[0])
            this.njSaggitalBuffer = nj.flatten(this.njSaggitalBuffer)
            this.Uint8Image = apply_windowing(this.njSaggitalBuffer, this.windowCenter, this.windowWidth, this.exposure_index)       
            let newImage = new cv.matFromArray(this.shape[2], this.shape[0], cv.CV_8UC1, this.Uint8Image.tolist())
            cv.cvtColor(newImage, newImage, cv.COLOR_GRAY2BGR)
            return newImage
        } 
        else {if (mode === 'coronal') { 
            this.njCoronalBuffer = this.njBuffer3D.slice([null, null], [null, null], [this.coronal_idx, this.coronal_idx + 1]).reshape(this.shape[2], this.shape[1])
            this.njCoronalBuffer = nj.flatten(this.njCoronalBuffer)
            this.Uint8Image = apply_windowing(this.njCoronalBuffer, this.windowCenter, this.windowWidth, this.exposure_index)       
            let newImage = new cv.matFromArray(this.shape[2], this.shape[1], cv.CV_8UC1, this.Uint8Image.tolist())
            cv.cvtColor(newImage, newImage, cv.COLOR_GRAY2BGR)
            return newImage
        }}}
    }

    updateIdx(idx, mode='axial'){
        if (mode == 'axial') {
            this.updateStatus()
            this.axial_idx = idx
            this.axialImage = this.getSliceImage('axial')
            this.uploadJsonData()
            this.updateImage()
            this.forceUpdate()
        }
    }

    updateFillings() {

    }

    updateHandAnnotations(viz, finalMask) {
        finalMask = this.drawPolygons(finalMask) // Добавление полигонов на изображение
        cv.addWeighted(this.axialImage, 0.75, finalMask, 0.25, 0, viz) // Добавление растровой маски на изображения
        cv.drawContours(viz, this.allContours, -1, this.currentColor, 1, cv.LINE_AA) // Отрисовка контуров разметки кистью
        viz = this.drawPolygonLines(viz) // Отрисовка линий в полигонах
        viz = this.drawPoints(viz) // Отрисовка единичных точек
        viz = this.drawRulers(viz) // Отрисовка линеек
        return viz
    }

    createMat() {
        this.mounted = true
        var interval = setInterval(() => {
            try {
                this.image = this.app.getImage(0)
                this.loadBuffer(this.image)
                this.axialImage = this.getSliceImage('axial')

                if (this.state['fourImage']) {
                    this.coronalImage = this.getSliceImage('coronal')
                    this.saggitalImage = this.getSliceImage('saggital')
                }                

                this.blurredImage = new cv.Mat();
                let ksize = new cv.Size(3, 3);
                cv.GaussianBlur(this.axialImage, this.blurredImage, ksize, 0, 0, cv.BORDER_DEFAULT);

                this.allContours = new cv.MatVector()

                this.emptyMask = cv.Mat.zeros(this.shape[1], this.shape[0], cv.CV_8UC1)
                this.emptyMask3C = cv.Mat.zeros(this.shape[1], this.shape[0], cv.CV_8UC3)

                this.initBaseAnnotationModule()
                this.initFloodFillTool()
                this.initThresholdFillTool()
                
                this.updateStatus()
                this.uploadJsonData()

                cv.imshow("axial", this.axialImage)
                if (this.state["fourImage"]) {
                    cv.imshow("clear_axial", this.axialImage)
                    // cv.imshow("saggital", this.saggitalImage)
                    // cv.imshow("coronal", this.coronalImage)
                }
                clearInterval(interval)
            } catch (e) {
                console.log(e)
            }
        }, 1000)
    }

    componentDidMount() {
        this.initApp()
        this.handleMouseEvents()
    }

    shouldComponentUpdate() {
        return true
    }

    thresholdFillActivate() {
        this.isThresholdFillActive = !this.isThresholdFillActive
        if (this.isThresholdFillActive) {
            this.thresholdFill()
        }
        else {
            this.thresholdFillMask = nj.zeros(this.shape[1], this.shape[0], "uint8")
            this.viz = this.mask.clone()
        }
        this.updateImage()
    }

    updateClosestObjects() {
        if (this.leftButtonPressed) {
            return
        }
        this.findClosestPolygonPoint()
        if (this.polygonPointIndex === undefined) {
            this.findClosestPolygonLine()
            if (this.polygonLineIndex === undefined) {
                this.findClosestPolygon()
            }
            else {
                this.polygonIndex = undefined
            }
        }
        else {
            this.polygonLineIndex = undefined
            this.polygonIndex = undefined
        }
        this.findClosestRulerPoint()
        if (this.rulerPointIndex === undefined) {
            this.findClosestRuler()
        }
        
        this.findClosestPoint()
    }

    
    updateImage() {
        if (!this.mounted) {
            return
        }
        let viz = new cv.Mat();
        this.allContours = this.findContours(this.viz) // Получим контуры разметки кистью
        let vizTemp = this.viz.clone()
        
        cv.drawContours(vizTemp, this.allContours, -1, this.currentColor, -1, cv.LINE_AA)
        let finalMask = vizTemp.clone()
        this.updateClosestObjects()

        viz = this.updateHandAnnotations(viz, finalMask)
        if (this.tool === 'RoiTool') {
            viz = this.drawRoi(viz)
        }
        // Update axial
        cv.circle(viz, this.mousePosition, this.cursorSize, this.whiteColor, 1, cv.LINE_AA)
        cv.circle(viz, this.mousePosition, 1, this.whiteColor, 1, cv.LINE_AA)
        cv.imshow("axial", viz)
        if (this.state["fourImage"]) {
            cv.imshow("clear_axial", this.axialImage)
            if (this.saggitalImage === undefined) {
                this.saggitalImage = this.getSliceImage('saggital')
            }
            cv.imshow("saggital", this.saggitalImage)

            if (this.coronalImage === undefined) {
                this.coronalImage = this.getSliceImage('coronal')
            }
            cv.imshow("coronal", this.coronalImage)
        }

        // Clear memory
        viz.delete()
        vizTemp.delete()
        finalMask.delete()
    }

    floodFillActivate () {
        this.isFloodFillActive = !this.isFloodFillActive
        if (this.isFloodFillActive) {
            this.floodFill()
        }
        else {
            this.floodFillMask = this.emptyMask.clone()
            this.viz = this.mask.clone()
        }
        this.updateImage()
    }

    clearMask() {
        this.mask = this.emptyMask3C.clone()
        this.viz = this.emptyMask3C.clone()
        this.floodFillMask = this.emptyMask.clone()
        this.tresholdFillMask = 

        this.polygons = [[]]
        this.points = []
        this.rulers = []
        this.scaleValue = 1

        this.allContours = new cv.MatVector()
        this.updateImage()
    }

    toleranceChange(e) {
        this.tolerance = parseInt(e.target.value)
        this.floodFillActivate()
        this.updateImage()
    }    

    lowThreshValueChange(e) {
        this.lowThreshValue = parseInt(e.target.value)
        this.thresholdFillActivate()
        this.updateImage()
    }  

    highThreshValueChange(e) {
        this.highThreshValue = parseInt(e.target.value)
        this.thresholdFillActivate()
        this.updateImage()
    }  
    
    OpenAddPopup() {
        this.isOpenAddPopup = true
    }

    importBtnCallback() {
        this.isOpenAddPopup = true
        this.forceUpdate()
    }

    closePopup() {
        this.isOpenAddPopup = false;
        this.forceUpdate()
    }

    changeStateCallback(e) {
        this.state["studyState"] = e.target.value
        this.setState(this.state)
        this.editStudy(this.props.params.uid, {
            state: this.state.studyState
        })
        .then((res) => {
            console.log(res.data)
            // window.location = "/study/"
        }).catch((err) => {
            console.log(err)
        })
    }

    editStudy(studyId, newData) {
        const config = {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
        return axios.patch(BASE_URL + `api/study/${studyId}`, newData, config)
    }

    render () {
    return (
            <>
            <div className="dashboard">
                {/* <div className="dashboard__user_info"></div>
                        <FileManager/> */}

                <div className="dashboard__header">
                <div className="dashboard__control">
                <NavLink to="/study" className="dashboard__back" onClick={this.saveJsonData}>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                    d="M7.00005 4.54997C7.15005 4.79997 7.05005 5.09997 6.80005 5.24997L2.85005 7.49997H15C15.3 7.49997 15.5 7.69997 15.5 7.99997C15.5 8.29997 15.3 8.49997 15 8.49997H2.85005L6.80005 10.8C7.05005 10.95 7.10005 11.25 7.00005 11.5C6.85005 11.75 6.55005 11.8 6.30005 11.7L0.750049 8.44997C0.400049 8.24997 0.400049 7.79997 0.750049 7.59997L6.30005 4.39997C6.55005 4.19997 6.85005 4.29997 7.00005 4.54997Z"
                    fill="#5693E1"
                    />
                </svg>
                <span className="dashboard__back-info">
                    Вернуться к списку исследований
                </span>
                </NavLink>
                    <ul className="dashboard__control-list">
                    <li className="dashboard__control-item">
                        <Instrument
                        img={exportIcon}
                        alt="Экспорт"
                        onClick={this.exportJsonData}
                        disabled={false}
                        />
                    </li>
                    <li className="dashboard__control-item">
                    <label className="dashboard__control-import">
                    <button type="button" className="instrument" onClick={this.importBtnCallback}>
                    <img src={importIcon} />
                    </button>
                    <span className="instrument__info">Импорт</span>
                    </label>
                    </li>
                    <AddPopupAnnot
                    isOpenAddPopup={this.isOpenAddPopup}
                    closeAllPopups={this.closePopup}
                    addStudy={this.importJsonData}
                    />
                    {/* <li className="dashboard__control-item">
                        <Instrument
                        img={cancel}
                        alt="Отменить"
                        onClick={this.onClick}
                        disabled={true}
                        />
                    </li>
                    <li className="dashboard__control-item">
                        <Instrument
                        img={repeat}
                        alt="Повторить"
                        onClick={this.onClick}
                        disabled={true}
                        />
                    </li> */}
                    <div className="dashboard__control-item">
                        <span id="numberOfSlices">
                            {String(this.axial_idx + 1) + '/' + String(this.axial_length)}
                        </span>
                    </div>
                    </ul>
                </div>

                <form className="dashboard__condition">
                    <select
                    className="dashboard__select"
                    name="condition"
                    onChange={this.changeStateCallback}
                    defaultValue={this.state.studyState}
                    >
                    <option value="Не размечен">Не размечен</option>
                    <option value="В процессе разметки">В процессе разметки</option>
                    <option value="Размечен">Размечен</option>
                    <option value="Отклонён">Отклонён</option>
                    </select>
                </form>
                </div>

                <div className="dashboard__center">
                <Instruments
                    callbacks={this.callbacks}
                    changes={this.changes}
                />

                <Workspace
                    fourImage={this.state['fourImage']}
                    changeView={this.changeView}
                    mouseCallback={this.mouseCallback}
                    nextAxial={this.nextAxial}
                    prevAxial={this.prevAxial}
                    nextSaggital={this.nextSaggital}
                    prevSaggital={this.prevSaggital}
                    nextCoronal={this.nextCoronal}
                    prevCoronal={this.prevCoronal}
                    axialStat={this.state['axialStat']}
                    saggitalStat={this.state['saggitalStat']}
                    coronalStat={this.state['coronalStat']}
                    axial_idx={this.axial_idx}
                    saggital_idx={this.saggital_idx}
                    coronal_idx={this.coronal_idx}
                    updateIdx={this.updateIdx}
                />
                </div>

                <PullOutMenu windowCenter={this.windowCenter} windowWidth={this.windowWidth} wcCallback={this.wcCallback} wwCallback={this.wwCallback} baseWindowingCallback={this.baseWindowingCallback}/>
            </div>
            </>
        );
    }
}

Object.assign(AnnotatorWindow.prototype, EmptyModule)
Object.assign(AnnotatorWindow.prototype, DicomParser)
Object.assign(AnnotatorWindow.prototype, SlicingModule)
Object.assign(AnnotatorWindow.prototype, WindowingModule)
Object.assign(AnnotatorWindow.prototype, AnnotationLoader)
Object.assign(AnnotatorWindow.prototype, BaseGeometryModule)
Object.assign(AnnotatorWindow.prototype, MoveModule)
Object.assign(AnnotatorWindow.prototype, ResizeModule)
Object.assign(AnnotatorWindow.prototype, ActionCatcher)
Object.assign(AnnotatorWindow.prototype, EmptyModule)

Object.assign(AnnotatorWindow.prototype, BaseAnnotationModule)
Object.assign(AnnotatorWindow.prototype, PointTool)
Object.assign(AnnotatorWindow.prototype, PolygonTool)
Object.assign(AnnotatorWindow.prototype, BrushTool)

Object.assign(AnnotatorWindow.prototype, RulerTool)
Object.assign(AnnotatorWindow.prototype, RoiTool)

Object.assign(AnnotatorWindow.prototype, FloodFillTool)
Object.assign(AnnotatorWindow.prototype, ThresholdFillTool)
Object.assign(AnnotatorWindow.prototype, ContoursFillTool)


export default withParams(AnnotatorWindow)