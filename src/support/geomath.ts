import * as Point from "esri/geometry/Point";

export default {
  /**
   * 根据直线上的两点计算直线的斜率
   * @param {__esri.Point | __esri.PointConstructor} pt1 点1
   * @param {__esri.Point | __esri.PointConstructor} pt2 点2
   */
  getLineAngle(pt1: __esri.Point, pt2: __esri.Point): number {
    return Math.atan(Math.abs(pt1.y - pt2.y) / Math.abs(pt1.x - pt2.x));
  },


  /**
   * 根据两点坐标计算两者之间的中心点
   * @param {__esri.Point | __esri.PointConstructor} pt1 点1
   * @param {__esri.Point | __esri.PointConstructor} pt2 点2
   */
  getCenter(pt1: __esri.Point, pt2: __esri.Point): Point {
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
  getDistance(pt1: __esri.Point, pt2: __esri.Point): number {
    return Math.sqrt(((pt1.x - pt2.x) ** 2) + ((pt1.y - pt2.y) ** 2));
  },


};
