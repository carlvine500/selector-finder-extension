// 后台服务 worker 可以留空或添加一些全局逻辑
console.log('Extension background script running');

// 如果需要长期运行的任务或者跨页面通信可以在这里实现
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed.');
  });
  