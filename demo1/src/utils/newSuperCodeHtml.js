import loading from '../assets/images/loading.png';
import refresh from '../assets/images/refresh.png';
import text from '../assets/images/text.png';
import block from '../assets/images/block.png';
import { className } from './config';

export const errorTips = '验证失败，请按提示重新操作';

export const dragCodeHtml = (id) => {
  return `
    <div class="super-code-drag">
      <p class="${className.dragTitle} js-${className.dragTitle}-${id}">拖动下方滑块完成拼图</p>
      <div class="super-code-main super-code-main-drag">
        <div class="${className.textMain} js-${className.textMain}-${id}">
          <img class="${className.imgBg} js-${className.imgBg}-${id}" src="${loading}" alt="图片加载失败请刷新重试">
          <img class="${className.blockImg} js-${className.blockImg}-${id}" src="${block}" alt="">
        </div>
        <div class="${className.errorMessage} js-${className.errorMessage}-${id}">${errorTips}</div>
        <div class="${className.successMessage} js-${className.successMessage}-${id}">
          <i class="super-code-success-icon"></i>
          <p class="super-code-success-text">验证成功，精准无敌了！</p>
        </div>
      </div>
      <div class="${className.dragWrap} js-${className.dragWrap}-${id}">
        <p class="${className.dragPlaceholder} js-${className.dragPlaceholder}-${id}">拖动左边滑块完成上方拼图</p>
        <div class="${className.dragBtn} js-${className.dragBtn}-${id}">
          <div class="super-code-drag-btn-decorate">
            <i class="super-code-drag-btn-decorate-left"></i>
            <i class="super-code-drag-btn-decorate-right"></i>
          </div>
          <div class="super-code-dragging-btn-decorate">
            <i></i>
          </div>
        </div>
      </div>
      <div class="super-code-tips">
        <p class="${className.tipsText} js-${className.tipsText}-${id}">由众安科技提供技术支持</p>
        <img class="${className.reloadBtn} js-${className.reloadBtn}-${id}" src="${refresh}" alt="">
      </div>
      <div class="super-code-text-btn hidden"></div>
    </div>
    <div class="${className.closeBtn} js-${className.closeBtn}-${id}"></div>
  `;
};

export const textCodeHtml = (id) => {
  return `
    <div class="super-code-drag super-code-text">
        <div class="super-code-title">
          <p class="js-${className.textTitle}-${id}">请在下图<em class="super-code-lib-green">依次</em>点击： </p>
          <img class="${className.textImg} js-${className.textImg}-${id}" src="${text}" alt="">
        </div>
        <div class="super-code-main super-code-main-text">
          <div class="${className.textMain} js-${className.textMain}-${id}">
            <img class="${className.imgBg} js-${className.imgBg}-${id}" src="${loading}" alt="图片加载失败请刷新重试">
          </div>
          <div class="${className.errorMessage} js-${className.errorMessage}-${id}">${errorTips}</div>
          <div class="${className.successMessage} js-${className.successMessage}-${id}">
            <i class="super-code-success-icon"></i>
            <p class="super-code-success-text">验证成功，精准无敌了！</p>
          </div>
        </div>
        <div class="super-code-tips">
          <p class="${className.tipsText} js-${className.tipsText}-${id}">由众安科技提供技术支持</p>
          <img class="${className.reloadBtn} js-${className.reloadBtn}-${id}" src="${refresh}" alt="">
        </div>
        <div class="${className.submit} js-${className.submit}-${id}">确定</div>
    </div>
    <div class="${className.closeBtn} js-${className.closeBtn}-${id}"></div>
  `;
};

const htmlContainer = {
  drag: dragCodeHtml,
  text: textCodeHtml,
};

export const popupCode = (type, id) => {
  return `
    <div class="${className.wrap} js-${className.wrap}-${id}">
      <div class="super-code-popup">
        <div class="${className.container} js-${className.container}-${id}">
          ${htmlContainer[type](id)}
        </div>
      </div>
    </div>
  `;
};
