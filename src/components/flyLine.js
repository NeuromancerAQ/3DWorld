import * as THREE from 'three'
// import { MeshLine, MeshLineMaterial } from 'three.meshline'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import TWEEN from 'tween.js'
export default function createFlyLine (startPoint, endPoint, mid1, mid2) {
  const curveData = new THREE.CubicBezierCurve3(startPoint, mid1, mid2, endPoint)
  const curveModelData = curveData.getPoints(150)
  // const geometry = new THREE.Geometry()
  // geometry.vertices = curveModelData
  // const line = new MeshLine()
  // line.setGeometry(geometry, function (p) { return 0.1 })
  // const material = new MeshLineMaterial({ color: '#D9B42E' })
  // const curve = new THREE.Mesh(line.geometry, material)

  const positions = []
  const colors = []
  const color = new THREE.Color()
  positions.push(curveModelData[1].x, curveModelData[1].y, curveModelData[1].z)
  colors.push(color.r, color.g, color.b)
  const geometry = new LineGeometry()
  geometry.setColors(colors)
  geometry.setPositions(positions)
  const matLine = new LineMaterial({
    color: '#D9B32D',
    linewidth: 2, // in pixels
    vertexColors: true,
    dashed: false
  })

  function updateLine () {
    const tween = new TWEEN.Tween({ x: 1 })
    tween.to({ x: 150 }, 3000)
    tween.onUpdate(function () {
      var endPointIndex = Math.ceil(this.x)
      var curvePartialData = new THREE.CatmullRomCurve3(curveModelData.slice(0, endPointIndex))
      const positions = []
      const colors = []
      const color = new THREE.Color()
      var n = curvePartialData.getPoints(150)
      for (var i = 0; i < n.length; i++) {
        positions.push(n[i].x, n[i].y, n[i].z)
        colors.push(color.r, color.g, color.b)
      }
      geometry.setColors(colors)
      geometry.setPositions(positions)
    })
    tween.onComplete((d) => {
      d.x = 150
      // tween.start()
    })
    tween.start()
  }
  updateLine()
  const curve = new Line2(geometry, matLine)
  curve.computeLineDistances()
  curve.scale.set(1, 1, 1)
  matLine.resolution.set(window.innerWidth, window.innerHeight) // 该属性必需设置

  return {
    curve: curve,
    curveData: curveData
  }
}
