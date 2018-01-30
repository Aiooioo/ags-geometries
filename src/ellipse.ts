import * as __extends from "esri/core/tsSupport/declareExtendsHelper";
import * as __decorate from "esri/core/tsSupport/decorateHelper";

import { declared, subclass, property } from "esri/core/accessorSupport/decorators";

import * as Point from "esri/geometry/Point";
import * as Polygon from "esri/geometry/Polygon";
import * as SpatialReference from "esri/geometry/SpatialReference";

import * as WKIDUnitConversion from "esri/geometry/support/WKIDUnitConversion";
import * as webMercatorUtils from "esri/geometry/support/webMercatorUtils";
import * as geodesicUtils from "esri/geometry/support/geodesicUtils";

import DrawGeoMath from "./support/geomath";

const UNITS = {
  centimeters: .01,
  decimeters: .1,
  feet: .3048,
  inches: .0254,
  kilometers: 1E3,
  meters: 1,
  miles: 1609.344,
  millimeters: .001,
  "nautical-miles": 1852,
  yards: .9144,
  "decimal-degrees": 111320
};

@subclass("ec.geometry.Ellipse")
class Ellipse extends declared(Polygon) {

  /**
   * 长轴坐标值
   */
  @property({ type: Point })
  dpx: Point = null;

  /**
   * 半轴长度
   */
  @property({ type: Number })
  semiminor: number = 0;

  /**
   * 椭圆圆心
   */
  @property({ type: Point })
  center: Point = null;

  @property({ type: Boolean })
  geodesic: boolean = false;

  @property({ type: Number })
  numberOfPoints: number = 60;

  @property({ type: String })
  radiusUnit: string = "meters";

  constructor(param?: any) {
    super(param);

    this.center = param.center;
    this.dpx = param.dpx;
    this.semiminor = param.semiminor;
  }

  initialize() {
    this.hasZ = this.center && this.center.hasZ;
    if (this.rings.length === 0 && this.center) {
      const size = UNITS[this.radiusUnit];
      const sp = this.center.spatialReference;
      let geoType = 'geographic';
      if (sp.isWebMercator) {
        geoType = 'webMercator';
      } else if (WKIDUnitConversion[sp.wkid] != null || sp.wkt && 0 === sp.wkt.indexOf('PROJCS')) {
        geoType = 'projected';
      }

      let polygon: Polygon;
      if (this.geodesic) {
        let pt = null;
        switch (geoType) {
          case 'webMercator':
            pt = webMercatorUtils.webMercatorToGeographic(this.center);
            break;
          case 'projected':
            console.error("Creating a geodesic ellipse requires the center to be specified in web mercator or geographic coordinate system");
            break;
          case 'geographic':
            pt = this.center;
            break;
          default:
            break;
        }
        polygon = this._createGeodesicEllipse(pt, size, this.numberOfPoints);
        if (geoType === 'webMercator') {
          polygon = webMercatorUtils.geographicToWebMercator(polygon);
        }
      } else {
        let sz;
        if ("webMercator" === geoType || "projected" === geoType) {
          sz = size / this._convert2Meters(1, this.center.spatialReference);
        } else {
          if ("geographic" === geoType) {
            sz = size / UNITS["decimal-degrees"];
          }
        }
        polygon = this._createPlanarEllipse(this.center, sz, this.numberOfPoints);
      }
      this.spatialReference = polygon.spatialReference;
      this.addRing(polygon.rings[0]);
    }
  }

  private _createGeodesicEllipse(center: Point, size: number, numberOfPoints: number): Polygon {
    for (var c = 0, g = Math.PI / 180, e = []; c < 2 * Math.PI;) {
      var f = geodesicUtils.directGeodeticSolver(center.y * g, center.x * g, c, size).toArray();
      this.hasZ && f.push(center.z);
      e.push(f);
      c += Math.PI / (numberOfPoints / 2);
    }
    e.push(e[0]);
    return new Polygon(e);
  }

  private _createPlanarEllipse(a, b, e): Polygon {
    const ax: number = this.dpx.x - this.center.x;
    const ay: number = this.dpx.y - this.center.y;
    const aAbs: number = Math.sqrt(ax ** 2 + ay ** 2);
    const bAbs: number = this.semiminor;
    const bx: number = ay * bAbs / aAbs;
    const by: number = -ax * bAbs / aAbs;

    for (var c: number = 0, d: Array<any> = []; c < 2 * Math.PI;) {
      var f: Array<number> = [
        a.x + ax * Math.cos(c) * b + bx * Math.sin(c) * b,
        a.y + ay * Math.cos(c) * b + by * Math.sin(c) * b
      ];
      if (this.hasZ) {
        f.push(a.z);
      }

      d.push(f);
      c += Math.PI / (e / 2);
    }
    d.push(d[0]);
    return new Polygon({ spatialReference: a.spatialReference, rings: [d] });
  }

  private _convert2Meters(a, sp: SpatialReference) {
    let value;

    if (null != WKIDUnitConversion[sp.wkid]) {
      value = WKIDUnitConversion.values[WKIDUnitConversion[sp.wkid]];
    } else {
      const wkt = sp.wkt;
      const d = wkt.lastIndexOf(",") + 1;
      const c = wkt.lastIndexOf("]]");
      value = parseFloat(wkt.substring(d, c));
    }
    return a * value;
  }

  clone(): Ellipse {
    return new Ellipse({
      rings: this.rings,
      hasZ: this.hasZ,
      hasM: this.hasM,
      spatialReference: this.spatialReference
    });
  }
}

export = Ellipse;
