'use strict'
var app = angular.module('myApp', ['ngSanitize', 'ngRoute'])
var exe_fn = {}
var sql_app = {}
var ctrl

var initApp = function ($scope, $http, $timeout) {
	ctrl.eMap = {}
	exe_fn = new Exe_fn($http);

	build_request()
	initRandom()
	initConfig()

	ctrl.openUrl = (url) => window.location.href = url;


	ctrl.contains_child_type = (el, type_id) => {
		let r
		if (el && el.children)
			angular.forEach(el.children, (e) => {
				if (type_id == e.reference) {
					r = e
				}
			})
		return r
	}

	readPrincipal($http)
}

function readPrincipal($http) {
	$http.get('/r/principal').then(function (response) {
		if (response.data.principal) {
			ctrl.principal = response.data.principal
		}
		if (response.data.list0) {
			ctrl.principal.user_id = response.data.list0[0].user_id
		}
		// console.log(ctrl.principal, ctrl.principal.name)
	})
}

function build_request($scope) {
	ctrl.request = {};
	ctrl.request.hostname = window.location.hostname
	ctrl.request.path = window.location.pathname.split('.html')[0].split('/').reverse()
	ctrl.request.parameters = {};
	if (window.location.search.split('?')[1]) {
		angular.forEach(window.location.search.split('?')[1].split('&'), function (value, index) {
			var par = value.split("=");
			ctrl.request.parameters[par[0]] = par[1];
		});
	}
}

function getDbConfigHostname() {
	if ('localhost' != ctrl.request.hostname) {
		return ctrl.request.hostname
	} else {
		return ctrl.request.hostname + ':8040'
	}
}


function initRandom() {
	ctrl.random = {}
	ctrl.random.edProtocol = {}
	ctrl.random.edProtocol.diapason = 7
	ctrl.random.home2 = {}
	ctrl.random.home2.diapason = 2

	angular.forEach(ctrl.random, function (v, k) { random_newValue(k) })
}

function random_newValue(name, valueName) {
	if (!valueName) valueName = 'value'
	ctrl.random[name][valueName] = getRandomInt(ctrl.random[name].diapason)
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

sql_app.select_i18n_all = function (left_join_ref, i18n_parent) {
	var sql = "SELECT reference i18n_ref, doc_id i18n_id, value i18n " +
		"FROM (SELECT d2.* FROM doc d1, doc d2 where d2.parent=d1.doc_id and d1.reference=285596) d " +
		"LEFT JOIN string s1 ON s1.string_id=doc_id "
	return sql
}

sql_app.obj_with_i18n = () => {
	//	", s1.value value_1_22, s1.string_id id_1_22, i1.value value_1_23, i1.integer_id id_1_23, f1.value value_1_24, f1.double_id id_1_24 \n" +
	var sql = "SELECT d1.*, dr1.doctype doctype_r \n" +
		", s1.value value_1_22, i1.value value_1_23, f1.value value_1_24 , ts1.value value_1_25, dt1.value value_1_26 \n" +
		", r1.value r1value, r2.value r2value \n" +
		", sort, sort_id, uu.value uuid \n" +
		", i18n, i18n_id, cnt_child FROM doc d1 \n" +
		"LEFT JOIN uuid uu ON d1.doc_id = uu.uuid_id \n" +
		"LEFT JOIN string s1 ON d1.doc_id = s1.string_id \n" +
		"LEFT JOIN integer i1 ON d1.doc_id = i1.integer_id \n" +
		"LEFT JOIN double f1 ON d1.doc_id = f1.double_id \n" +
		"LEFT JOIN timestamp ts1 ON d1.doc_id = ts1.timestamp_id \n" +
		"LEFT JOIN date dt1 ON d1.doc_id = dt1.date_id \n" +
		"LEFT JOIN doc dr1 ON d1.reference = dr1.doc_id \n" +
		"LEFT JOIN string r1 ON d1.reference = r1.string_id \n" +
		"LEFT JOIN string r2 ON d1.reference2 = r2.string_id \n" +
		"LEFT JOIN (" + sql_app.select_i18n_all() + " \n) i18n ON i18n_ref=d1.doc_id \n" +
		"LEFT JOIN sort o1 ON o1.sort_id = d1.doc_id \n" +
		"LEFT JOIN (SELECT COUNT(*) cnt_child, parent FROM doc GROUP BY parent) d2 ON d2.parent=d1.doc_id \n"
	return sql
}
sql_app.SELECT_obj_with_i18n = (doc_id) => {
	var sql = sql_app.obj_with_i18n() +
		"WHERE d1.doc_id = :doc_id "
	sql = sql.replace(':doc_id', doc_id)
	return sql
}

//console.log(sql_app.SELECT_obj_with_i18n(':nextDbId1'))
//console.log(sql_app.SELECT_obj_with_i18n(369574))

sql_app.SELECT_children_with_i18n = (parent_id) => {
	var sql = sql_app.obj_with_i18n() +
		"WHERE d1.parent = :parent " +
		"ORDER BY sort "
	sql = sql.replace(':parent', parent_id)
	//	console.log(sql)
	return sql
}

function Exe_fn($http) {
	this.httpGet = function (progr_am) {
		if (progr_am.error_fn)
			$http
				.get(progr_am.url, { params: progr_am.params })
				.then(progr_am.then_fn, progr_am.error_fn)
		else
			$http
				.get(progr_am.url, { params: progr_am.params })
				.then(progr_am.then_fn)
	}
	this.httpPost = function (progr_am) {
		if (progr_am.error_fn)
			$http.post(progr_am.url, progr_am.data)
				.then(progr_am.then_fn, progr_am.error_fn)
		else
			$http.post(progr_am.url, progr_am.data)
				.then(progr_am.then_fn)
	}
	this.httpGet_j2c_table_db1_params_then_fn = function (params, then_fn) {
		return {
			url: '/r/url_sql_read_db1',
			params: params,
			then_fn: then_fn,
			error_fn: params.error_fn,
		}
	}

}

function initConfig() {

	ctrl.markdownInLine = function (text) {
		if (!text) return
		var t2 = ('' + text)
		var bold = /\u002A\u002A([\wа-яА-Яі\-]+[\s+[\wа-яА-Яі\-]*]*)\u002A\u002A/gmi;
		//		var bold	= /\u002A\u002A([\wа-яА-Яі\-]+\s*[\wа-яА-Яі\-]*)\u002A\u002A/gmi;
		var t2 = t2.replace(bold, '<strong>$1</strong>');
		//		var bold = "\u002A\u002A([\wа-яА-Яі\-]+\s*[\wа-яА-Яі\-]*)\u002A\u002A";
		//		var t2 = (''+text).replace(new RegExp(bold, 'gi'), '<strong>$1</strong>');
		var link = /\[([^`]{1,40})\]\(([^`)]*)\)/gmi
		//			var link	= /\[([^`]*)\]\(([^`)]*)\)/gmi
		var t2 = t2.replace(link, '<a href="$2">$1</a>');
		return t2
	}

	// https://github.com/commonmark/commonmark.js/blob/master/dist/commonmark.js
	//	/[!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E42\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC9\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDF3C-\uDF3E]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]/

	ctrl.highlight = function (text, search) {
		if (!text) return
		if (!search) return text;
		return ('' + text).replace(new RegExp(search, 'gi'), '<span class="w3-yellow">$&</span>');
	}

	ctrl.doctype_fa = {
		14: 'far fa-folder',
		17: 'far fa-file',
	}

	ctrl.doctype_short = {
		18: 'o',
		22: 'o',
		23: 'i',
		24: 'f',
		25: 'ts',
		26: 'd',
		29: 'b',
		30: 'uuid',
		32: 's[]',
		35: 'ts[]',
		37: 'o[]',
	}

	ctrl.doctype_content_table_name = {
		22: 'string',
		23: 'integer',
		24: 'double',
		25: 'timestamp',
		26: 'date',
		30: 'uuid',
	}

	ctrl.object_values = function (o) {
		if (o) {
			return Object.values(o)
		}
	}
	ctrl.keys = function (o) {
		if (o) {
			return Object.keys(o)
		}
	}

	ctrl.reload_page = function () { location.reload() }
}

