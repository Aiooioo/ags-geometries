var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/accessorSupport/decorators", "esri/geometry/Point", "esri/geometry/Polygon", "esri/geometry/support/WKIDUnitConversion", "esri/geometry/support/webMercatorUtils", "esri/geometry/support/geodesicUtils"], function (require, exports, decorators_1, Point, Polygon, WKIDUnitConversion, webMercatorUtils, geodesicUtils) {
    "use strict";
    var UNITS = {
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
    var Ellipse = /** @class */ (function (_super) {
        __extends(Ellipse, _super);
        function Ellipse(param) {
            var _this = _super.call(this, param) || this;
            /**
             * 长轴坐标值
             */
            _this.dpx = null;
            /**
             * 半轴长度
             */
            _this.semiminor = 0;
            /**
             * 椭圆圆心
             */
            _this.center = null;
            _this.geodesic = false;
            _this.numberOfPoints = 60;
            _this.radiusUnit = "meters";
            _this.center = param.center;
            _this.dpx = param.dpx;
            _this.semiminor = param.semiminor;
            return _this;
        }
        Ellipse_1 = Ellipse;
        Ellipse.prototype.initialize = function () {
            this.hasZ = this.center && this.center.hasZ;
            if (this.rings.length === 0 && this.center) {
                var size = UNITS[this.radiusUnit];
                var sp = this.center.spatialReference;
                var geoType = 'geographic';
                if (sp.isWebMercator) {
                    geoType = 'webMercator';
                }
                else if (WKIDUnitConversion[sp.wkid] != null || sp.wkt && 0 === sp.wkt.indexOf('PROJCS')) {
                    geoType = 'projected';
                }
                var polygon = void 0;
                if (this.geodesic) {
                    var pt = null;
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
                }
                else {
                    var sz = void 0;
                    if ("webMercator" === geoType || "projected" === geoType) {
                        sz = size / this._convert2Meters(1, this.center.spatialReference);
                    }
                    else {
                        if ("geographic" === geoType) {
                            sz = size / UNITS["decimal-degrees"];
                        }
                    }
                    polygon = this._createPlanarEllipse(this.center, sz, this.numberOfPoints);
                }
                this.spatialReference = polygon.spatialReference;
                this.addRing(polygon.rings[0]);
            }
        };
        Ellipse.prototype._createGeodesicEllipse = function (center, size, numberOfPoints) {
            for (var c = 0, g = Math.PI / 180, e = []; c < 2 * Math.PI;) {
                var f = geodesicUtils.directGeodeticSolver(center.y * g, center.x * g, c, size).toArray();
                this.hasZ && f.push(center.z);
                e.push(f);
                c += Math.PI / (numberOfPoints / 2);
            }
            e.push(e[0]);
            return new Polygon(e);
        };
        Ellipse.prototype._createPlanarEllipse = function (a, b, e) {
            var ax = this.dpx.x - this.center.x;
            var ay = this.dpx.y - this.center.y;
            var aAbs = Math.sqrt(Math.pow(ax, 2) + Math.pow(ay, 2));
            var bAbs = this.semiminor;
            var bx = ay * bAbs / aAbs;
            var by = -ax * bAbs / aAbs;
            for (var c = 0, d = []; c < 2 * Math.PI;) {
                var f = [
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
        };
        Ellipse.prototype._convert2Meters = function (a, sp) {
            var value;
            if (null != WKIDUnitConversion[sp.wkid]) {
                value = WKIDUnitConversion.values[WKIDUnitConversion[sp.wkid]];
            }
            else {
                var wkt = sp.wkt;
                var d = wkt.lastIndexOf(",") + 1;
                var c = wkt.lastIndexOf("]]");
                value = parseFloat(wkt.substring(d, c));
            }
            return a * value;
        };
        Ellipse.prototype.clone = function () {
            return new Ellipse_1({
                rings: this.rings,
                hasZ: this.hasZ,
                hasM: this.hasM,
                spatialReference: this.spatialReference
            });
        };
        __decorate([
            decorators_1.property({ type: Point })
        ], Ellipse.prototype, "dpx", void 0);
        __decorate([
            decorators_1.property({ type: Number })
        ], Ellipse.prototype, "semiminor", void 0);
        __decorate([
            decorators_1.property({ type: Point })
        ], Ellipse.prototype, "center", void 0);
        __decorate([
            decorators_1.property({ type: Boolean })
        ], Ellipse.prototype, "geodesic", void 0);
        __decorate([
            decorators_1.property({ type: Number })
        ], Ellipse.prototype, "numberOfPoints", void 0);
        __decorate([
            decorators_1.property({ type: String })
        ], Ellipse.prototype, "radiusUnit", void 0);
        Ellipse = Ellipse_1 = __decorate([
            decorators_1.subclass("ec.geometry.Ellipse")
        ], Ellipse);
        return Ellipse;
        var Ellipse_1;
    }(decorators_1.declared(Polygon)));
    return Ellipse;
});
//# sourceMappingURL=ellipse.js.map