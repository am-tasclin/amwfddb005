var initWF001 = function () {
	console.log('read -> ', 111)

	if (ctrl.request.parameters.p) {
		console.log('read -> ', ctrl.request.parameters.p)
		read_element_descendant(ctrl.request.parameters.p
			, function () {
				ctrl.project = ctrl.eMap[ctrl.request.parameters.p]
				console.log('read -> ', ctrl.project.doc_id)
			}, function (ad, response) {
				console.log(ad.doc_id, ad.reference2)
				if (368817 == ad.reference2) {//ActivityDefinition (   definitionCanonical:369920 .369917)
					readSql({
						ref2: ad.doc_id, //Task.instantiatesCanonical(ActivityDefinition)
						sql: 'SELECT parent FROM doc where reference2=:ref2 and reference=371927',
						afterRead: function (response) {
							angular.forEach(response.data.list, function (task_iC_AD) {
								if (!ad.instantiatesCanonical) ad.instantiatesCanonical = []
								read_element_descendant(task_iC_AD.parent, function () {
									ad.instantiatesCanonical.push(ctrl.eMap[task_iC_AD.parent].doc_id)
								})
							})
						}
					})
				}
			})
	}

	// var  read_invoices_sql = 371989
	// read2_element(read_invoices_sql,{fn:function(response){
	// 	read2_element_children(read_invoices_sql, {fnAfter:function(response){
	// 		var e = ctrl.eMap[read_invoices_sql]
	// 		// console.log(e, e.sql)
	// 	}})
	// }})
}


var read2_element = function (doc_id, fnObj) {
	var o = ctrl.eMap[doc_id]
	if (!o) {
		var sql = sql_app.SELECT_obj_with_i18n(doc_id)
		read2.http.get(read2.url
			, { params: { sql: sql } })
			.then(function (response) {
				var d = response.data.list[0]
				// console.log(d, doc_id)
				ctrl.eMap[d.doc_id] = d
				if (fnObj && fnObj.fn) (
					fnObj.fn(response)
				)
			})
	}
}

var read2_element_children = function (doc_id, fnObj) {
	var o = ctrl.eMap[doc_id]
	if (o && o.cnt_child > 0 && (!o.children || o.children.length < o.cnt_child)) {
		var sql = sql_app.SELECT_children_with_i18n(doc_id)
		read2.http.get(read2.url
			, { params: { sql: sql } })
			.then(function (response) {
				angular.forEach(response.data.list, function (d) {
					ctrl.eMap[d.doc_id] = d
					var parent = ctrl.eMap[d.parent]
					if (parent) {
						if (!parent.children) {
							parent.children = []
						}
						parent.children.push(d)
					}

				})
				if (o.reference == 371968) {/** Element */
					if (o.reference2 == 371985) {/** SQL.SELECT */
						buildElementSelect(o)
					}
				}
				if (fnObj && fnObj.fnAfter) (
					fnObj.fnAfter(response)
				)
			})

	}
}

var buildElementSelect = function (el) {
	var addWhere
	el.sql = 'SELECT * FROM doc d \n'
	if (el.doctype == 25) {/**value.timestamp */
		el.sql += 'LEFT JOIN timestamp ts ON ts.timestamp_id=d.doc_id \n'
	}
	angular.forEach(el.children, function (elC) {
		if (elC.reference == 371992) {/**SELECT.WHERE.parent */
			addWhere = 'parent = ' + elC.reference2
		}
	})
	el.sql += ' WHERE ' + addWhere
	// console.log(el, el.sql)
}

var read2
class Read2 {
	constructor($http) {
		this.sql1 = function (a) {
			this.http.get(this.url, { params: a.params })
				.then((response) =>
					a.fn(response)
				)
		}
		this.http = $http
		this.url = '/r/url_sql_read_db1'
	}
}

