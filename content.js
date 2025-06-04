// 动态加载 finder.min.js 到页面上下文
const script = document.createElement('script');
script.src = chrome.runtime.getURL('finder.min.js');
(document.head || document.documentElement).appendChild(script);

// 等待 finder 加载完成
script.onload = function () {
  console.log('Finder library loaded');
  
  // 创建悬浮提示框
  const tooltip = createTooltip();
  
  let hoverTimeout;
  let isCtrlPressed = false;
  
  // 监听 Ctrl 键按下和释放事件
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Control') {
      isCtrlPressed = true;
    }
  });
  
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Control') {
      isCtrlPressed = false;
      hideTooltip(tooltip);
    }
  });
  
  // 鼠标移动监听器
  document.addEventListener('mouseover', (event) => {
    const target = event.target;
    
    if (isCtrlPressed) {
      clearTimeout(hoverTimeout);
      
      // 使用 debounce 防止频繁更新
      hoverTimeout = setTimeout(() => {
        showTooltip(target, tooltip);
      }, 100);
    }
  });
  
  // 点击事件监听器
  document.addEventListener('click', (event) => {
    if (isCtrlPressed && event.target !== document.body && event.target !== document.documentElement) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
  document.addEventListener('keydown', (event) => {
    // 检查是否按下 Control + C 并且 tooltip 是可见的
    if (isCtrlPressed && event.key === 'c' && tooltip.style.display !== 'none') {
      event.preventDefault(); // 阻止默认行为（如浏览器复制）
  
      const textToCopy = tooltip.textContent;
      console.info("shortest selector is : "+textToCopy);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showCopySuccessMessage(tooltip,textToCopy);
          // console.info('选择器已复制到剪贴板！');
        }).catch(err => {
          console.info('复制失败:', err);
        });
      } else {
        // 降级使用 document.execCommand（适用于旧浏览器）
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          // console.info('选择器已复制到剪贴板！');
          showCopySuccessMessage(tooltip,textToCopy);
        } catch (err) {
          console.error("复制失败,",err);
        }
        document.body.removeChild(textArea);
      }
      
    }
  });
  
};

// 创建提示框元素
function createTooltip() {
  const tooltip = document.createElement('div');
  tooltip.style.cssText = `
    position: fixed;
    z-index: 99999;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    pointer-events: none;
    font-size: 14px;
    max-width: 400px;
    overflow-wrap: break-word;
    white-space: pre-wrap;
  `;
  document.body.appendChild(tooltip);
  return tooltip;
}

// 显示提示框
// 创建提示框元素
function createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
      position: fixed;
      z-index: 99999;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      pointer-events: none;
      font-size: 14px;
      max-width: 400px;
      overflow-wrap: break-word;
      white-space: pre-wrap;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;
  
    // 将按钮添加到 tooltip 中
    tooltip.innerHTML = ''; // 清空原有内容
    tooltip.appendChild(document.createTextNode('\u00A0')); // 占位符，防止宽度塌陷
    // tooltip.appendChild(copyButton);
  
    document.body.appendChild(tooltip);
    return tooltip;
  }
// 显示提示框
function showTooltip(element, tooltip) {
    const rect = element.getBoundingClientRect();
    const options = {
      root: document.body,
      timeout: 5000,
      shadowSelector: null
    };
    
    // 使用 Finder 生成最短选择器
    // const selector = window.finder.generate(element, options);
    const selector = finder(element, options);
    // 设置提示框内容和位置
    tooltip.textContent = selector;
    
    // 计算合适的位置，确保不超出视口范围
    let x = rect.left + window.scrollX;
    let y = rect.top + window.scrollY;
    
    // 如果在窗口底部，显示在元素上方
    if (y + rect.height + tooltip.offsetHeight > window.innerHeight) {
      y = y - tooltip.offsetHeight;
    } else {
      y = y + rect.height;
    }
    
    // 如果在窗口右侧，向左对齐
    if (x + tooltip.offsetWidth > window.innerWidth) {
      x = x - tooltip.offsetWidth + rect.width;
    }
    
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.display = 'block';
  }
  
  // 隐藏提示框
  function hideTooltip(tooltip) {
    tooltip.style.display = 'none';
  }


  function showCopySuccessMessage(element,shortSelector) {
    // 移除已有的提示框
    const existingEl = document.getElementById('copy-success-message');
    if (existingEl) {
      existingEl.remove();
    }
  
    // 创建提示框元素
    const tooltip = document.createElement('div');
    tooltip.id = 'copy-success-message';
    tooltip.textContent = 'copy success: '+shortSelector;
    // 元素在视口中的位置
    const rect = element.getBoundingClientRect();

    // 提示框显示在鼠标指针附近，而非元素周围
    const x = rect.left;
    const y = rect.top ;

    tooltip.style.cssText = `
      position: fixed;
      z-index: 99999;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      pointer-events: none;
      font-size: 14px;
      max-width: 200px;
      overflow-wrap: break-word;
      left: ${x + 10}px;
      top: ${y+10}px;
      animation: fadeOut 1s forwards;
    `;
  
    // 添加提示框到页面
    document.body.appendChild(tooltip);
  
    // 设置定时器移除提示框
    setTimeout(() => {
      tooltip.remove();
    }, 1500); // 显示1.5秒后消失
  }
  