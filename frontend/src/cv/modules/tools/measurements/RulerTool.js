import cv from "@techstark/opencv-js"
import { distanceBetweenPoints } from "../annotation/PointTool"

const RulerTool = {
    initRulerTool() {
        this.rulers = []
        this.rulerIndex = undefined
        this.rulerPointIndex = undefined
        this.rulerPointSize = 3
        this.font = cv.FONT_HERSHEY_PLAIN
        this.fontScale = 1
        this.fontThickness = 1

        this.moveRuler = this.moveRuler.bind(this)
        this.removeRuler = this.removeRuler.bind(this)
        this.putRuler = this.putRuler.bind(this)
        this.findClosestRuler = this.findClosestRuler.bind(this)
        this.findClosestRulerPoint = this.findClosestRulerPoint.bind(this)
        this.drawRulers = this.drawRulers.bind(this)
    },

    moveRuler(prev, current) {
        if (this.rulerIndex !== undefined) {
            let ruler = this.rulers[this.rulerIndex]
            let p1 = ruler[0]
            let p2 = ruler[1]
            p1.x = p1.x - (prev.x - current.x)
            p1.y = p1.y - (prev.y - current.y)
            p2.x = p2.x - (prev.x - current.x)
            p2.y = p2.y - (prev.y - current.y)
        }
        if (this.rulerPointIndex !== undefined) {
            let point = this.rulers[this.rulerPointIndex[0]][this.rulerPointIndex[1]]
            point.x = point.x - (prev.x - current.x)
            point.y = point.y - (prev.y - current.y)
        }
    },

    removeRuler() {
        if (this.rulers.length !== 0) {
            let last_ruler = this.rulers[this.rulers.length - 1]
            if (last_ruler.length === 1) {
                this.rulers.splice(this.rulers.length - 1, 1)
            }
            else {
                if (this.rulerIndex !== undefined) {
                    this.rulers.splice(this.rulerIndex, 1)
                }
                if (this.rulerPointIndex !== undefined) {
                    this.rulers.push([this.rulers[this.rulerPointIndex[0]][1 - this.rulerPointIndex[1]]])
                    this.rulers.splice(this.rulerPointIndex[0], 1)
                }
                    
            }
        }
    },

    putRuler() {
        if ((this.rulerIndex !== undefined) || (this.rulerPointIndex !== undefined)) {
            return
        }
        if (this.rulers.length == 0) {
            this.rulers.push([this.mousePosition])
        }
        else {
            if (this.rulers[this.rulers.length - 1].length == 2) {
                this.rulers.push([this.mousePosition])
            }
            else {
                let ruler = this.rulers[this.rulers.length - 1]
                ruler.push(this.mousePosition)
            }
        }
    },

    findClosestRulerPoint() {
        let ruler, point, distance, closestRulerPoint
        let minDistance = 99999
        for (let i=0; i < this.rulers.length; i++) {
            ruler = this.rulers[i]
            for (let j=0; j < ruler.length; j++) {
                point = ruler[j]
                distance = distanceBetweenPoints(point, this.mousePosition)
                if (distance < minDistance) {
                    minDistance = distance
                    closestRulerPoint = [i, j]
                }
            }
        }
        if (minDistance > this.cursorSize + this.rulerPointSize) {
            closestRulerPoint = undefined
        }
        this.rulerPointIndex = closestRulerPoint
    },

    findClosestRuler() {
        let closestRuler
        let x1, y1, x2, y2, ruler, b, c, distance
        let minDistance = 99999
        for (let i=0; i < this.rulers.length; i++) {
            ruler = this.rulers[i]
            if ((ruler.length === 0) || (ruler.length === 1)) {
                continue
            }
            [x1, y1] = [ruler[0].x, ruler[0].y]
            [x2, y2] = [ruler[1].x, ruler[1].x]
            b = undefined
            if (x1 - x2 !== 0) {
                b = (y1 - y2) / (x1 - x2)
            }
            if (b === 0) {
                continue
            }
            if (b !== undefined) {
                c = y1 - b * x1
                distance = (Math.abs(this.mousePosition.y - b * this.mousePosition.x - c) / (b ** 2 + 1)) ** 0.5
            }
            else {
                distance = Math.abs(this.mousePosition.x - x1)
            }
            if (distance < minDistance) {
                minDistance = distance
                closestRuler = i
            }
        }
        if (minDistance > this.cursorSize) {
            closestRuler = undefined
        }
        this.rulerIndex = closestRuler
    },

    drawRulers(viz) {
        let ruler, color, distance, pos, text
        for (let i=0; i < this.rulers.length; i++) {
            ruler = [...this.rulers[i]]
            if (ruler.length === 1) {
                ruler.push(this.mousePosition)
            }
            color = this.currentColor
            cv.line(viz, ruler[0], ruler[1], color, 1, cv.LINE_AA)

            if (this.rulerPointIndex !== undefined) {if ((this.rulerPointIndex[0] == i) && (this.rulerPointIndex[1] == 0)) { color = this.whiteColor }}
            cv.circle(viz, ruler[0], this.rulerPointSize, color, 1, cv.LINE_AA)

            color = this.currentColor
            if (this.rulerPointIndex !== undefined) {if ((this.rulerPointIndex[0] == i) && (this.rulerPointIndex[1] == 1)) { color = this.whiteColor }}
            cv.circle(viz, ruler[1], this.rulerPointSize, color, 1, cv.LINE_AA)

            distance = distanceBetweenPoints(ruler[0], ruler[1], this.spacing)
            
            pos = ruler[1]
            text = (Math.round(distance * 10) / 10).toString() + 'mm'
            
            if (this.font === undefined) {
                this.font = cv.FONT_HERSHEY_PLAIN
            }
            cv.putText(viz, text, pos, this.font, this.fontScale, this.whiteColor, this.fontThickness, cv.LINE_AA)
        }
        return viz
    }
}

export default RulerTool
export { distanceBetweenPoints }