/*
Navicat MySQL Data Transfer

Source Server         : ibos
Source Server Version : 50540
Source Host           : localhost:3306
Source Database       : lativ_shop

Target Server Type    : MYSQL
Target Server Version : 50540
File Encoding         : 65001

Date: 2016-08-04 18:12:46
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `class_list`
-- ----------------------------
DROP TABLE IF EXISTS `class_list`;
CREATE TABLE `class_list` (
  `id` int(2) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8 NOT NULL COMMENT '分类名称',
  `rel` varchar(50) CHARACTER SET utf8 NOT NULL COMMENT '别名',
  `href` varchar(255) CHARACTER SET utf8 NOT NULL COMMENT '地址',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=gbk;

-- ----------------------------
-- Records of class_list
-- ----------------------------

-- ----------------------------
-- Table structure for `product_list`
-- ----------------------------
DROP TABLE IF EXISTS `product_list`;
CREATE TABLE `product_list` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `product_id` int(10) NOT NULL COMMENT '产品id',
  `product_name` varchar(50) NOT NULL COMMENT '商品名',
  `price` double(5,2) NOT NULL COMMENT '价格',
  `value` varchar(50) NOT NULL COMMENT '这里包括 颜色、尺寸、数量',
  `discount` double(2,2) DEFAULT NULL COMMENT '折扣',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of product_list
-- ----------------------------
