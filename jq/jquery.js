const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const { window } = new JSDOM();
// const { document } = (new JSDOM('')).window;
const {document} = (new JSDOM('<!doctype html><html><body></body></html>')).window;
global.document = document;
// const window = document.defaultView;
global.window = document.defaultView;
global.navigator = global.window.navigator;
const $ = require('jquery')(window);
//初始化jquery相关数据
module.exports = $;


