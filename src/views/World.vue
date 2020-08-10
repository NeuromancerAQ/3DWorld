<template>
  <div>
    <div id="earth"></div>
    <div id="testDiv">
      hhhhhhhhhhhh
    </div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import drawThreeGeo from '../components/threeGeoJSON'
import XRayMaterial from '../components/XRayMaterial'
import createFlyLine from '../components/flyLine'
import bg from '../../public/img/BG.png'
import cloud from '../../public/img/clouds.jpg'
import sPoint from '../../public/img/small-point.png'
// import bPoint from '../../public/img/big-point.png'
import worldGeo from '../../public/data/worldGeo110metre'
import { geoInterpolate } from 'd3-geo'
// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
// import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
// import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
import TWEEN from 'tween.js'
// import flyfly from '../components/flyfly'

let container, camera, scene, renderer, labelRenderer, controls, moonLabel
const radius = 50
// let bloomComposer, finalComposer
// let bloomLayer
// const materials = {}
// const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' })
// const params = {
//   exposure: 1,
//   bloomStrength: 5,
//   bloomThreshold: 0.05,
//   bloomRadius: 0.5
// }
let vIndex = 0
let firstBool = true
let aGroup
let earth
export default {
  name: 'World',
  data () {
    return {
      params: {
        bg: bg
      },
      orbits: [],
      animateDots: [],
      data: {
        nodes: [
          {
            name: '北京',
            position: [116.40, 39.90] // 经度lon，维度lat
          }, {
            name: '沈阳',
            position: [123.43, 41.80]
          }, {
            name: '上海',
            position: [121.47, 31.23]
          }, {
            name: '哈尔滨',
            position: [126.63, 45.75]
          }, {
            name: '纽约',
            position: [-74.0059731, 40.7143528]
          },
          {
            name: '东京',
            position: [139.46, 35.42]
          },
          {
            name: '巴黎',
            position: [2.3511, 48.8032]
          },
          {
            name: '阿姆斯特丹',
            position: [4.89093, 52.3738]
          },
          {
            name: '洛杉矶',
            position: [-118.411, 34.0194]
          },
          {
            name: '芝加哥',
            position: [-87.6828, 41.8379]
          },
          {
            name: '马德里',
            position: [-3.70325, 40.4167]
          },
          {
            name: '鳳凰城',
            position: [-112.088, 33.5722]
          },
          {
            name: '悉尼',
            position: [151.2, -33.8667]
          },
          {
            name: '柏林',
            position: [13.4081, 52.5186]
          },
          {
            name: '罗马',
            position: [12.4942, 41.8905]
          },
          {
            name: '首尔',
            position: [126.978, 37.5657]
          },
          {
            name: '伦敦',
            position: [-0.1275, 51.507222]
          }
        ],
        links: [
          {
            source: {
              name: '北京',
              position: [116.40, 39.90]
            },
            target: {
              name: '上海',
              position: [121.47, 31.23]
            }
          },
          {
            source: {
              name: '柏林',
              position: [13.4081, 52.5186]
            },
            target: {
              name: '悉尼',
              position: [151.2, -33.8667]
            }
          },
          {
            source: {
              name: '伦敦',
              position: [-0.1275, 51.507222]
            },
            target: {
              name: '首尔',
              position: [126.978, 37.5657]
            }
          },
          {
            source: {
              name: '北京',
              position: [116.40, 39.90]
            },
            target: {
              name: '哈尔滨',
              position: [126.63, 45.75]
            }
          },
          {
            source: {
              name: '沈阳',
              position: [123.43, 41.80]
            },
            target: {
              name: '上海',
              position: [121.47, 31.23]
            }
          }
        ]
      },
      timer: '',
      d: []
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.draw()
    })
  },
  methods: {
    draw () {
      container = document.getElementById('earth')
      this.initScene()
      this.initRender()
      this.initCamera()
      this.initControls()
      this.initLight()
      this.pushData()
      this.initModel()
      // this.initComposer()
      this.animate()
      window.onresize = this.onWindowResize
    },
    pushData () {
      const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
      this.timer = window.setInterval(() => {
        const a = randomInteger(0, 16)
        const b = randomInteger(0, 16)
        this.d.push(
          {
            source: this.data.nodes[a],
            target: this.data.nodes[b]
          }
        )
        if (this.d.length > 20) {
          clearInterval(this.timer)
        }
        this.createLine([{
          source: this.data.nodes[a],
          target: this.data.nodes[b]
        }])
      }, 5000)
    },
    initScene () {
      scene = new THREE.Scene()
      // scene.background = new THREE.TextureLoader().load(this.params.bg)
      // scene.fog = new THREE.Fog(0x000000, 110, 410)
    },
    initRender () {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      })
      renderer.setClearAlpha(0)
      // renderer.gammaInput = true
      // renderer.gammaOutput = true
      // renderer.physicallyCorrectLights = true
      // renderer.toneMapping = THREE.ReinhardToneMapping
      // renderer.toneMappingExposure = Math.pow(0.8, 4.0)
      // renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight)
      // renderer.autoClear = false
      container.appendChild(renderer.domElement)

      labelRenderer = new CSS2DRenderer()
      labelRenderer.setSize(window.innerWidth, window.innerHeight)
      labelRenderer.domElement.style.position = 'absolute'
      labelRenderer.domElement.style.top = 0
      container.appendChild(labelRenderer.domElement)
    },
    initCamera () {
      // 相机
      camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
      camera.position.set(0, 50, 110)
      camera.lookAt(0, 0, 0)
      camera.layers.enable(1)
    },
    initLight () {
      const ambientLight = new THREE.AmbientLight('#111111')
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight('#ffffff')
      directionalLight.position.set(-40, 60, -10)
    },
    initControls () {
      controls = new OrbitControls(camera, labelRenderer.domElement)
      controls.target.set(0, 0, 0)
      // 如果使用animate方法时，将此函数删除
      // controls.addEventListener( 'change', render );
      // 使动画循环使用时阻尼或自转 意思是否有惯性
      controls.enableDamping = true
      // 动态阻尼系数 就是鼠标拖拽旋转灵敏度
      controls.dampingFactor = 0.25
      // 是否可以缩放
      controls.enableZoom = true
      // 是否自动旋转
      controls.autoRotate = true
      controls.autoRotateSpeed = 2
      // 设置相机距离原点的最远距离
      controls.minDistance = 20
      // 设置相机距离原点的最远距离
      controls.maxDistance = 10000
      // 是否开启右键拖拽
      controls.enablePan = true
    },
    // initComposer () {
    //   bloomLayer = new THREE.Layers()
    //   bloomLayer.set(1)
    //   var renderScene = new RenderPass(scene, camera)
    //   var bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
    //   bloomPass.threshold = params.bloomThreshold
    //   bloomPass.strength = params.bloomStrength
    //   bloomPass.radius = params.bloomRadius
    //   var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false }
    //   var renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, parameters)
    //   bloomComposer = new EffectComposer(renderer, renderTarget)
    //   bloomComposer.renderToScreen = false
    //   bloomComposer.setSize(window.innerWidth, window.innerHeight)
    //   bloomComposer.addPass(renderScene)
    //   bloomComposer.addPass(bloomPass)
    //
    //   finalComposer = new EffectComposer(renderer)
    //   const shaderPass = createShaderPass(bloomComposer)
    //   const FxaaPass = createFxaaPass()
    //   finalComposer.addPass(renderScene)
    //   finalComposer.addPass(shaderPass)
    //   finalComposer.addPass(FxaaPass)
    //
    //   function createFxaaPass () {
    //     const FxaaPass = new ShaderPass(FXAAShader)
    //     const pixelRatio = renderer.getPixelRatio()
    //     FxaaPass.material.uniforms.resolution.value.x =
    //       1 / (window.innerWidth * pixelRatio)
    //     FxaaPass.material.uniforms.resolution.value.y =
    //       1 / (window.innerHeight * pixelRatio)
    //     FxaaPass.renderToScreen = true
    //     FxaaPass.material.transparent = true
    //     return FxaaPass
    //   }
    //   function createShaderPass (bloomComposer) {
    //     // 着色器材质，自定义shader渲染的材质
    //     const shaderMaterial = new THREE.ShaderMaterial({
    //       uniforms: {
    //         baseTexture: { value: null },
    //         bloomTexture: { value: bloomComposer.renderTarget2.texture } // 辉光贴图属性设置为传入的bloomComposer，这里就说明了为什么bloomComposer不要渲染到屏幕上
    //       },
    //       vertexShader: 'varying vec2 vUv;\n' +
    //           '      void main() {\n' +
    //           '      \tvUv = uv;\n' +
    //           '      \tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n' +
    //           '      }', // 顶点着色器
    //       fragmentShader: ' uniform sampler2D baseTexture;\n' +
    //           '      uniform sampler2D bloomTexture;\n' +
    //           '      varying vec2 vUv;\n' +
    //           '      vec4 getTexture( sampler2D texelToLinearTexture ) {\n' +
    //           '      \treturn mapTexelToLinear( texture2D( texelToLinearTexture , vUv ) );\n' +
    //           '      }\n' +
    //           '      void main() {\n' +
    //           '      \tgl_FragColor = ( getTexture( baseTexture ) + vec4( 1.0 ) * getTexture( bloomTexture ) );\n' +
    //           '      }', // 片元着色器
    //       defines: {}
    //     })
    //     const shaderPass = new ShaderPass(shaderMaterial, 'baseTexture')
    //     shaderPass.needsSwap = true
    //     return shaderPass
    //   }
    // },
    initModel () {
      // 创建地球
      this.createGlobal()
      // 创建外层模
      this.createCloud()
      // 创建圆环
      this.createOrbitas()
      // tooltip
      this.createTooltip()
      // 创建点
      this.createMarker()
      // 创建飞线
      // this.createLine()
    },
    createGlobal () {
      const geometry = new THREE.SphereGeometry(radius, 30, 30)
      const material = new THREE.MeshBasicMaterial({
        color: '#5D5D5D',
        wireframe: true,
        transparent: true,
        opacity: 0.1,
        // 是否影响深度缓存
        depthWrite: true
      })

      earth = new THREE.Mesh(geometry, material)

      drawThreeGeo(worldGeo, radius, 'sphere', {
        color: '#5D5D5D',
        transparent: false,
        depthWrite: true
      }, earth)
      // earth.layers.enable(1)
      scene.add(earth)
    },
    createCloud () {
      var geometry = new THREE.SphereGeometry(1.2 * radius, 65, 45)
      // 创建云层材料
      var material = XRayMaterial({
        map: new THREE.TextureLoader().load(cloud),
        alphaProportion: 0.7,
        color: new THREE.Color('#5D5D5D'),
        opacity: 1,
        gridOffsetSpeed: 0.6,
        depthWrite: true,
        transparent: true
      })
      var clouds = new THREE.Mesh(geometry, material)
      clouds.matrixAutoUpdate = false
      clouds.layers.enable(1)
      scene.add(clouds)
    },
    createOrbitas () {
      for (let e = 0; e < radius; e += 5) {
        const t = new THREE.Vector3(0, e, 0)
        const i = new THREE.Vector3(Math.random() * Math.PI, 0, Math.random() * Math.PI)
        t.y = 0
        const r = this.createRing(t, 1.4 * radius, 0.05 * Math.random() + 0.02, i)
        const n = Math.random() * 0.002 * 2 - 0.002
        const o = Math.random() * 0.002 * 2 - 0.002
        const s = Math.random() * 0.002 * 2 - 0.002
        r._increment = new THREE.Vector3(n, o, s)
        this.orbits.push(r)
      }
    },
    createRing (e, t, a, i, r) {
      const geometry = new THREE.RingGeometry(t, t + a, 64, 1)
      const matrix4 = new THREE.Matrix4()
      r ? matrix4.setPosition(new THREE.Vector3(0, 0, 0.29 * t)) : matrix4.makeRotationX(Math.PI / 2)
      geometry.applyMatrix4(matrix4)
      const material = new THREE.MeshBasicMaterial({
        color: '#5D5D5D',
        side: THREE.DoubleSide,
        transparent: !0,
        opacity: 0.7 * Math.random() + 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: !1
      })
      const ring = new THREE.Mesh(geometry, material)
      ring.rotation.set(i.x, i.y, i.z)
      ring.position.set(i.x, i.y, i.z)
      ring.layers.enable(1)
      scene.add(ring)
      return ring
    },
    createMarker () {
      const textureLoader = new THREE.TextureLoader()
      const texture = textureLoader.load(sPoint)
      const material = new THREE.SpriteMaterial({
        map: texture,
        side: THREE.FrontSide
      })
      const nodes = this.data.nodes
      var testDiv = document.getElementById('testDiv')
      moonLabel = new CSS2DObject(testDiv)
      const group = new THREE.Group()
      for (let i = 0; i < nodes.length; i++) {
        const sprite = new THREE.Sprite(material)
        const xyz = this.getPosition(nodes[i].position[1], nodes[i].position[0], radius + 1)
        sprite.scale.set(1.5, 1.5, 1)
        sprite.position.set(xyz.x, xyz.y, xyz.z)
        group.add(sprite)
      }
      scene.add(group)
      scene.add(moonLabel)
      const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
      setInterval(() => {
        const show = []
        const meshDistance = camera.position.distanceTo(earth.position)
        for (let i = 0; i < nodes.length; i++) {
          const spriteDistance = camera.position.distanceTo(this.getPosition(nodes[i].position[1], nodes[i].position[0], radius))
          if (spriteDistance > meshDistance) {
          } else {
            show.push(this.getPosition(nodes[i].position[1], nodes[i].position[0], radius))
          }
        }
        var temp = randomInteger(0, show.length - 1)
        const xyz = show[temp]
        moonLabel.position.set(xyz.x, xyz.y, xyz.z)
      }, 3000)
    },
    createLine (links) {
      for (let i = 0; i < links.length; i++) {
        const startLat = links[i].source.position[1]
        const startLng = links[i].source.position[0]
        const endLat = links[i].target.position[1]
        const endLng = links[i].target.position[0]
        const start = this.getPosition(startLat, startLng, radius + 1)
        const end = this.getPosition(endLat, endLng, radius + 1)
        const altitude = this.clamp(start.distanceTo(end) * 0.5, 3, radius)
        const interpolate = geoInterpolate([startLng, startLat], [endLng, endLat])
        const midCoord1 = interpolate(0.25)
        const midCoord2 = interpolate(0.75)
        const mid1 = this.getPosition(midCoord1[1], midCoord1[0], radius + altitude)
        const mid2 = this.getPosition(midCoord2[1], midCoord2[0], radius + altitude)
        const fly = createFlyLine(start, end, mid1, mid2)
        // this.animateDots.push(fly.curveData.getPoints(150))
        // this.createLinePoint()
        scene.add(fly.curve)
      }
    },
    createLinePoint () {
      // 线上滑动的小球
      aGroup = new THREE.Group()
      for (var i = 0; i < this.animateDots.length; i++) {
        for (var j = 0; j < 50; j++) {
          var aGeo = new THREE.SphereGeometry(0.4, 10, 10)
          var aMaterial = new THREE.MeshBasicMaterial({
            color: '#D9B32D',
            transparent: true,
            opacity: 1 - j * 0.02
          })
          var aMesh = new THREE.Mesh(aGeo, aMaterial)
          aMesh.layers.enable(1)
          aGroup.add(aMesh)
        }
      }
      scene.add(aGroup)
    },
    animationLine () {
      aGroup.children.forEach((elem, index) => {
        const _index = parseInt(index / 50)
        var index2 = index - 50 * _index
        var _vIndex = 0
        if (firstBool) {
          _vIndex = vIndex - index2 % 50 >= 0 ? vIndex - index2 % 50 : 0
        } else {
          _vIndex = vIndex - index2 % 50 >= 0 ? vIndex - index2 % 50 : 150 + vIndex - index2
        }
        var v = this.animateDots[_index][_vIndex]
        elem.position.set(v.x, v.y, v.z)
      })
      vIndex++
      if (vIndex > 150) {
        vIndex = 0
      }
      if (vIndex === 150 && firstBool) {
        firstBool = false
      }
    },
    createTooltip () {
      console.log(scene)
    },
    clamp (num, min, max) {
      return num <= min ? min : (num >= max ? max : num)
    },
    // 坐标转换
    getPosition (lon, lat, r) {
      lon = (lon) * Math.PI / 180
      lat = (lat) * Math.PI / 180
      const y = r * Math.sin(lon)
      const temp = r * Math.cos(lon)
      const x = temp * Math.sin(lat)
      const z = temp * Math.cos(lat)
      return new THREE.Vector3(
        x, y, z
      )
    },
    clear () {
      THREE.Cache.clear()
      renderer.renderLists.dispose()
      scene.dispose()
    },
    animate () {
      this.clear()
      // this.animationLine()
      TWEEN.update()
      controls.update()
      requestAnimationFrame(this.animate)
      labelRenderer.render(scene, camera)
      renderer.render(scene, camera)

      // renderer.clear()
      // renderer.clearDepth()
      // scene.traverse(this.darkenNonBloomed)
      // bloomComposer.render()
      // scene.traverse(this.restoreMaterial)
      // finalComposer.render()
    },
    // darkenNonBloomed (obj) {
    //   // layer的test方法是判断参数中的图层和自己的图层是否是同一个图层
    //   // 如果obj是几何体，且不在bloomLayer图层，说明不是辉光物体
    //   if ((obj.isMesh || obj.isSprite) && bloomLayer.test(obj.layers) === false) {
    //     // 如果是精灵几何体，需要转成黑色的精灵材质，做特殊处理
    //     if (obj.isSprite) {
    //       materials[obj.uuid] = obj.material // 在materimals变量中保存原先的材质信息
    //       obj.material = new THREE.SpriteMaterial({
    //         color: '#000'
    //       })
    //       // 其他几何体可以转成普通的黑色材质
    //     } else {
    //       materials[obj.uuid] = obj.material // 在materimals变量中保存原先的材质信息
    //       obj.material = darkMaterial
    //     }
    //   }
    // },
    // // 将场景中材质转成黑色的物体还原
    // restoreMaterial (obj) {
    //   if (materials[obj.uuid]) {
    //     obj.material = materials[obj.uuid] // 还原材质
    //     delete materials[obj.uuid] // 内存中删除
    //   }
    // },
    onWindowResize () {
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.render(scene, camera)
    }
  }
}
</script>

<style scoped lang="less">
  #earth {
    width: 100%;
    height: 100%;
    position: absolute;
    background: url("../../public/img/BG.png") no-repeat;
  }

  #testDiv {
    width: 100px;
    height: 50px;
    background: aliceblue;
    border-radius: 4px;
  }
</style>
