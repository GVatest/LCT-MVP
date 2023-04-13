export function isPointInPolygon(point, vs) {
    let x = point.x
    let y = point.y
    let inside = false
    for (let i=0, j=vs.length - 1; i < vs.length; j=i++) {
        let xi = vs[i].x
        let yi = vs[i].y
        let xj = vs[j].x
        let yj = vs[j].y
        let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
        if (intersect) {
            inside = !inside
        }
    }
    return inside
}

export function distanceBetweenPoints(p1, p2, spacing=[1, 1]) {
    return (((p1.x - p2.x) * spacing[1]) ** 2 + ((p1.y - p2.y) * spacing[0]) ** 2) ** 0.5
}