var rw2
class ReadWrite2 {
	constructor($http, $timeout) {

		this.readAll_element = (a) => {
			// console.log(a.params.doc_id)
			a.deepRead = 0
			a.fnForEach = (o, response) => {
				if (++a.deepRead > 60){
					// console.log(a.deepRead, a.params.doc_id, a.params.parent, response)
					return
				} 
				// if (o.cnt_child && !o.children) {
				if (o.cnt_child) {
					let a1 = {
						params: { doc_id: o.doc_id, parent: o.doc_id }, deepRead: a.deepRead
						, fnForEach: a.fnForEach
						, fn2ForEach: a.fn2ForEach
					}
					this.read_element(a1)
				}
				if (a.fn2ForEach) a.fn2ForEach(o, response)
			}
			this.read_element(a)
		}
		
		
		this.read_element = (a) => {
			let o = ctrl.eMap[a.params.doc_id]
			//if not element or not element.children
			if (!o || (a.params.parent && o.cnt_child && !o.children) || (o.children && o.children.length < o.cnt_child)) {
				if (a.params.parent) a.params.sql = sql_app.SELECT_children_with_i18n(a.params.parent)
				if (!a.params.sql) a.params.sql = sql_app.SELECT_obj_with_i18n(a.params.doc_id)
				this.http.get(this.url, { params: a.params })
				.then((response) => {
					angular.forEach(response.data.list, (o1) => {
						let o2 = ctrl.eMap[o1.doc_id]
						if (!o2) {
							// if (!o2 || (o1.cnt_child && !o1.children)) {
								ctrl.eMap[o1.doc_id] = o1
								let parentEl = ctrl.eMap[o1.parent]
								if (parentEl) {
									// console.log(o.doc_id, parentEl.doc_id)
									if (!parentEl.children) parentEl.children = []
									parentEl.children.push(o1)
								}
								if (a.fnForEach) {
									a.fnForEach(o1, response)
								}
							}
						})
						if (a.fnForAll) a.fnForAll(response)
					})
				} else {
					// console.log('-------------------1271', o, a)
					if (a.fnForEach) a.fnForEach(o)
			}
		}

		this.write = (a) => {
			this.http.post(this.url, a.params.data)
				.then((response) => { a.then_fn(response) }, (response) => { a.error_fn(response) })
		}

		this.sql1 = (a) =>
			this.http.get(this.url, { params: a.params })
				.then((response) => a.fnThen(response))

		this.http = $http
		this.timeout = $timeout
		this.url = '/r/url_sql_read_db1'
	}
}

const createInsertFromElement = (e, i) => {
	console.log("createInsertFromElement: ", i, e.doc_id)
	e.sql_insert = 'INSERT INTO doc (:vars) VALUES (:vals);'
	let vars = 'doc_id', vals = ':nextDbId' + i
	const rewriteVal = (e3)=>{
		let rEl = ctrl.eMap[e3.reference2]
		if (rEl && rEl.parent == e.parent) {
			let rElParent = ctrl.eMap[rEl.parent]
			let i2 = rElParent.children.indexOf(rEl) + 1
			const valsL = vals.split(', ')
			valsL[valsL.length - 1] = ':nextDbId' + i2+' '
			vals = valsL.join(', ')
		}
	}
	angular.forEach(e.children, (e3) => {
		let r2vEl = ctrl.eMap[e3.reference2]
		vars += ', '
		vals += ', '
		if (e3.reference2) {
			vals += e3.reference2
		}
		if (371969 == e3.reference) {//parent
			vars += 'parent'
			if (!e3.reference2) {
				vals += ctrl.programControl.selectedParentEl.doc_id
			}else{
				rewriteVal(e3)
			}
		} else if (371971 == e3.reference) {//reference2
			vars += 'reference2'
			rewriteVal(e3)
		} else if (371970 == e3.reference) {//reference
			vars += 'reference'
			if (r2vEl) {
				let valueType = ctrl.doctype_content_table_name[r2vEl.doctype]
				if (valueType) {
					e.sql_insert += '\n'
					e.sql_insert += 'INSERT INTO :valueType (:valueType_id, value) VALUES (:nextDbId1 , :contentVal);'
					e.sql_insert = e.sql_insert.replace(':valueType', valueType)
					e.sql_insert = e.sql_insert.replace(':valueType', valueType)
					if (25 == r2vEl.doctype) {/** timestamp */
						var d = new Date(e.valueDate)
						d.setHours(e.valueHH)
						d.setMinutes(e.valueMM)
						var contentVal = d.toISOString().replace('T', ' ').split('.')[0]
					}
					e.sql_insert = e.sql_insert.replace(':contentVal', "'" + contentVal + "'")
				}
			}
		}
	})
	e.sql_insert = e.sql_insert.replace(':vars', vars)
	e.sql_insert = e.sql_insert.replace(':vals', vals)
	var sql1 = sql_app.SELECT_obj_with_i18n(':nextDbId1')
	console.log(e.sql_insert)
}
