var Sync = function() {
    this._obs = [];
    this._args = [];
    this.focus = 0;
    this.break = false; //中断运行
};



Sync.prototype = {
    constructor: Sync,
    syncClear: function() {
        this._obs = [];
        this._args = [];
    },
    setArg: function(opt) { //opt:{item:0,arg:[xx],insert:append}
        //即使全部一样设置，也能做到特殊性
        var item = opt.item,
            arg = opt.arg,
            insert = opt.insert;
        var args = this._args;
        var obs = this._obs;
        if (typeof item === "number") {
            if (!args[item]) {
                args[item] = [];
            }
            if (insert === "append") {
                args[item] = args[item].concat(arg);
            } else {
                args[item] = arg;
            }
        } else {
            obs.forEach(function(f, ind) {
                var targ = args[ind];
                if (!targ) {
                    args[ind] = [];
                }
                if (insert === "append") {
                    args[ind] = args[ind].concat(arg);
                } else {
                    args[ind] = arg;
                }
            })
        }
    },
    go: function(startNo) { //里面传入参数,这个arg要为数组。而后面next的内容可以随便
        var obs = this._obs;
        this.length = obs.length;
        this.break = false;
        //新生成一个对象
        var f = function() {};
        f.prototype = this;
        var nowThis = new f();

        var nowFocus = startNo === undefined ? 0 : startNo - 1;
        nowThis.focus = nowFocus;
        nowThis.collectData = [];
        var args = nowThis._args = [].concat(this._args);

        var fun = obs[nowFocus];
        var arg = args[nowFocus];
        fun.apply(nowThis, arg);
        nowThis.focus += 1;
        return nowThis;
    },
    get: function(fun) {
        var obs = this._obs;
        obs.push(fun);
        return this;
    },
    // 包裹函数内部要有next
    next: function() { //传入的参数优先级更高，其次才是_arg
        if (this.break === true) {
            return;
        }
        var arg = Array.prototype.slice.call(arguments, 0);
        var focus = this.focus;

        if (arg.length === 0) {
            arg = this._args[focus];
        }
        var obs = this._obs;
        var lg = this.length;
        var data = this.collectData;
        this.focus += 1;
        data.push(arg);
        if (focus >= lg) {
            this.focus = 0;
            if (this._endfun) {
                this._endfun.apply(null, data);
            }
        } else { //如果这里继续运行的，会在这里形成，，，等待递归，this.focus必须在前面
            obs[focus].apply(this, arg);
            // (this._obs.shift()).apply(this,arg);

        }
    },
    setEndCallback: function(fun) {
        if (typeof fun !== "function") {
            return false;
        }
        this._endfun = fun;
    }
};


exports.sync = Sync;



var Collect = function(lg) {
    this.runFun = null;
    this._args = [];
    this.focus = 0;
    this.length = lg;
};

Collect.prototype = {
    constructor: Collect,
    get: function(fun, cover) { //cover表示是否应该覆盖前面的function
        if (cover === true) {
            this.runFun = fun;
        } else {
            if (this.runFun === null) {
                this.runFun = fun;
            } else {
                if (typeof this.runFun === "function") {
                    this.runFun = [this.runFun];
                }
                this.runFun.push(fun);
            }
        }
        // this.runFun=fun;
        return this;
    },
    setLength: function(no) {
        if (typeof no !== "number") {
            return;
        }
        this.length = no;
    },
    setArg: function(opt) { //opt:{item:0,arg:[xx],insert:append}
        //由于不知道长度，那么在对全部用一个内容的情况下，使用特殊结构表示全部
        //全部一样设置，做不到特殊性
        var item = opt.item,
            arg = opt.arg,
            insert = opt.insert;
        var args = this._args;
        var lg = this.length;
        if (typeof item === "number") {
            if (!args[item]) {
                args[item] = [];
            }
            if (insert === "append") {
                args[item] = args[item].concat(arg);
            } else {
                args[item] = arg;
            }
        } else {
            var ind = 0;
            for (; ind <= lg - 1; ind += 1) {
                var targ = args[ind];
                if (!targ) {
                    args[ind] = [];
                }
                if (insert === "append") {
                    args[ind] = args[ind].concat(arg);
                } else {
                    args[ind] = arg;
                }
            }
        }
    },
    go: function() { //no表示运行多少次，默认为this传入的
        var runFun = this.runFun; //运行的唯一函数
        var ts = this;
        var args = this._args;
        var f = function() {};
        f.prototype = ts;
        var newTs = new f();
        newTs.focus = 0;
        newTs.collectData = []; //收集被收集的数据
        var i = 0;
        //得到运行的长度
        var lg = newTs.length = ts.length; //得到真的长度,但是不会同步其他运行的
        var temp = null;
        var mul = false;
        if (typeof runFun !== "function") {
            mul = true;
        } //表示是数组多个函数
        var tempFun = null;
        for (; i < lg; i += 1) { //由于是同步运行多次，那么不存在被打断
            if (mul === true) {
                tempFun = runFun[i];
            } else {
                tempFun = runFun;
            }
            tempFun.apply(newTs, args[i]);
        }
        return newTs;
    },
    collect: function() { //参数一定是想跟位置传入
        var arg = Array.prototype.slice.call(arguments, 0);
        var lg = this.length;
        //焦点添加一个
        var focus = this.focus += 1; //运行结束添加一个
        var data = this.collectData; //格式为[[xxx],[yyyy]]
        // console.log(focus)
        data.push(arg);
        if (focus >= lg) { //如果超过长度
            this._endfun(data);
        }
    },
    setEndCallback: function(fun) {
        if (typeof fun !== "function") {
            return false;
        }
        this._endfun = fun;
        return this;
    }
}

exports.collect = Collect;