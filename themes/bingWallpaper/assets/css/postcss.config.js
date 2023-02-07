/*
 * @Author: wilson.wu
 * @Date: 2022-09-01 15:06:01
 * @LastEditors: wilson.wu
 * @LastEditTime: 2022-09-01 16:57:08
 * @FilePath: \weii-blog-source\themes\webstack\assets\css\postcss.config.js
 * @Description: 
 * Contact: wevsmy@gamil.com
 * 
 * Copyright (c) 2022 by wilson.wu, All Rights Reserved. 
 */
const themeDir = __dirname + '/../../';

module.exports = {
  plugins: [
    require('postcss-import')({
      path: [themeDir]
    }),
    require('tailwindcss')(themeDir + 'assets/css/tailwind.config.js'),
    require('autoprefixer')({
      path: [themeDir]
    })
  ]
}