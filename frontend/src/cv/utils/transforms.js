import nj from "@d4c/numjs/build/module/numjs.min.js"

export function apply_windowing(image, window_center, window_width, exposureIndex) {
  let img = nj.array(image, "float32")

  let criterion = (x) => true
  let change = (x) => Math.round(x / exposureIndex)
  img = apply_criterion(img, img, criterion, change)

  const img_min = window_center - window_width / 2  // minimum HU level
  criterion = (x) => x < img_min
  change = (x) => img_min
  img = apply_criterion(img, img, criterion, change)  // set img_min for all HU levels less than minimum HU level

  const img_max = window_center + window_width / 2  // minimum HU level
  criterion = (x) => x > img_max
  change = (x) => img_max
  img = apply_criterion(img, img, criterion, change)  // set img_min for all HU levels less than minimum HU level

  img = normalize(img)
  return img
}

export function apply_criterion(array, criterion_array, criterion, change) {
  let new_array = array.tolist()
  for (let i=0; i < new_array.length; i++) {
    if (criterion(criterion_array.get(i))) {
      new_array[i] = change(array.get(i))
    }
  }
  return nj.array(new_array, "uin8")
}

export function normalize(array) {
  const min = array.min()
  const max = array.max()
  let new_array = nj.multiply(nj.divide(nj.add(array, -min), max - min), 255)
  return new_array
}

export function denoise(image, power=13, temp_window_size=7, search_window_size=21) {
    const denoised = cv.fastNlMeansDenoising(image, None, power, temp_window_size, search_window_size)
    return denoised
}

export function remove_small_dots(image, cv2, np) {
    let binary_map = image.copy()
    binary_map = 255 - binary_map  // invert
    let [nlabels, labels, stats] = cv2.connectedComponentsWithStats(binary_map, None, None, None, 8, cv2.CV_32S)
    let areas = stats[stats.slice([1, null], [cv2.CC_STAT_AREA])]
    // let areas = stats[stats[1:, cv2.CC_STAT_AREA]]
    let result = np.zeros(labels.shape, np.uint8)
    for (let i = 0; i < nlabels.length - 1; i++) {
        if (areas[i] <= 10) {
            result = apply_boolean_mask(result, labels, 1, i + 1)
        }
    }

    result = cv2.bitwise_or(result, image)
    return result
}

export function erode(image, kernel_size, np, cv2) {
    const kernel = np.ones(kernel_size, np.uint8)
    const eroded = cv2.erode(image, kernel)
    return eroded
}
