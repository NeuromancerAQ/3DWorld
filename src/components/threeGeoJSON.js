/* eslint-disable */
/*对下列方法进行过变更，不适用于所有geojson了，主要针对要高亮显示中国的情况，请结合当前的geojson进行使用，要想适用其他的情况，请去github下载原始代码*/
import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
export default function drawThreeGeo (json, radius, shape, materalOptions, container) {
  container = container || window.scene

  var x_values = []
  var y_values = []
  var z_values = []

  var json_geom = createGeometryArray(json)
  var convertCoordinates = getConversionFunctionName(shape)

  var coordinate_array = []

  for (var geom_num = 0; geom_num < json_geom.length; geom_num++) {
    if (json_geom[geom_num].json.type == 'Point') {
      convertCoordinates(json_geom[geom_num].json.coordinates, radius)
      drawParticle(y_values[0], z_values[0], x_values[0], materalOptions)

    } else if (json_geom[geom_num].json.type == 'MultiPoint') {
      for (var point_num = 0; point_num < json_geom[geom_num].json.coordinates.length; point_num++) {
        convertCoordinates(json_geom[geom_num].json.coordinates[point_num], radius)
        drawParticle(y_values[0], z_values[0], x_values[0], materalOptions)
      }

    } else if (json_geom[geom_num].json.type == 'LineString') {
      coordinate_array = createCoordinateArray(json_geom[geom_num].json.coordinates)

      for (var point_num = 0; point_num < coordinate_array.length; point_num++) {
        convertCoordinates(coordinate_array[point_num], radius)
      }
      drawLine(y_values, z_values, x_values, materalOptions)

    } else if (json_geom[geom_num].json.type == 'Polygon') {
      for (var segment_num = 0; segment_num < json_geom[geom_num].json.coordinates.length; segment_num++) {
        coordinate_array = createCoordinateArray(json_geom[geom_num].json.coordinates[segment_num])

        for (var point_num = 0; point_num < coordinate_array.length; point_num++) {
          convertCoordinates(coordinate_array[point_num], radius)
        }
        drawLine(y_values, z_values, x_values, materalOptions)
      }

    } else if (json_geom[geom_num].json.type == 'MultiLineString') {
      for (var segment_num = 0; segment_num < json_geom[geom_num].json.coordinates.length; segment_num++) {
        coordinate_array = createCoordinateArray(json_geom[geom_num].json.coordinates[segment_num])

        for (var point_num = 0; point_num < coordinate_array.length; point_num++) {
          convertCoordinates(coordinate_array[point_num], radius)
        }
        drawLine(y_values, z_values, x_values, materalOptions)
      }

    } else if (json_geom[geom_num].json.type == 'MultiPolygon') {
      for (var polygon_num = 0; polygon_num < json_geom[geom_num].json.coordinates.length; polygon_num++) {
        for (var segment_num = 0; segment_num < json_geom[geom_num].json.coordinates[polygon_num].length; segment_num++) {
          coordinate_array = createCoordinateArray(json_geom[geom_num].json.coordinates[polygon_num][segment_num])

          for (var point_num = 0; point_num < coordinate_array.length; point_num++) {
            convertCoordinates(coordinate_array[point_num], radius)
          }
          drawLine(y_values, z_values, x_values, materalOptions)
        }
      }
    } else {
      throw new Error('The geoJSON is not valid.')
    }
  }

  // 因为一起绘制会被后续的线覆盖，所以需要将china线重新绘制一遍
  for (var geom_num = 0; geom_num < json_geom.length; geom_num++) {
    if (json_geom[geom_num].data.sovereignt == 'China') {
      if (json_geom[geom_num].json.type == 'Polygon') {
        for (var segment_num = 0; segment_num < json_geom[geom_num].json.coordinates.length; segment_num++) {
          coordinate_array = createCoordinateArray(json_geom[geom_num].json.coordinates[segment_num])

          for (var point_num = 0; point_num < coordinate_array.length; point_num++) {
            convertCoordinates(coordinate_array[point_num], radius + 0.5)
          }
          // drawLine(y_values, z_values, x_values, {
          //   color: '#D9B32D',
          //   transparent: false,
          //   depthWrite: true
          // })
          drawLine2(y_values, z_values, x_values)
        }

      } else if (json_geom[geom_num].json.type == 'MultiPolygon') {
        for (var polygon_num = 0; polygon_num < json_geom[geom_num].json.coordinates.length; polygon_num++) {
          for (var segment_num = 0; segment_num < json_geom[geom_num].json.coordinates[polygon_num].length; segment_num++) {
            coordinate_array = createCoordinateArray(json_geom[geom_num].json.coordinates[polygon_num][segment_num])

            for (var point_num = 0; point_num < coordinate_array.length; point_num++) {
              convertCoordinates(coordinate_array[point_num], radius + 0.5)
            }
            // drawLine(y_values, z_values, x_values, {
            //   color: '#D9B32D',
            //   transparent: false,
            //   depthWrite: true
            // })
            drawLine2(y_values, z_values, x_values)
          }
        }
      } else {
        throw new Error('The geoJSON is not valid.')
      }
    }
  }

  function createGeometryArray (json) {
    var geometry_array = []

    if (json.type == 'Feature') {
      geometry_array.push(json.geometry)
    } else if (json.type == 'FeatureCollection') {
      for (var feature_num = 0; feature_num < json.features.length; feature_num++) {
        geometry_array.push({
          data: json.features[feature_num].properties,
          json: json.features[feature_num].geometry
        })
      }
    } else if (json.type == 'GeometryCollection') {
      for (var geom_num = 0; geom_num < json.geometries.length; geom_num++) {
        geometry_array.push(json.geometries[geom_num])
      }
    } else {
      throw new Error('The geoJSON is not valid.')
    }

    return geometry_array
  }

  function getConversionFunctionName (shape) {
    var conversionFunctionName

    if (shape == 'sphere') {
      conversionFunctionName = convertToSphereCoords
    } else if (shape == 'plane') {
      conversionFunctionName = convertToPlaneCoords
    } else {
      throw new Error('The shape that you specified is not valid.')
    }
    return conversionFunctionName
  }

  function createCoordinateArray (feature) {

    var temp_array = []
    var interpolation_array = []

    for (var point_num = 0; point_num < feature.length; point_num++) {
      var point1 = feature[point_num]
      var point2 = feature[point_num - 1]

      if (point_num > 0) {
        if (needsInterpolation(point2, point1)) {
          interpolation_array = [point2, point1]
          interpolation_array = interpolatePoints(interpolation_array)

          for (var inter_point_num = 0; inter_point_num < interpolation_array.length; inter_point_num++) {
            temp_array.push(interpolation_array[inter_point_num])
          }
        } else {
          temp_array.push(point1)
        }
      } else {
        temp_array.push(point1)
      }
    }
    return temp_array
  }

  function needsInterpolation (point2, point1) {

    var lon1 = point1[0]
    var lat1 = point1[1]
    var lon2 = point2[0]
    var lat2 = point2[1]
    var lon_distance = Math.abs(lon1 - lon2)
    var lat_distance = Math.abs(lat1 - lat2)

    if (lon_distance > 5 || lat_distance > 5) {
      return true
    } else {
      return false
    }
  }

  function interpolatePoints (interpolation_array) {
    var temp_array = []
    var point1, point2

    for (var point_num = 0; point_num < interpolation_array.length - 1; point_num++) {
      point1 = interpolation_array[point_num]
      point2 = interpolation_array[point_num + 1]

      if (needsInterpolation(point2, point1)) {
        temp_array.push(point1)
        temp_array.push(getMidpoint(point1, point2))
      } else {
        temp_array.push(point1)
      }
    }

    temp_array.push(interpolation_array[interpolation_array.length - 1])

    if (temp_array.length > interpolation_array.length) {
      temp_array = interpolatePoints(temp_array)
    } else {
      return temp_array
    }
    return temp_array
  }

  function getMidpoint (point1, point2) {
    var midpoint_lon = (point1[0] + point2[0]) / 2
    var midpoint_lat = (point1[1] + point2[1]) / 2
    var midpoint = [midpoint_lon, midpoint_lat]

    return midpoint
  }

  function convertToSphereCoords (coordinates_array, sphere_radius) {
    var lon = coordinates_array[0]
    var lat = coordinates_array[1]

    x_values.push(Math.cos(lat * Math.PI / 180) * Math.cos(lon * Math.PI / 180) * sphere_radius)
    y_values.push(Math.cos(lat * Math.PI / 180) * Math.sin(lon * Math.PI / 180) * sphere_radius)
    z_values.push(Math.sin(lat * Math.PI / 180) * sphere_radius)
  }

  function convertToPlaneCoords (coordinates_array, radius) {
    var lon = coordinates_array[0]
    var lat = coordinates_array[1]

    z_values.push((lat / 180) * radius)
    y_values.push((lon / 180) * radius)
  }

  function drawParticle (x, y, z, options) {
    var particle_geom = new THREE.Geometry()
    particle_geom.vertices.push(new THREE.Vector3(x, y, z))
    var particle_material = new THREE.ParticleSystemMaterial(options)
    var particle = new THREE.ParticleSystem(particle_geom, particle_material)
    container.add(particle)

    clearArrays()
  }

  function drawLine (x_values, y_values, z_values, options) {
    var line_geom = new THREE.Geometry()
    createVertexForEachPoint(line_geom, x_values, y_values, z_values)
    var line_material = new THREE.LineBasicMaterial(options)
    var line = new THREE.Line(line_geom, line_material)
    line.layers.enable(1)
    container.add(line)
    clearArrays()
  }

  function drawLine2 (x_values, y_values, z_values) {
    var positions = []
    var colors = []
    var color = new THREE.Color()
    for (var i = 0; i < x_values.length; i++) {
      positions.push( x_values[i], y_values[i], z_values[i] )
      colors.push(color.r, color.g, color.b)
    }
    var geometry = new LineGeometry()
    geometry.setColors( colors )
    geometry.setPositions( positions );
    var matLine = new LineMaterial( {
      color: '#D9B32D',
      linewidth: 3.5, // in pixels
      vertexColors: true,
      dashed: false
    });
    var line = new Line2( geometry, matLine );
    line.computeLineDistances();
    line.scale.set( 1, 1, 1 );
    line.layers.enable(1)
    container.add(line)
    clearArrays()
    matLine.resolution.set( window.innerWidth, window.innerHeight ) // 该属性必需设置
  }

  function createVertexForEachPoint (object_geometry, values_axis1, values_axis2, values_axis3) {
    for (var i = 0; i < values_axis1.length; i++) {
      object_geometry.vertices.push(new THREE.Vector3(values_axis1[i],
        values_axis2[i], values_axis3[i]))
    }
  }

  function clearArrays () {
    x_values.length = 0
    y_values.length = 0
    z_values.length = 0
  }
}


