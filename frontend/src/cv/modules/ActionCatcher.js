const ActionCatcher = {
    initActionCatcher() {
        this.leftButtonPressed = false
        this.middleButtonPressed = false
        this.rightButtonPressed = false
        this.prevMousePosition = {x: 0, y: 0}
        this.mousePosition = {x: 0, y: 0}
        this.absMousePosition = {x: 0, y: 0}
        this.absPrevMousePosition = {x: 0, y: 0}
        this.wheelFlag = true

        this.handleMouseEvents = this.handleMouseEvents.bind(this)
        this.mouseCallback = this.mouseCallback.bind(this)
    },

    handleMouseEvents() {
        this.canvasAxial.addEventListener("mousedown", (e) => {
            if (this.leftButtonPressed || this.middleButtonPressed || this.rightButtonPressed) {
                return
            }
            if (e.button === 0) {this.leftButtonPressed = true}
            if (e.button === 1) {this.middleButtonPressed = true}
            if (e.button === 2) {this.rightButtonPressed = true}
            
            if (this.leftButtonPressed) {
                if (this.tool === "PointTool") {
                    if ((this.polygonIndex !== undefined) || (this.polygonLineIndex !== undefined) ||
                        (this.polygonPointIndex !== undefined) || (this.pointIndex !== undefined) || (this.rulerPoint !== undefined)) {
                            return
                        }
                    this.putPoint()
                }
                if (this.tool === "PolygonTool") {
                    if ((this.polygonIndex !== undefined) || (this.polygonLineIndex !== undefined) ||
                        (this.polygonPointIndex !== undefined) || (this.pointIndex !== undefined) || (this.rulerPoint !== undefined)) {
                            return
                    }
                    this.putPolygon()
                }
                if (this.tool === "RulerTool") {
                    if ((this.polygonIndex !== undefined) || (this.polygonLineIndex !== undefined) ||
                        (this.polygonPointIndex !== undefined) || (this.pointIndex !== undefined) || (this.rulerPoint !== undefined)) {
                            return
                        }
                    this.putRuler()
                }
            }

            if (this.rightButtonPressed) {
                if ((this.tool !== "BrushTool") && (this.tool !== "EraserTool")) {
                    this.removePoint()
                    this.removePolygon()
                    this.removeRuler()
                }
            }

            this.updateImage()
        }
    )
 
        this.canvasAxial.addEventListener("mouseup", (e) => {
            if (e.button === 0) {this.leftButtonPressed = false}
            if (e.button === 1) {this.middleButtonPressed = false}
            if (e.button === 2) {this.rightButtonPressed = false}
        })

        this.canvasAxial.addEventListener("mouseout", (e) => {
            if (e.button === 0) {this.leftButtonPressed = false}
            if (e.button === 1) {this.middleButtonPressed = false}
            if (e.button === 2) {this.rightButtonPressed = false}
        })

        this.canvasAxial.addEventListener("wheel", (e) => {
            this.canvasSizeChange(e.deltaY < 0)
        })

        // WORKING TOO SLOW
        this.scrollAxial.addEventListener("wheel", (e) => {
            if (this.wheelFlag) {
                if (e.deltaY > 0) {
                    this.prevAxial()
                }
                else {
                    this.nextAxial()
                }
            }
            this.wheelFlag = !this.wheelFlag
        })
    },

    mouseCallback() {       
        if (this.leftButtonPressed) {
            if (this.tool === "BrushTool") {
                this.canvasAxial.onmousemove = (e) => {
                    Object.assign(this.prevMousePosition, this.mousePosition);
                    this.mousePosition = {x: e.offsetX, y: e.offsetY} // mouse position
                    this.drawCircle(this.currentColor, -1)
                    this.updateImage()
                }
            }
            if (this.tool === "EraserTool") {
                this.canvasAxial.onmousemove = (e) => {
                    Object.assign(this.prevMousePosition, this.mousePosition);
                    this.mousePosition = {x: e.offsetX, y: e.offsetY} // mouse position
                    this.drawCircle(this.emptyColor, -1)
                    this.updateImage()
                }
            }
            if ((this.tool === "PointTool") || (this.tool === "RulerTool") || (this.tool === "PolygonTool") || (this.tool === "PointerTool")){
                this.canvasAxial.onmousemove = (e) => {
                    Object.assign(this.prevMousePosition, this.mousePosition);
                    this.mousePosition = {x: e.offsetX, y: e.offsetY} // mouse position
                    this.movePoint(this.prevMousePosition, this.mousePosition)
                    this.movePolygon(this.prevMousePosition, this.mousePosition)
                    this.moveRuler(this.prevMousePosition, this.mousePosition)
                    this.updateImage()
                }
            }
            if (this.tool === "MoveTool") {
                this.canvasAxial.onmousemove = (e) => {
                    this.prevMousePosition = {}
                    Object.assign(this.prevMousePosition, this.mousePosition);
                    this.mousePosition = {x: e.offsetX, y: e.offsetY} // mouse position
                    this.moveCanvas(this.absPrevMousePosition, this.absMousePosition)
                    this.updateImage()
                }
            }
        }
        else {
            this.canvasAxial.onmousemove = (e) => {
                Object.assign(this.prevMousePosition, this.mousePosition);
                this.mousePosition = {x: e.offsetX, y: e.offsetY} // mouse position
                this.updateImage()
            }
        }
    }    
}

export default ActionCatcher