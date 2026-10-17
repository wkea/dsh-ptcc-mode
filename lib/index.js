/**
 * 宿主根入口:本包作为客户端插件名册的载体(浏览器端组件见 lib/client.js),
 * 自身不注册任何工具 —— Interaction 工具只在 preset-ptc-c 的插件列表里注册,
 * 因此仅 PTC-C 模式的会话可用。
 */
export const inject = [];
export function apply() {}