/* 
 * алгоритм перетворення цифри в читабельний набір символів
 * по мінімальному залишку від цілочисленого діленя
 * переведеня 10 в 19 значну систему cyr/lat
*/
var enEqCyr2 = {
	l: [
		'123456789ABCEHKMPTX',
		'1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19',
	],
}
var enEqCyr = {
	l: ['ABCEHKMPTX', '65 66 67 69 72 75 77 80 84 88'],
	concatHumanSymbol: function (p) {
		var r = p.s + (p.r ? p.r : '')
		if (p['i' + (p.i + 1)] && p['i' + (p.i + 1)].s) {
			var ra = this.concatHumanSymbol(p['i' + (p.i + 1)])
			r = ra + r
		}
		return r
	},
	humanSymbol2num: function (s) {
		var sp = s.match(/\w\d*/g)
		console.log(sp)
		var n = 1
		sp.forEach(function (v) {
			var s0 = v.substring(0, 1)
			var s1 = v.substring(1) * 1
			var p = enEqCyr.l[0].split('').indexOf(s0)
			var sn = enEqCyr.l[1].split(' ')[p] * 1
			n = n * sn + s1
			//			console.log(v,s0, s1,p, sn, n)
		})
		return n
	},
	num2humanSymbol: function (p) {
		if (!p.i) p.i = 0
		p.r = p.n
		enEqCyr.l[1].split(' ').forEach(function (d, k) {
			if (p.n % d < p.r) {
				p.r = p.n % d
				p.k = k
				p.s = enEqCyr.l[0].substring(k, k + 1)
			}
		})
		var d = enEqCyr.l[1].split(' ')[p.k]
		var n = (p.n - p.n % d) / d
		p['i' + (p.i + 1)] = { n: n, i: p.i + 1 }
		if (n > 64) enEqCyr.num2humanSymbol(p['i' + (p.i + 1)])
		if (p.i == 0) return enEqCyr.concatHumanSymbol(p)
	},
}
