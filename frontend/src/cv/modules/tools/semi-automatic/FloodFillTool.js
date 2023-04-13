import cv from "@techstark/opencv-js"

const FloodFillTool = {
    initFloodFillTool() {
        this.floodFillMask = this.emptyMask.clone()
        this.isFloodFillActive = false
        this.floodFillFlags = 4 | cv.FLOODFILL_FIXED_RANGE | cv.FLOODFILL_MASK_ONLY | 255 << 8
        this.tolerance = 5

        this.singleFloodFill = this.singleFloodFill.bind(this)
        this.floodFill = this.floodFill.bind(this)
        this.toleranceChange = this.toleranceChange.bind(this)
    },

    singleFloodFill(image, x, y, tolerance){
        // Создаём специальную временную пустую маску для заливки
        let floodFillMaskTemp = cv.Mat.zeros(image.rows + 2, image.cols + 2, cv.CV_8UC1)

        // Процесс заливки
        cv.floodFill(image, floodFillMaskTemp, new cv.Point(x, y), this.currentColor, image, tolerance, tolerance, this.floodFillFlags)

        // Обрезаем специальную маску (такова специфика функции)
        const rect = new cv.Rect(1, 1, image.rows, image.cols);
        floodFillMaskTemp = floodFillMaskTemp.roi(rect);
        return floodFillMaskTemp
    },

    floodFill() {
        // Обнуляем маску с заливкой
        this.floodFillMask = this.emptyMask.clone()

        // Получаем контуры всех объектов
        const st = this.tolerance
        const tolerance = [st, st, st, st] // Максимальное отклонение пикселей при заливки


        // Необходимо создать запретную зону для floodfill
        this.imageTemp = this.blurredImage.clone()
        let contours, x, y
        for (let i=0; this.allContours.get(i) !== undefined; i++) {  // Итерируемся для каждого объекта
            contours = this.allContours.get(i)
            for (let j=0; j < contours.rows; j+=5) { // Итерируемся для каждой пары координат
                x = contours.data32S[j * 2]  // Нас интересуют только пары координат
                y = contours.data32S[j * 2 + 1]
                this.floodFillMaskTemp = this.singleFloodFill(this.imageTemp, x, y, tolerance)  // Заливка
                cv.bitwise_or(this.floodFillMask, this.floodFillMaskTemp, this.floodFillMask)  // Объединяем с ранее созданными масками
            }
        }

        let floodFillMask3C = new cv.Mat()
        cv.cvtColor(this.floodFillMask, floodFillMask3C, cv.COLOR_GRAY2BGR)
        cv.bitwise_or(this.mask, floodFillMask3C, this.viz) 
        
        // Clear memory
        floodFillMask3C.delete()
        contours.delete()
    }
}

export default FloodFillTool