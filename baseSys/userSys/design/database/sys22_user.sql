CREATE TABLE `sys22_user`.`user_authority`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `authority_name` varchar(32) NOT NULL COMMENT '权限名称',
  `type` int(2) NOT NULL COMMENT '权限类型',
  `grade` int(2) NOT NULL COMMENT '权限等级',
  `sequence` int(3) NOT NULL COMMENT '序列',
  `authority_remarks` varchar(255) NOT NULL COMMENT '权限备注',
  PRIMARY KEY (`id`)
);

CREATE TABLE `sys22_user`.`user_info`  (
  `uuid` char(32) NOT NULL COMMENT '唯一id',
  `username` varchar(255) NULL COMMENT '用户名',
  `email` varchar(255) NULL COMMENT '电子邮箱',
  `phone` int(11) NULL COMMENT '手机号码',
  `person` varchar(18) NULL COMMENT '身份证',
  `status` int(1) NOT NULL DEFAULT 0 COMMENT '使用状态',
  `createtime` bigint(13) NOT NULL COMMENT '创建时间',
  PRIMARY KEY (`uuid`)
);

CREATE TABLE `sys22_user`.`user_info_other`  (
  `uuid` char(32) NOT NULL COMMENT '用户唯一ID',
  `address` varchar(255) NULL COMMENT '住址',
  `country` varchar(255) NULL COMMENT '国家地区',
  `sex` int(1) NULL COMMENT '性别',
  `birthady` int(8) NULL COMMENT '生日',
  `nickname` varchar(64) NULL COMMENT '昵称',
  `personal` varchar(255) NULL COMMENT '个人简介',
  `slogn` varchar(64) NULL COMMENT '标语',
  `avatar` varchar(64) NULL COMMENT '头像',
  `background` varchar(64) NULL COMMENT '背景',
  `updateTime` bigint(13) NOT NULL COMMENT '修改时间',
  PRIMARY KEY (`uuid`)
);

CREATE TABLE `sys22_user`.`user_login`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `uuid` char(32) NOT NULL COMMENT '用户唯一ID',
  `password` varchar(255) NOT NULL COMMENT '加密密码',
  `createtime` bigint(13) NOT NULL COMMENT '密码创建时间',
  `status` int(1) NOT NULL DEFAULT 0 COMMENT '密码使用状态',
  PRIMARY KEY (`id`)
);

CREATE TABLE `sys22_user`.`user_relation_authority`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `role_id` int NOT NULL COMMENT '角色ID',
  `authority_id` int NOT NULL COMMENT '权限ID',
  PRIMARY KEY (`id`)
);

CREATE TABLE `sys22_user`.`user_relation_role`  (
  `id` int NOT NULL COMMENT '自增ID',
  `uuid` char(32) NOT NULL COMMENT '用户标识',
  `role_id` int NOT NULL DEFAULT 0 COMMENT '角色ID',
  PRIMARY KEY (`id`)
);

CREATE TABLE `sys22_user`.`user_role`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '唯一ID',
  `role_name` varchar(32) NOT NULL COMMENT '角色名称',
  `role_remarks` varchar(255) NOT NULL COMMENT '角色备注',
  PRIMARY KEY (`id`)
);

