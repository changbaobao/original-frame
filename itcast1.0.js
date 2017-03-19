(function(global) {
	var document = global.document,
		arr = [],
		push = arr.push,
		slice = arr.slice;

	function itcast(selector) {
		return new itcast.fn.init(selector);
	}

	itcast.fn = itcast.prototype = {
		constructor: itcast,
		length: 0, // 由于itcast对象是伪数组对象，默认length属性值为 0
		toArray: function() {
			return slice.call(this);
		},
		get: function(index) {
			if (index == null) {
				return this.toArray();
			}

			return this[index < 0 ? this.length + index : index];
		},
		eq: function(index) {
			return itcast(this[index < 0 ? this.length + index : index]);
		},
		first: function() {
			return this.eq(0);
		},
		last: function() {
			return this.eq(-1);
		},
		each: function(callback) {
			itcast.each(this, callback);
			return this;
		},
		splice: arr.splice
	};

	var init = itcast.fn.init = function(selector) {
		if (!selector) {
			return this;
		} else if (itcast.isString(selector)) {
			if (itcast.isHTML(selector)) {
				push.apply(this, itcast.parseHTML(selector));
			} else {
				push.apply(this, document.querySelectorAll(selector));
			}
		} else if (itcast.isDOM(selector)) {
			this[0] = selector;
			this.length = 1;
		} else if (itcast.isArrayLike(selector)) {
			push.apply(this, selector);
		} else if (itcast.isFunction(selector)) {
			document.addEventListener('DOMContentLoaded', function() {
				selector();
			});
		}
	};

	init.prototype = itcast.fn;

	itcast.extend = itcast.fn.extend = function() {
		var args = arguments,
			i = 0,
			l = args.length,
			obj,
			k;

		for (; i < l; i++) {
			obj = args[i];
			for (k in obj) {
				if (obj.hasOwnProperty(k)) {
					this[k] = obj[k];
				}
			}
		}

		return this;
	};

	itcast.extend({
		each: function(obj, callback) {
			var i = 0,
				l;
			// 1 如果obj为数组或伪数组
			if (itcast.isArrayLike(obj)) {
				l = obj.length;
				// 使用for循环遍历数组或伪数组
				for (; i < l; i++) {
					// 执行指定的回调函数callback，改变内this值为 当前遍历到的元素，同时传入 i 和 obj[ i ]
					// 判断回调函数callback的返回值，如果为false结束循环
					if (callback.call(obj[i], i, obj[i]) === false) {
						break;
					}
				}
				// 2 如果obj是普通对象
			} else {
				for (i in obj) {
					if (callback.call(obj[i], i, obj[i]) === false) {
						break;
					}
				}
			}

			return obj;
		},
		type: function(obj) {
			if (obj == null) {
				return obj + '';
			}

			return typeof obj !== 'object' ? typeof obj :
				Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
		},
		parseHTML: function(html) {
			var div = document.createElement('div'),
				node,
				ret = [];

			div.innerHTML = html;

			for (node = div.firstChild; node; node = node.nextSibling) {
				if (node.nodeType === 1) {
					ret.push(node);
				}
			}

			return ret;
		},
		unique: function(arr) {
			// 去重后的新数组
			var ret = [];
			// 遍历原数组arr
			itcast.each(arr, function() {
				// 如果indexOf返回值 为 -1，表示ret不含有当前元素
				if (ret.indexOf(this) === -1) {
					// 那么就添加到ret内
					ret.push(this);
				}
			});
			// 返回结果
			return ret;
		}
	});

	itcast.extend({
		isString: function(obj) {
			return typeof obj === 'string';
		},
		isHTML: function(obj) {
			obj = obj + '';
			return obj[0] === '<' && obj[obj.length - 1] === '>' && obj.length >= 3;
		},
		isDOM: function(obj) {
			return !!obj && !!obj.nodeType;
		},
		isArrayLike: function(obj) {
			var length = !!obj && 'length' in obj && obj.length,
				type = itcast.type(obj);

			if (type === 'function' || itcast.isWindow(obj)) {
				return false;
			}

			return type === 'array' || length === 0 ||
				typeof length === 'number' && length > 0 && (length - 1) in obj;
		},
		isFunction: function(obj) {
			return typeof obj === 'function';
		},
		isWindow: function(obj) {
			return !!obj && obj.window === obj;
		}
	});

	//操作dom
	itcast.fn.extend({
			appendTo: function(target) {
				target = itcast(target);
				var that = this,
					node,
					ret = [];
				target.each(function(i, elem) {
						that.each(function() {
							node = i === 0 ? this : this.cloneNode(true);
							ret.push(node);
							elem.appendChild(node);
						})
					})
					//			实现链式编程
				return itcast(ret);
			},
			append: function(source) {
				source = itcast(source);
				source.appendTo(this);
				return this;
			},
			prependTo: function(target) {
				target = itcast(target);
				var that = this,
					node,
					ret = [],
					firstChild;
				target.each(function(i, elem) {
					firstChild = elem.firstChild;
					that.each(function() {
						node = i == 0 ? this : this.cloneNode(true);
						ret.push(node);
						elem.insertBefore(node, firstChild);
					});
				})
				return itcast(ret);
			},
			prepend: function(source) {
				source = itcast(source);
				source.prependTo(this);
				return this;
			},
			next: function() {
				var ret = [];
				this.each(function(i, elem) {
					var node = elem.nextSibling;
					while (node) {
						if (node.nodeType == 1) {
							ret.push(node);
							break;
						}
						node = node.nextSibling;
					}
					if (elem !== null) {
						ret.push(elem);
					}
				})
				return itcast(ret);
			},
			nextAll: function() {
				var ret = [];
				this.each(function(i, elem) {
					var node = elem.nextSibling;
					while (node) {
						if (node.nodeType == 1) {
							ret.push(node);
						}
						node = node.nextSibling;
					}
				})
				return itcast(itcast.unique(ret));
			},
			remove: function() {
				return this.each(function() {
					this.parentNode.removeChild(this);
				})
			},
			empty: function() {
				return this.each(function() {
					this.innerHTML = '';
				})
			},
			before: function(node) {
				return this.each(function(i, elem) {
					node = itcast(itcast.isString(node) ? document.createTextNode(node) : node);
					node.each(function(j, cur) {
						elem.parentNode.insertBefore(i === 0 ? cur : cur.cloneNode(true), elem);
					})
				})
			},
			after: function(node) {
				return this.each(function(i, elem) {
					nextSibling = elem.nextSibling;
					node = itcast(itcast.isString(node) ? document.createTextNode(node) : node);
					node.each(function(j, cur) {
						elem.parentNode.insertBefore(i === 0 ? cur : cur.cloneNode(true), nextSibling);
					})
				})
			}
		})
		//	操作dom标签
	itcast.fn.extend({
		attr: function(name, value) {
			//			判断传入的参数只穿一个参数时也就是value=undefined
			if (value === undefined) {
				//				name为对象类型时
				if (typeof name === 'object') {
					this.each(function(i, elem) {
						for (var k in name) {
							elem.setAttribute(k, name[k]);
						}
					})
				} else {
					//								name为字符串类型时 判断传入的参数
					return name = this.length == 0 ? undefined : this[0].getAttribute(name);
				}
			} else {
				//				不为undefined时
				this.each(function() {
					this.setAttribute(name, value);
				})
			}
			//			实现链式编程
			return this;
		},
	})

	if (typeof define === 'function') {
		define(function() {
			return itcast;
		});
	} else if (typeof exports !== 'undefined') {
		module.exports = itcast;
	} else {
		global.$ = itcast;
	}
}(window));