import { distanceBetweenPoints } from "../../../utils/analysis"
import cv from "@techstark/opencv-js"

const PointTool = {
    initPointTool() {
        this.points = []
        this.pointIndex = undefined
        this.pointSize = 3

        this.findClosestPoint = this.findClosestPoint.bind(this)
        this.movePoint = this.movePoint.bind(this)
        this.removePoint = this.removePoint.bind(this)
        this.putPoint = this.putPoint.bind(this)
        this.drawPoints = this.drawPoints.bind(this)
    },

    findClosestPoint() {
        let closestPoint, distance, point
        let minDistance = 99999
        for (let j=0; j < this.points.length; j++) {
            point = this.points[j]
            distance = distanceBetweenPoints(point, this.mousePosition)
            if (distance < minDistance) {
                minDistance = distance
                closestPoint = j
            }
        }
        if (minDistance > this.cursorSize + this.pointSize) {
            closestPoint = undefined
        }
        this.pointIndex = closestPoint    
    },

    movePoint(prev, current) {
        if (this.pointIndex === undefined) {
            return
        }
        let point = this.points[this.pointIndex]
        point.x = point.x - (prev.x - current.x)
        point.y = point.y - (prev.y - current.y)
    },

    removePoint() {
        if (this.pointIndex !== undefined) {
            this.points.splice(this.pointIndex, 1)
            this.pointIndex = undefined
        }
    },

    putPoint() {
        this.points.push(this.mousePosition)
    },

    drawPoints(viz) {
        for (let j=0; j < this.points.length; j++) {
            let point = this.points[j]
            let color = this.currentColor
            if (this.pointIndex === j) {
                color = this.whiteColor
            }
            cv.circle(viz, point, this.pointSize, color, 1, cv.LINE_AA)
        }
        return viz
    }
}

export default PointTool
export { distanceBetweenPoints }