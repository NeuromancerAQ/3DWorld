import * as THREE from 'three'
import './MeshLine'
import stroke from '../../public/img/stroke.png'
import TWEEN from 'tween.js'

function getPos (lon, lat, r) {
  lon = (lon) * Math.PI / 180
  lat = (lat) * Math.PI / 180
  const y = r * Math.sin(lon)
  const temp = r * Math.cos(lon)
  const x = temp * Math.sin(lat)
  const z = temp * Math.cos(lat)
  return new THREE.Vector3(x, y, z)
}

// 初始化线的行动样式
function generatePath (startLonLat, tartgetLonLat) {
  const R = 50
  const startPos = getPos(...startLonLat, R)
  const targetPos = getPos(...tartgetLonLat, R)
  let midPos = new THREE.Vector3().addVectors(startPos, targetPos).multiplyScalar(0.5)
  const midLonLat = [0.5 * (startLonLat[0] + tartgetLonLat[0]), 0.5 * (startLonLat[1] + tartgetLonLat[1])]
  const midLonLatPos = getPos(...midLonLat, R)
  const r = startPos.distanceTo(targetPos) * 0.5
  const between = midLonLatPos.length() - midPos.length()
  const factor = (R + r - between) / midPos.length()
  const { x, y, z } = midPos
  let mid = new THREE.Vector3(x, y, z).multiplyScalar(factor)
  const n = new THREE.CatmullRomCurve3([startPos, mid, targetPos])
  midPos = null
  mid = null
  return n
}

function updateLine (LENGTH, curvePoints, ml) {
  const tween = new TWEEN.Tween({ x: 0 })
  tween.to({ x: 100 + LENGTH }, 3000)
  tween.onUpdate(function () {
    const points = curvePoints
    const length = Math.ceil(this.x)
    const tp = new Float32Array(LENGTH * 3)
    if (length < LENGTH) {
      for (let i = 0; i < LENGTH; i++) {
        const k = i < length ? i : length
        const { x, y, z } = points[k]
        tp[3 * i] = x
        tp[3 * i + 1] = y
        tp[3 * i + 2] = z
      }
    } else if (length < 100) {
      for (let i = 0; i < LENGTH; i++) {
        const k = length - LENGTH + i
        const { x, y, z } = points[k]
        tp[3 * i] = x
        tp[3 * i + 1] = y
        tp[3 * i + 2] = z
      }
    } else {
      for (let i = 0; i < LENGTH; i++) {
        const k = length - LENGTH + i >= 100 ? 100 - 1 : length - LENGTH + i
        const { x, y, z } = points[k]
        tp[3 * i] = x
        tp[3 * i + 1] = y
        tp[3 * i + 2] = z
      }
    }
    ml.setGeometry(tp, (t) => {
      return t
    })
  })
  tween.onComplete((d) => {
    d.x = 0
    tween.start()
  })
  tween.start()
}

export default (d, color) => {
  const LENGTH = 15
  const start = [d.source.position[1], d.source.position[0]]
  const end = [d.target.position[1], d.target.position[0]]
  const latlng = [start, end]
  const curve = generatePath(...latlng)
  const curvePoints = curve.getPoints(100)
  const points = new Float32Array(LENGTH * 3)
  for (const [index, point] of curvePoints.entries()) {
    const { x, y, z } = curvePoints[0]
    points[index * 3] = x
    points[index * 3 + 1] = y
    points[index * 3 + 2] = z
  }
  // 在MeshLine中引入
  const ml = new THREE.MeshLine()
  ml.setGeometry(points, (p) => {
    return p
  })
  const map = new THREE.TextureLoader().load(stroke)
  const mat = new THREE.MeshLineMaterial({
    useMap: true,
    map: map,
    color: new THREE.Color(color),
    opacity: 1,
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    sizeAttenuation: false,
    lineWidth: 7,
    depthTest: true,
    transparent: true
  })
  const mesh = new THREE.Mesh(ml.geometry, mat)
  updateLine(LENGTH, curvePoints, ml)

  return mesh
}
