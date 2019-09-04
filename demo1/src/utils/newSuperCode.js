// import './dunkey';
import loadingImg from '../assets/images/loading.png';
import { popupCode } from './newSuperCodeHtml';
import { getElementNode, setStyle, gzip, deleteNode, jsonToParams, deepObjectMerge, deepCopy, getCallbackName, deleteCallBack } from './tool';
import { className, superCode, errorCode } from './config';
import '../assets/css/index.css';

/** 
 * 实例化 new SuperCode(params);
 * 参数params
 * type: String < text | drag > 验证码类型
 * userCancel: Function 用户手动取消
 * onCallBack: Function (data) => {} 完成校验时调用
 * 				参数data: Object { code: Number, message: String }
 * 							code 待定
 * textStyle: Object 点选验证码数字的样式 （紧点选验证码有效）
 * messageStyle: Object 提示消息框样式
 * phone: String 手机号
 * s: String 场景
 * client_ip: String 客户端ip
*/							

;
(function(global) {
	'use strict';
	const apiUrl = 'http://zis-infosec-seraph-service.test.za-tech.net'; // 后台服务器地址
	const getCaptchaApiPath = '/api/v1/captcha.jsonp'; // 获取验证码路径
	const verifyApiPath = '/api/v1/verify.jsonp'; // 验证验证码路径
	const codeList = []; // 存放所有实例化的组件
	const maxPoint = 9; // 点选验证码，最多生成点的个数
	const animationSpeed = 300; // 动画的速度（毫秒）
	const errorMessageShowTime = 2000; // 错误消息展示时间（毫秒）
	const successMessageShowTime = 1000; // 成功消息展示时间（毫秒）
	const initDragBtnLeft = 4; // 拖拽按钮距离父元素左边的距离
	const initBlockLeft = 8; // 拖拽块距离父元素左边的距离
	const endImgBgWidth = 600; // 后台返回背景图片的宽度
	const endImgBgHeight = 346; // 后台返回背景图片的高度
	const endblockImgWidth = 128; // 后台返回拖动块图片的宽度
	const endblockImgHeight = 128; // 后台返回拖动块图片的高度
	let id = 0;	// 每个实例的唯一标示
	let did; // 接口使用，从dunkey获取
	let token; // 接口使用，从dunkey获取
	let that; // 某些时刻保存验证码实例对象
	let isValidate = false; // 是否在验证中

	const defultParams = { // 默认参数
		type: 'text',
		s: undefined,
		phone: undefined,
		clientIp: undefined,
		getPopupContainer: () => document.body,
		onCallback: () => {},
		textStyle: {
			width: 26,
			height: 26,
		},
		messageStyle: {
			height: 28,
		},
	};

	const onLoadDunkey = (fn = () => {}) => { // 获取 did 和 token
		if(dunkey) {
			var host = 'http://test-af.zhongan.io';
			dunkey.run('seraph#test#login', {
				ana:{
					host: host + '/trace.jsonp',
					path: ''
				},
				is_af: true,
			}, function(d, t) {
				did = d;
				token = t;
				fn();
			});
		}
	};

	const getElement = (type, id) => { // 获取验证码的html
		const element = document.createElement('div');
		element.innerHTML = popupCode(type, id);
		return element;
	};
	const superCodeAppendToHtml = (self) => { // 将验证码html代码放页面中
		const { type, id, params } = self;
		params.getPopupContainer().appendChild(getElement(type, id));
	}
	
	const removePoint = (num, data) => { // 删除点选文字
		const target = data.filter((item, index) => index >= num );
		deleteNode(target.map(item => item.node));
		data.splice(num, data.length - num);
	};

	// 重置拖拽时的动画
	const initDragAnimation = (self) => {
		const blockElement = self.get('blockImg');
		const dragBtn = self.get('dragBtn');
		const blockElementClassName = blockElement.className; // 块的class，做动画
		const dragBtnElementClassName = dragBtn.className; // 按钮的class
		blockElement.style.left = initBlockLeft;
		dragBtn.style.left = initDragBtnLeft;

		// 回去时执行动画
		blockElement.className += ' transition';
		dragBtn.className += ' transition';
		setTimeout(() => {
			blockElement.className = blockElementClassName;
			dragBtn.className = dragBtnElementClassName;
			toggleDragBtnPlaceholder(false, self);
		}, animationSpeed);
	};

	// 初始化图片，点选验证码的提示文案图片隐藏，拖拽验证码的扣出块图片隐藏，背景图片更新为loading图
	const initImg = (self) => {
		const { id, type } = self;
		self.get('imgBg').src = loadingImg;
		if (type === superCode[0].key) {
			self.get('blockImg').style.display = 'none';
		} else {
			self.get('textImg').style.display = 'none';
		}
	}

	const toggleSuccessMessage = (bool, self) => {
		const { id } = self;
		const successMessageElement = self.get('successMessage');
		if (bool) {
			successMessageElement.className += ` ${className.show}`;
		} else {
			successMessageElement.className = `${className.successMessage} js-${className.successMessage}-${self.id}`;
		}
	};

	const toggleErrorMessage = (bool, self) => {
		const { id } = self;
		const errorMessageElement = self.get('errorMessage');
		if (bool) {
			setStyle(errorMessageElement, self.params.messageStyle);
		} else {
			errorMessageElement.style.height = 0;
		}
	};

	const toggleContainerAnimation = (bool, self) => {
		const { id } = self;
		const containerElement = self.get('container');
		if (bool) {
			containerElement.className += ` ${className.waggle}`;
		} else {
			containerElement.className = `${className.container} js-${className.container}-${self.id}`;
		}
	};

	const toggleDragBtnPlaceholder = (bool, self) => {
		const { id } = self;
		const containerElement = self.get('dragWrap');
		if (bool) {
			containerElement.className += ` ${className.dragWrap}-dragging`;
		} else {
			containerElement.className = `${className.dragWrap} js-${className.dragWrap}-${self.id}`;
		}
	}

	 // 初始化数据，成功、失败提示文案隐藏，重置拖拽数据，重置点选数据
	const initData = (self) => {
		const { type, pointData } = self;
		if (type === superCode[0].key) {
			self.coordinateList = []; // 清空坐标数据
			initDragAnimation(self); // 重置拖拽时的动画
		} else if (type === superCode[1].key) {
			removePoint(0, pointData);
		}
		toggleSuccessMessage(false, self);
		toggleErrorMessage(false, self);
	};

	// 刷新验证码：更新图片的样式，初始化数据，获取新数据，清空错误次数
	const reload = (self) => {
		initImg(self);
		initData(self);
		getToken(self);
		self.errorTimes = 0;
	};

	// 验证成功
	const success = (self) => {
		toggleSuccessMessage(true, self);
		self.errorTimes = 0; // 清楚错误次数

		// 动画
		setTimeout(() => {
			// 隐藏验证码
			self.__proto__.hide(self);

			setTimeout(() => {
				// 初始化数据
				initData(self);
				isValidate = false;
			}, animationSpeed)
		}, successMessageShowTime);
	};

	const error = (self, isReload) => {  // 验证失败
		const { id, type } = self;
		toggleErrorMessage(true, self); // 显示错误信息
		toggleContainerAnimation(true, self); // 执行晃动效果
		self.errorTimes += 1; // 记录错误次数
		setTimeout(() => {
			toggleContainerAnimation(false, self);
		}, animationSpeed);
		setTimeout(() => {
			// 初始化数据
			if (isReload) {
				reload(self);
			} else {
				initData(self);
			}
			isValidate = false;
		}, errorMessageShowTime);
	};

	const getPointTextElement = (e, self) => {
		const num = self.pointData.length + 1;
		const { textStyle } = self.params;
		const pointSizeW = textStyle.width;
		const pointSizeH = textStyle.height;
		const left = e.offsetX - pointSizeW / 2; // 定位点的left
		const top = e.offsetY - pointSizeH / 2; // 定位点的top
		const point = document.createElement('div');
		point.className = className.point;
		point.innerHTML = num;
		const style = {
			top,
			left,
			opacity: 1,
			...textStyle,
		};
		setStyle(point, style);
		return point;
	};

	const recordTextData = (e, element, self) => {
		const data = { // 记录该组数据
			x: e.offsetX,
			y: e.offsetY,
			num: self.pointData.length,
			node: element,
			time: new Date().getTime(),
		}
		self.pointData.push(data);
	};

	const pointElementAppendToHtml = (e, self) => {
		const element = getPointTextElement(e, self); // 获取要添加到页面的数字的节点
		self.get('textMain').appendChild(element); // 添加到html
		recordTextData(e, element, self); // 记录数据
	};

	const getImgScale = () => {
		const imgContainerWidth = that.get('textMain').clientWidth;
		return imgContainerWidth / endImgBgWidth;
	};

	const uploadNodeData = ({ type, top_hint, butt_hint, cr, top_hint2, bimg, fimg, num }) => {
		const { id } = that;
		
		that.get('tipsText').innerHTML = cr;
		that.get('imgBg').src = `data:image/png;base64,${bimg}`;
		if (type === superCode[0].key) {
			const scale = getImgScale(); // 获取缩放比例
			const blockImgWidth = endblockImgWidth * scale;
			const blockImgHeight = endblockImgHeight * scale;
			const img = that.get('blockImg');
			that.get('dragPlaceholder').innerHTML = butt_hint;
			that.get('dragTitle').innerHTML = top_hint;
			setStyle(img, {
				display: 'block',
				top: num * scale,
				width: `${blockImgWidth}px`,
				height: `${blockImgHeight}px`,
			})
			img.src = `data:image/png;base64,${fimg}`;
			that.scale = scale;
		} else if (type === superCode[1].key) {
			const img = that.get('textImg');
			img.style.display = 'block';
			that.get('textTitle').innerHTML = `${top_hint2.replace('依次', '<em class="super-code-lib-green">依次</em>')}:`;
			img.src = `data:image/png;base64,${fimg}`;
			that.allowPoint = num;
		}
	};

	const loadCallback = (result) => {
		const { type } = that;
		const { label, data } = result;
		const { top_hint, butt_hint, cr, top_hint2 } = label;
		const { bimg, fimg, num } = data.params;
		uploadNodeData({ type, top_hint, butt_hint, cr, top_hint2, bimg, fimg, num });
		deleteCallBack(that.callbackName);
	};

	const getData = (self, callback) => {
		const { s, phone, clientIp} = self.params;
		const callbackName = getCallbackName(callback); // jsonp请求结束要执行的回调函数名
		self.callbackName = callbackName; // 记录 callbackName，使用后删除，防止函数过多
		const data = {
			callback: callbackName,
			d: gzip({
				did,
				token,
				s,
				type: superCode.find(item => item.key === self.params.type).value,
				phone,
				client_ip: clientIp,
			}, callbackName),
			dt: 'dt',
		};
		return data;
	};

	// jsonp 请求，向页面插入一个 script 标签，链接为后台的地址，后台会生成js，执行参数中的回调函数，插入之后立即删除，防止污染
	const sendRequest = (src) => {
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = src;
		document.head.appendChild(script);
		document.head.removeChild(script);
	};

	const sendJsonp = ({self, path, data }) => { // 发送 jsonp 请求
		const urlParams = jsonToParams(data); // 将 json 数据转化为 get 请求的查询格式
		sendRequest(`${apiUrl}${path}?${urlParams}`); // 发送 jsonp 格式的请求
		that = self; // 用 that 变量记录当前的实例对象，供执行回调函数时使用
	};

	const getToken = (self) => {
		onLoadDunkey(() => sendJsonp({ self, data: getData(self, loadCallback), path: getCaptchaApiPath }));
	};

	// pointData记录的数据为，鼠标在实际显示的图片上点选的位置。传给后台时要传该点在图片中的位置百分比，保留两位小数
	const textCodeHandleData = (self) => {
		const { id, pointData } = self;
		const imgBg = self.get('imgBg'); // 背景图片
		const imgWidth = imgBg.clientWidth;
		const imgHeight = imgBg.clientHeight;
		const data = pointData.map(item => ([ Number((item.x / imgWidth).toFixed(2)), Number((item.y / imgHeight).toFixed(2)) ]));
		return data;
	};

	const dragCodeHandleData = (self) => {
		const { coordinateList, scale } = self;
		const data = coordinateList.map((item, index) => {
			if (index === coordinateList.length - 1) {
				return [ Math.floor((item.x + initBlockLeft) / scale), Math.floor(item.y), item.time ];
			}
			return [ Math.floor(item.x / scale), Math.floor(item.y), item.time ];
		})
		return data;
	};

	// 点选验证码回调函数
	const textSubmitCallback = (r) => {
		const { code, result } = r;
		if (code === 0 && result) {
				success(that); // 执行成功时的动画
		} else {
			const message = errorCode[code].message;
			that.get('errorMessage').innerHTML = message; // 根据接口返回替换错误提示文案
			error(that, code !== 0); // 执行错误时的动画
		}

		deleteCallBack(that.callbackName);
	};

	const dragSubmitCallback = (r) => {
		const { code, result } = r;
		if (code === 0 && result) {
				success(that);
		} else {
			const message = errorCode[code].message;
			that.get('errorMessage').innerHTML = message;
			error(that, code !== 0);
		}
		deleteCallBack(that.callbackName);
	}

	// 向后台提交的数据
	const getSubmitData = (self, data, callback) => {
		const { s } = self.params;
		const callbackName = getCallbackName(callback); // jsonp请求结束要执行的回调函数名
		self.callbackName = callbackName; // 记录 callbackName，使用后删除，防止函数过多
		const target = {
			callback: callbackName,
			d: gzip({
				did,
				token,
				s,
				type: superCode.find(item => item.key === self.params.type).value,
				data,
			}, callbackName),
			dt: 'dt',
		};
		return target;
	};

	// 点选验证码验证
	const textValidate = (self) => {
		isValidate = true; // 标记正在验证
		const data = textCodeHandleData(self); // 获取点选数据
		const submitData = getSubmitData(self, data, textSubmitCallback); // 获取提交数据
		sendJsonp({ self, data: submitData, path: verifyApiPath }); // 发送jsonp
	};

	const dragValidate = (self) => {
		isValidate = true;
		const data = dragCodeHandleData(self);
		
		const submitData = getSubmitData(self, data, dragSubmitCallback);
		sendJsonp({ self, data: submitData, path: verifyApiPath });
	}

	const setNode = (self, list) => {
		list.forEach((item) => {
			const node = getElementNode(className[item], self.id);
			self.set(`${item}`, node);
		});
	};

	const setNodes = (self) => {
		const commonNodes = ['closeBtn', 'reloadBtn', 'wrap', 'errorMessage', 'imgBg', 'textMain', 'tipsText', 'successMessage', 'container'];
		const dragNodes = ['dragBtn', 'blockImg', 'dragWrap', 'dragPlaceholder', 'dragTitle'];
		const textNodes = ['textBtn', 'submit', 'textTitle', 'textImg'];
		if (self.type === superCode[0].key) {
			setNode(self, [].concat(commonNodes, dragNodes));
		} else if (self.type === superCode[1].key) {
			setNode(self, [].concat(commonNodes, textNodes));
		}
	};

	const SuperCode = function(params) {
		const self = this;
		const targetParams = deepObjectMerge(deepCopy(defultParams), params); // 合并参数
		const { type } = targetParams;
		this.id = id; // 区分多个实例
		this.type = type;
		this.errorTimes = 0; // 错误次数
		this.status = 'hidden'; // 实例当前状态
		this.params = targetParams; // 实例参数
		const node = {}; // 存放该实例用到的节点

		// 获取节点
		this.get = (n) => {
			return node[n];
		};

		// 存放节点
		this.set = (n, v) => {
			node[n] = v;
		};

		codeList.push(this); // 将该实例推入数组记录

		superCodeAppendToHtml(this); // 将验证码的html添加到页面中

		setNodes(this); // 设置实例的节点
		
		this.get('closeBtn').addEventListener('click', function() { // 绑定关闭按钮事件
			self.__proto__.hide(self);
		}, false);

		this.get('reloadBtn').addEventListener('click', function() { // 绑定刷新按钮事件
			reload(self);
		}, false);

		if (type === superCode[1].key) { // 点选验证码
			this.pointData = []; // 记录点数据
			this.allowPoint = undefined; // 记录从后台获取该组数据的文字数

			this.get('textMain').addEventListener('click', function(e) { // 绑定点选区域事件
				if (isValidate) return; // 如果在提交过程中不允许点选

				if (e.target.className === className.point) return removePoint(e.target.innerHTML - 1, self.pointData); // 如果点在已有数字上，即视为取消该数字及其之后的数字

				if (self.pointData.length >= (self.allowPoint || maxPoint)) return; // 超过最多允许数字则返回

				pointElementAppendToHtml(e, self); // 将点元素添加到页面，并记录数据
			}, false);
	
			this.get('submit').addEventListener('click', function() { // 绑定提交按钮事件
				if (isValidate) return; // 如果在验证过程中不允许再次提交

				if (self.pointData.length < self.allowPoint) return; // 如果点数小于后台返回的允许数值则不允许提交

				textValidate(self);
			}, false);
		} else if (type === superCode[0].key) { // 拖拽验证码
			const dragBtn = this.get('dragBtn'); // 拖拽按钮
			const blockElement = this.get('blockImg'); // 扣出块
			const dragWrap = this.get('dragWrap');

			let isMouseDown = false; // 判断鼠标是否按下
			this.coordinateList = []; // 记录拖拽过程中的数据


			let left;
			let dragMaxWidth; // 可拖拽的最大宽度

			// 鼠标按下事件，计算鼠标位置，计算最大拖拽宽度，提示文案消失，记录第一个数据
			const start = (e) => {
				if (isValidate) return; // 如果在提交过程中不允许拖拽

				isMouseDown = true;

				const target = e.clientX || e.targetTouches[0].clientX;
				let targetY = e.clientY || e.targetTouches[0].clientY;

				left = target - dragBtn.offsetLeft;

				if (!dragMaxWidth) { // 计算最大拖拽宽度
					const dragWidth = dragWrap.offsetWidth;
					const btnWidth = dragBtn.offsetWidth;
					dragMaxWidth = dragWidth - btnWidth - initDragBtnLeft;
				}

				self.coordinateList.push({ // 记录第一个数据
					x: initDragBtnLeft,
					y: targetY,
					time: new Date().getTime(),
				})

				toggleDragBtnPlaceholder(true, self); // 提示文案消失动画

				document.addEventListener("touchmove", () => e.preventDefault(), { passive: false });
			};

			// 鼠标移动事件，记录移动过程中的数据，移动dom元素
			const move = (e) => {
				if (isValidate || !isMouseDown) return; // 如果在提交过程中或鼠标没有放下时不允许触发事件

				requestAnimationFrame(() => {
					const target = e.clientX || e.targetTouches[0].clientX;
					let targetY = e.clientY || e.targetTouches[0].clientY;
					const time = new Date().getTime();
					let x = target - left;
					if (x < initDragBtnLeft) { // 限制拖拽范围
						x = initDragBtnLeft;
					} else if (x >= dragMaxWidth) {
						x = dragMaxWidth;
					}
					self.coordinateList.push({
						x,
						y: targetY,
						time,
					});
					dragBtn.style.left = x;
					blockElement.style.left = x + initDragBtnLeft;
				});	
			};
			
			// 鼠标松开事件，接口校验
			const end = (e) => {
				if (isValidate || !isMouseDown) return; // 如果在提交过程或者鼠标没有按下时不允许触发end事件

				isMouseDown = false;

				dragValidate(self);

				document.removeEventListener("touchmove", () => e.preventDefault(), { passive: false });
			};

			// 绑定事件并兼容pc
			dragBtn.addEventListener('touchstart', start, false);
			dragBtn.addEventListener("mousedown", start, false);
			dragBtn.addEventListener('touchmove', move, false);
			document.addEventListener("mousemove", move, false);
			dragBtn.addEventListener('touchend', end, false);
			document.addEventListener("mouseup", end, false);
		}

		id++;
	};

	SuperCode.prototype.show = function() {
		if (this.status === 'hidden') {
			this.status = 'show';
			const node = this.get('wrap');
			node.className = `${className.wrap} ${className.show} js-${className.wrap}-${this.id}`;
			initImg(this);
			getToken(this);
		}
	};
	SuperCode.prototype.hide = function(self) {
		const that = self || this; // 内部调用时需要传入 SuperCode 对象
		if (that.status === 'show') {
			that.status = 'hidden';
			const node = self.get('wrap');
			node.className = `${className.wrap} super-code-hidden js-${className.wrap}-${that.id}`;
			setTimeout(() => {
				node.className = `${className.wrap} js-${className.wrap}-${that.id}`;
			}, animationSpeed);
		}
	};
	global.SuperCode = SuperCode;
})(window);
