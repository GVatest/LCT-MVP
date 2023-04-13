import { isPointInPolygon, distanceBetweenPoints } from "../../../utils/analysis"
import cv from "@techstark/opencv-js"

const PolygonTool = {
    initPolygonTool() {
        this.polygons = [[]]
        this.polygonIndex = undefined
        this.polygonLineIndex = undefined
        this.polygonPointIndex = undefined
        this.polygonPointSize = 3

        this.findClosestPolygon = this.findClosestPolygon.bind(this)
        this.findClosestPolygonLine = this.findClosestPolygonLine.bind(this)
        this.findClosestPolygonPoint = this.findClosestPolygonPoint.bind(this)
        this.movePolygon = this.movePolygon.bind(this)
        this.removePolygon = this.removePolygon.bind(this)
        this.putPolygon = this.putPolygon.bind(this)
        this.drawPolygonLines = this.drawPolygonLines.bind(this)
        this.drawPolygons = this.drawPolygons.bind(this)
    },

    findClosestPolygonPoint(){
        let closestPolygonPoint, polygon, point, distance
        let minDistance = 99999
        for (let i=0; i < this.polygons.length; i++) {
            polygon = this.polygons[i]
            if (polygon.length === 0) {
                continue
            }
            for (let j=0; j < polygon.length; j++) {
                point = polygon[j]
                distance = distanceBetweenPoints(point, this.mousePosition)
                if (distance < minDistance) {
                    minDistance = distance
                    closestPolygonPoint = [i, j]
                }
            }
        }
        if (minDistance > this.cursorSize + this.polygonPointSize) {
            closestPolygonPoint = undefined
        }
        this.polygonPointIndex = closestPolygonPoint
    },

    findClosestPolygonLine() {
        let closestPolygonLine
        let x1, y1, x2, y2, polygon, b, c, distance
        let minDistance = 99999
        for (let i=0; i < this.polygons.length; i++) {
            polygon = this.polygons[i]
            if (polygon.length === 0) {
                continue
            }
            for (let j=1; j < this.polygons.length; j++) {
                [x1, y1] = [this.polygons[j - 1].x, this.polygons[j - 1].y]
                [x2, y2] = [this.polygons[j].x, this.polygons[j].y]
                b = undefined
                if (x1 - x2 !== 0) {
                    b = (y1 - y2) / (x1 - x2)
                }
                if (b === 0) {
                    continue
                }
                distance
                if (b !== undefined) {
                    c = y1 - b * x1
                    distance = (Math.abs(this.mousePosition.y - b * this.mousePosition.x - c) / (b ** 2 + 1)) ** 0.5
                }
                else {
                    distance = Math.abs(this.mousePosition.x - x1)
                }
                if (distance < minDistance) {
                    minDistance = distance
                    closestPolygonLine = [i, [j, j + 1]]
                }
            }
        }
        if (minDistance > this.cursorSize) {
            closestPolygonLine = undefined
        }
        this.polygonLineIndex = closestPolygonLine
    },

    findClosestPolygon() {
        let polygon, closestPolygon, polygonTemp
        for (let i=0; i < this.polygons.length; i++) {
            polygon = this.polygons[i]
            if (polygon.length === 0) {
                continue
            }
            if ((polygon.length > 2) && (this.polygons[this.polygons.length - 1].length == 0)) {
                if (isPointInPolygon(this.mousePosition, polygon)) {
                    closestPolygon = i
                }
            }
        }
        this.polygonIndex = closestPolygon
    },

    movePolygon(prev, current) {
        let point
        if (this.polygonPointIndex !== undefined) {
            point = this.polygons[this.polygonPointIndex[0]][this.polygonPointIndex[1]]
            point.x = point.x - (prev.x - current.x)
            point.y = point.y - (prev.y - current.y)
        }
        else {
            if (this.polygonLineIndex !== undefined) {
                point = this.polygons[this.polygonLineIndex[0]][this.polygonLineIndex[1][0]]
                point.x = point.x - (prev.x - current.x)
                point.y = point.y - (prev.y - current.y)
                point = this.polygons[this.polygonLineIndex[0]][this.polygonLineIndex[1][1]]
                point.x = point.x - (prev.x - current.x)
                point.y = point.y - (prev.y - current.y)
            }
            else {
                if (this.polygonIndex !== undefined) {
                    for (let i=0; i < this.polygons[this.polygonIndex].length; i++) {
                        point = this.polygons[this.polygonIndex][i]
                        point.x = point.x - (prev.x - current.x)
                        point.y = point.y - (prev.y - current.y)
                    }
                }
            }
        }
    },

    putPolygon() {
        let polygon = this.polygons[this.polygons.length - 1]
        polygon.push(this.mousePosition)

        // if ((this.polygonIndex === undefined) && (this.polygonLineIndex !== undefined)) {
        //     polygon.splice(this.polygonLineIndex[1][0], 0, this.mousePosition);
        // }

        // if ((this.polygonIndex === undefined) && (this.polygonPointIndex !== undefined)) {
        //     polygon.splice(this.polygonPointIndex[1], 0, this.mousePosition);
        // }

    },

    removePolygon() {
        let polygon = this.polygons[this.polygons.length - 1]
        if (polygon.length === 0) { // Если полигоны уже установлены
            if (this.polygonPointIndex !== undefined) {
                this.polygons[this.polygonPointIndex[0]].splice(this.polygonPointIndex[1], 1)

                if (this.polygons[this.polygonPointIndex[0]].length < 3) {
                    this.polygons.splice(this.polygonPointIndex[0], 1)
                    if (this.polygons.length === 0) {
                        this.polygons.push([])
                    }
                }
            }

            if (this.polygonLineIndex !== undefined) {
                this.polygons[this.polygonLineIndex[0]].splice(this.polygonLineIndex[1][0], 2)

                if (this.polygons[this.polygonLineIndex[0]].length < 3) {
                    this.polygons.splice(this.polygonLineIndex[0], 1)
                    if (this.polygons.length === 0) {
                        this.polygons.push([])
                    }
                }
            }

            if (this.polygonIndex !== undefined) {
                this.polygons.splice(this.polygonIndex, 1)
                
                if (this.polygons.length === 0) {
                    this.polygons.push([])
                }
            }
        }
        else {
            if (this.polygons[this.polygons.length - 1].length < 3) {
                this.polygons.splice(this.polygons.length - 1, 1)
                if (this.polygons.length === 0) {
                    this.polygons.push([])
                }
            }
            else {
                this.polygons.push([])
            }
        this.polygonIndex = undefined
        this.polygonLineIndex = undefined
        this.polygonPointIndex = undefined
        }
    },
    
    drawPolygons(mask) {
        let color, polygon
        let square_point_data, npts, square_points, pts, array_polygon
        for (let i=0; i < this.polygons.length; i++) {
            polygon = [...this.polygons[i]]
            if (i === this.polygons.length - 1) {
                polygon.push(this.mousePosition)
            }
            
            color = this.currentColor
            if (i === this.polygonIndex) {color = this.whiteColor}

            if (polygon.length === 2) {
                cv.line(mask, polygon[0], polygon[1], color, 1, cv.LINE_AA)
            }
            else {
                if (polygon.length > 2) {
                    array_polygon = []
                    for (let j=0; j < polygon.length; j++) {
                        array_polygon.push(polygon[j].x)
                        array_polygon.push(polygon[j].y)
                    }
                    square_point_data = new Int32Array(array_polygon)
                    npts = polygon.length; pts = new cv.MatVector()
                    square_points = cv.matFromArray(npts, 1, cv.CV_32SC2, square_point_data)
                    pts.push_back(square_points)
                    cv.fillPoly(mask, pts, color)
                }
            }
        }
        return mask 
    },

    drawPolygonLines(viz) {
        let polygon, color, prev_point, point
        for (let i=0; i < this.polygons.length; i++) {
            polygon = [...this.polygons[i]]
            // Если отрезок ещё не установлен, то вторая координата - мышь
            if (polygon.length === 0) {
                continue
            }
            if (i === this.polygons.length - 1) {
                polygon.push(this.mousePosition)
            }
            // Если на отрезок наведён курсор, то её цвет - белый, иначе - зелёный
            prev_point = {}, point = {}
            Object.assign(prev_point, polygon[0]);
            color = this.currentColor
            if (this.polygonPointIndex !== undefined) {
                if ((this.polygonPointIndex[0] === i) && (this.polygonPointIndex[1] === 0)) {color = this.whiteColor}
            }
            if (this.polygonLineIndex !== undefined) {
                if ((this.polygonPointIndex[0] === i) && ((this.polygonPointIndex[1][0] === 0) || (this.polygonPointIndex[1][1] === 0))) {color = this.whiteColor}
            }
            cv.circle(viz, prev_point, this.polygonPointSize, color, 1, cv.LINE_AA)
            for (let j=1; j < polygon.length; j++) {
                Object.assign(point, polygon[j]);
                color = this.currentColor
                if (this.polygonPointIndex !== undefined) {
                    if ((this.polygonPointIndex[0] === i) && (this.polygonPointIndex[1] === j)) {color = this.whiteColor}
                }
                if (this.polygonLineIndex !== undefined) {
                    if ((this.polygonPointIndex[0] === i) && ((this.polygonPointIndex[1][0] === j) || (this.polygonPointIndex[1][1] === j))) {color = this.whiteColor}
                }
                cv.line(viz, prev_point, point, this.currentColor, 1, cv.LINE_AA)
                cv.circle(viz, point, this.polygonPointSize, color, 1, cv.LINE_AA)
                Object.assign(prev_point, point);
            }
            cv.line(viz, prev_point, polygon[0], this.currentColor, 1, cv.LINE_AA)
        }
        return viz
    }
}

export default PolygonTool
export { distanceBetweenPoints }