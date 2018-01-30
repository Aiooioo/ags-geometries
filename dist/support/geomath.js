define(["require", "exports", "esri/geometry/Point"], function (require, exports, Point) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        /**
         * 根据直线上的两点计算直线的斜率
         * @param {__esri.Point | __esri.PointConstructor} pt1 点1
         * @param {__esri.Point | __esri.PointConstructor} pt2 点2
         */
        getLineAngle: function (pt1, pt2) {
            return Math.atan(Math.abs(pt1.y - pt2.y) / Math.abs(pt1.x - pt2.x));
        },
        /**
         * 根据两点坐标计算两者之间的中心点
         * @param {__esri.Point | __esri.PointConstructor} pt1 点1
         * @param {__esri.Point | __esri.PointConstructor} pt2 点2
         */
        getCenter: function (pt1, pt2) {
            return new Point({
                x: (pt1.x + pt2.x) / 2,
                y: (pt1.y + pt2.y) / 2,
                spatialReference: pt1.spatialReference,
            });
        },
        /**
         * 根据两点坐标计算两者之间的距离
         * @param {__esri.Point | __esri.PointConstructor} pt1 点1
         * @param {__esri.Point | __esri.PointConstructor} pt2 点2
         */
        getDistance: function (pt1, pt2) {
            return Math.sqrt((Math.pow((pt1.x - pt2.x), 2)) + (Math.pow((pt1.y - pt2.y), 2)));
        },
    };
});
//# sourceMappingURL=geomath.js.map