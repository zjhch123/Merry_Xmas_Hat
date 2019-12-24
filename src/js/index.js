import $ from 'jquery'

const $canvas = $('canvas')
const $fileInput = $('.J_file_input')
const $selectFileBtn = $('.J_upload')
const $resetFileBtn = $('.J_reset')
const $addHat = $('.J_hat')
const $export = $('.J_export')

const $sizeDiv = $('.J_size')
const $sizeRangeInput = $('.J_range')

const $up = $('.J_up')
const $down = $('.J_down')
const $left = $('.J_left')
const $right = $('.J_right')
const $dir = $('.J_dir')
const $rotateCut = $('.J_cut_rotate')
const $rotateAdd = $('.J_add_rotate')
const $revert = $('.J_revert')

const $modalImg = $('.J_modal_img')
const $modal = $('.J_modal')
const $close = $('.J_close')

const ctx = $canvas[0].getContext('2d')

let image = null

let hat = null
let hatAdded = false

const hatOriginalSize = 512

let hatSize = ~~($sizeRangeInput.val())
let hatX = 200
let hatY = 200
let rotate = 0
let isRevert = false

const resetImage = () => {
  ctx.clearRect(0, 0, 1200, 1200)
  image = null
  hatAdded = false
  hatX = 200
  hatY = 200
}

const getHatSize = () => hatOriginalSize * hatSize / 100

const drawImage = () => {
  if (image === null) { window.requestAnimationFrame(drawImage); return }

  ctx.clearRect(0, 0, 1200, 1200)
  ctx.drawImage(image, 0, 0, 1200, 1200)

  if (hatAdded && hat !== null) {
    const hatSize = getHatSize()
    ctx.save()
    ctx.translate(hatX, hatY)
    ctx.scale(isRevert ? -1 : 1, 1)
    ctx.rotate(rotate * Math.PI)
    ctx.drawImage(hat, 0 - hatSize / 2, 0 - hatSize / 2, hatSize, hatSize)
    ctx.restore()
  }

  window.requestAnimationFrame(drawImage)
}

const readImage = (file) => new window.Promise(res => {
  const fr = new FileReader()
  fr.onload = ({ target: { result } }) => {
    const img = new Image()
    img.onload = () => {
      res(img)
    }
    img.src = result
  }
  fr.readAsDataURL(file)
})

const directionManagement = (() => {
  let intervalId = null

  const step = 15
  const rotateStep = 0.05
  const timeInterval = 60

  const prev = () => {
    clearInterval(intervalId)
  }

  return {
    startUp () {
      prev()
      intervalId = setInterval(() => {
        hatY -= step
      }, timeInterval)
    },
    startDown () {
      prev()
      intervalId = setInterval(() => {
        hatY += step
      }, timeInterval)
    },
    startLeft () {
      prev()
      intervalId = setInterval(() => {
        hatX -= step
      }, timeInterval)
    },
    startRight () {
      prev()
      intervalId = setInterval(() => {
        hatX += step
      }, timeInterval)
    },
    startRotateAdd () {
      prev()
      intervalId = setInterval(() => {
        rotate += (rotateStep * (isRevert ? -1 : 1))
      }, timeInterval)
    },
    startRotateCut () {
      prev()
      intervalId = setInterval(() => {
        rotate -= (rotateStep * (isRevert ? -1 : 1))
      }, timeInterval)
    },
    end () {
      clearInterval(intervalId)
    },
  }
})()

const downloadFile = (content) => {
  $modalImg.attr('src', content)
  $modal.show()
}

const listen = () => {
  $selectFileBtn.on('click', () => {
    $fileInput.click()
  })
  $resetFileBtn.on('click', () => {
    resetImage()
  })
  $fileInput.on('change', () => {
    resetImage()
    readImage($fileInput[0].files[0]).then(img => { image = img })
  })
  $addHat.on('click', () => {
    if (hatAdded || image === null) return
    hatAdded = true
  })
  $sizeRangeInput.on('change', () => {
    hatSize = ~~($sizeRangeInput.val())
  })
  $sizeRangeInput.on('touchmove mousemove', () => {
    hatSize = ~~($sizeRangeInput.val())
  })
  $dir.on('touchstart mousedown', (e) => {
    const name = $(e.target).data('name')
    directionManagement[`start${name}`]()
    e.preventDefault()
  })
  $dir.on('touchend mouseup', () => {
    directionManagement.end()
  })
  $revert.on('click', () => {
    isRevert = !isRevert
  })
  $export.on('click', () => {
    downloadFile($canvas[0].toDataURL('image/png'))
  })
  $close.on('click', () => {
    $modal.hide()
  })
}

const resetButtonStatus = () => {
  if (image === null) {
    $sizeDiv.removeClass('f-show')
    $selectFileBtn.removeClass('f-hide')
    $resetFileBtn.addClass('f-hide')
    $addHat.hide()
    $export.hide()
  } else {
    $resetFileBtn.removeClass('f-hide')
    $selectFileBtn.addClass('f-hide')

    if (hatAdded) {
      $sizeDiv.addClass('f-show')
      $addHat.hide()
      $export.show()
    } else {
      $sizeDiv.removeClass('f-show')
      $addHat.show()
      $export.hide()
    }
  }
}

const loopBinding = () => {
  resetButtonStatus()

  window.requestAnimationFrame(loopBinding)
}

const initialHat = () => {
  const hatImageSrc = require('../assets/images/hat.png')
  const hatImage = new Image()

  hatImage.onload = () => {
    hat = hatImage
  }

  hatImage.src = hatImageSrc
}

const start = () => {
  initialHat()
  listen()
  loopBinding()
  drawImage()
}

start()
