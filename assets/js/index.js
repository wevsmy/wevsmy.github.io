/*
 * @Author: wilson.wu
 * @Date: 2023-02-07 13:37:10
 * @LastEditors: wilson.wu
 * @LastEditTime: 2023-02-07 13:39:45
 * @FilePath: \blog_source\assets\js\main.js
 * @Description:
 * Contact: wevsmy@gamil.com
 *
 * Copyright (c) 2023 by wilson.wu, All Rights Reserved.
 */
// From main
import { hello } from './libs';
// From the Hugo template.
import * as params from '@params';

var worker = new Worker(params.worker);

worker.addEventListener(
	'message',
	function(e) {
		console.log('Worker said: ', e.data);
	},
	false
);

worker.postMessage('Hello Worker');

window.hello = hello;
window.cwd = process.cwd; // Shim injected
window.params = params;