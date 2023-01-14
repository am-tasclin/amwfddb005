var initCrud004 = function($timeout) {
	if(ctrl.request.parameters.doc2doc){
		ctrl.doc2doc_ids = []
		angular.forEach(ctrl.request.parameters.doc2doc.split(','), function(v,k){
			ctrl.doc2doc_ids[k] = 1*v
		})
		restReadChildrenIds = ctrl.doc2doc_ids.slice()
		console.log(ctrl.doc2doc_ids)
	}
	initDataModel()
	initSqlExe($timeout)
	initWiki()
	initEditObjectForm()

}

var add_eMap = function(v){
	ctrl.eMap[v.doc_id] = v
	if(exe_fn.add_eMap) exe_fn.add_eMap(v)
}

var initDataModel = function(){
	ctrl.content_menu = {}

	ctrl.init_table_model = function(table_model){
		if(!table_model.children){
			table_model.open_view = true
		}else{
			table_model.open_view = !table_model.open_view
		}
		var sql0 = sql_app.obj_with_i18n() + " WHERE d1.doc_id IN ( SELECT d2.doc_id FROM doc d1, doc d2 where d2.parent=d1.doc_id and  d1.reference = "+ table_model.doc_id+")"
		var sql = "  SELECT d1.parent FROM doc d1 where d1.reference = " + table_model.doc_id
		console.log(table_model.doc_id, !table_model.children, sql0)
		read_dataObject2fn(sql, function(response){
			console.log(response.data.list[0])
			if(response.data.list[0]){
				var parent_id = response.data.list[0].parent
				read_element_children(parent_id, function(response){
					read_dataObject2fn(sql0, function(response2){//read table data
						angular.forEach(response2.data.list, function(v){
							var parentEl = ctrl.eMap[v.parent]
							set_ref_to_col(v,parentEl)
							children_push(parentEl, v)
							add_eMap(v)
						})
					})
				})
			}else{
				console.log(123)

			}
		}, 1)
		var init_reference = function(v){ if(v.reference){
			read_element_descendant(v.reference, function(response){
//				console.log(table_model.doc_id,'ref',v.reference)
			})
		}}
		if(table_model.children){
			angular.forEach(table_model.children, function(v){ init_reference(v) })
		}else{
			read_element_descendant(table_model.doc_id, {forEachOne:function(v){ init_reference(v) }})
		}
	}

	ctrl.init_table_model1 = function(table_model){
		var init_reference = function(v){ if(v.reference){
			read_element_descendant(v.reference, function(response){
				console.log(table_model.doc_id,'ref',v.reference)
			})
		}}
		if(table_model.children){
			angular.forEach(table_model.children, function(v){ init_reference(v) })
		}else{
			read_element_descendant(table_model.doc_id, {forEachOne:function(v){ init_reference(v) }})
//			read_element_children(table_model.doc_id, {forEachOne:true, fn:function(v){ init_reference(v) }})
		}
		
	}

	ctrl.calc_sum_column = function(fnEl){
		if(!fnEl.calc_value){
			var sum = {sum:0, colEl:ctrl.eMap[fnEl.parent]}
			sum.calc = function(v){
				if(v['calc_value_'+sum.colEl.doc_id])
					sum.sum += v['calc_value_'+sum.colEl.doc_id]*1
			}
			var tabEl = ctrl.eMap[sum.colEl.parent]
//			console.log(fnEl, colEl, tabEl)
			angular.forEach(ctrl.eMap, function(v,k){
				if(tabEl.reference2==v.reference)	sum.calc(v)
				if(tabEl.doc_id==v.reference)		sum.calc(v)
			})
			fnEl.calc_value = sum.sum
		}
		return fnEl.calc_value 
	}

	ctrl.calc_set_value = function(f_operandEl){
		var val_operandEl = f_operandEl.children[0]
		var val_operand = val_operandEl['value_1_'+val_operandEl.doctype]
		return val_operand
	}

	var valOperand = function(f_operandEl, row, col){
		var val_operand
		if(isBinaryOperation(f_operandEl)){
			val_operand = binaryOperation(f_operandEl, row, col)
		}else{
			var f_ref_operandEl = ctrl.eMap[f_operandEl.reference]
			if(f_ref_operandEl && ctrl['calc_'+f_ref_operandEl.r1value]){
				val_operand = ctrl['calc_'+f_ref_operandEl.r1value](f_ref_operandEl)//ctrl.calc_set_value
			}else{
				if(row.ref_to_col && ctrl.eMap[row.ref_to_col[f_operandEl.reference]]){
					var val_operandEl = ctrl.eMap[row.ref_to_col[f_operandEl.reference]]
					val_operand = val_operandEl['value_1_'+val_operandEl.doctype_r]
				}else{
					val_operand = row['calc_value_'+f_operandEl.reference]
				}
			}
		}
		return val_operand
	}

	var binaryOperation = function(operatorEl, row, col){
		var operator = operatorEl.r1value
		var val_operand0, val_operand1
		var f_operandEl0 = operatorEl.children[0]
		var f_operandEl1 = operatorEl.children[1]
		val_operand0 = valOperand(f_operandEl0, row, col)
		val_operand1 = valOperand(f_operandEl1, row, col)
		console.log(val_operand0, operator, val_operand1)
		if('/'==operator){
			var v = val_operand0 / val_operand1
			console.log(v)
			return v
		}else
		if('*'==operator){
			var v = val_operand0 * val_operand1
			return v
		}else
		if('+'==operator){
			var v = val_operand0*1 + val_operand1*1
			return v
		}
	}

	var binaryOperationList = ['*','/','+','-']

	var isBinaryOperation = function(o){
		return binaryOperationList.indexOf(o.r1value) >= 0 && !!o.children
	}
	ctrl.calc_cell2 = function(row, col, formula){
//		if(!row['calc_value_'+col.doc_id] || isNaN(row['calc_value_'+col.doc_id])){
		if(!row['calc_value_'+col.doc_id]){
			if(formula && formula.children){
				var operatorEl = formula.children[0]
				if(operatorEl.children){
					if(isBinaryOperation(operatorEl)){
						var v = binaryOperation(operatorEl, row, col)
						console.log(v, v.toFixed(2))
						if(!isNaN(v))
							row['calc_value_'+col.doc_id] = v.toFixed(2)
					}
					console.log(formula.doc_id)
//					if(!row['calc_value_'+col.doc_id])
//						row['calc_value_'+col.doc_id] = -1
				}
			}
		}
	}


	ctrl.calc_cell = function(row, col, formula){
		if(row && !row['calc_value_'+col.doc_id] && row.ref_to_col){
			if(formula && formula.children){
				var operatorEl = formula.children[0]
				if(operatorEl.children){
					var operator = operatorEl.r1value
					if(operator){
						var f_operandEl0 = operatorEl.children[0]
						var f_operandEl1 = operatorEl.children[1]
						var val_operandEl0 = ctrl.eMap[row.ref_to_col[f_operandEl0.reference]]
						var val_operandEl1 = ctrl.eMap[row.ref_to_col[f_operandEl1.reference]]
						var val_operand0 = val_operandEl0['value_1_'+val_operandEl0.doctype_r]
						var val_operand1 = val_operandEl1['value_1_'+val_operandEl1.doctype_r]
//						console.log(val_operand0,operator,val_operand1)
						if('*'==operator){
							row['calc_value_'+col.doc_id] = val_operand0 * val_operand1
						}
					}
				}
			}
		}
	}

	ctrl.initTypesList = function(){
		if(!ctrl.typeList){
			var sql = "" +
			"SELECT * FROM (SELECT d1.*, d2.doctype doctype2, d2.doctype_id doctype2_id FROM doctype d1 \n" +
			"LEFT JOIN doctype d2 ON d2.parent_id=d1.doctype_id  \n" +
			"WHERE d1.parent_id =18 \n" +
			"UNION \n" +
			"SELECT d1.*, null, null FROM doctype d1 where doctype_id in (18,22)) x ORDER BY doctype_id, doctype2_id"
			readSql({ sql:sql,
				afterRead:function(response){ 
					ctrl.typeList = response.data.list
					console.log(ctrl.typeList)
				}
			})
		}
	}

	ctrl.content_menu.setTypeIdElement = (doctype_id, el) => {
		let sql = "UPDATE doc SET doctype = :doctype_id WHERE doc_id = :doc_id"
		if (!doctype_id)
			sql = "UPDATE doc SET doctype = null WHERE doc_id = :doc_id"
		let so = {
			doc_id: el.doc_id, doctype_id: doctype_id,
			sql: sql,
			dataAfterSave:function(response){
				console.log(response)
				el.doctype = doctype_id
			}
		}
		writeSql(so)
	}
	ctrl.content_menu.setTypeElement = (typEl, el)=>{
		console.log(typEl, el)
		var doctype_id = typEl.doctype_id
		if(typEl.doctype2_id)
			var doctype_id = typEl.doctype2_id
		ctrl.content_menu.setTypeIdElement(doctype_id, el)
	}

	ctrl.rowDelete = function(row){
		console.log(row)
		var so = {doc_id:row.doc_id, sql:"DELETE FROM doc WHERE parent=:doc_id OR doc_id=:doc_id"}
		so.dataAfterSave = function(response) {
			var tab = ctrl.eMap[row.parent]
			var i = tab.children.indexOf(row)
			console.log(i, response.data)
			delete tab.children[i]
		}
		writeSql(so)
	}

	ctrl.rowInsert = function(table_model){
		if(!table_model.table_data_id){
			console.log(table_model)
			angular.forEach(ctrl.eMap, function(v, k){
				if(369358==v.reference && v.reference2==table_model.doc_id){
					table_model.table_data_id = v.doc_id
				}
			})
		}
		if(table_model.table_data_id){
			var so = {parent:table_model.table_data_id, reference:table_model.doc_id}
			so.sql =	sql_app.INSERT_doc(so)
			so.sql +=	sql_app.SELECT_obj_with_i18n(':nextDbId1')
			so.dataAfterSave = function(response) {
				console.log(response.data)
				var table_data = ctrl.eMap[table_model.table_data_id]
				if(!table_data.children)	table_data.children = []
				var row = response.data.list1[0]
				table_data.children.unshift(row)
				ctrl.eMap[row.doc_id] = row
				angular.forEach(table_model.children, function(col, k){
					var so1 = {parent:row.doc_id, reference:col.doc_id}
					so1.sql =	sql_app.INSERT_doc(so1)
					so1.sql +=	sql_app.SELECT_obj_with_i18n(':nextDbId1')
					so1.dataAfterSave = function(response) {
						var cell = response.data.list1[0]
						ctrl.eMap[cell.doc_id] = cell
						children_push(row, cell)
						if(!row.ref_to_col) row.ref_to_col = {}
						row.ref_to_col[col.doc_id] = cell.doc_id
						if(table_model.children.length-1 == k){
							console.log(table_model.children.length, k)
							ctrl.rowOpenToEdit(row)
						}
					}
					writeSql(so1)
				})
			}
			writeSql(so)
		}
	}

	ctrl.rowOpenToEdit = function(row){
		row.rowOpenToEdit = !row.rowOpenToEdit
		console.log(row)
		if(row.rowOpenToEdit){
			angular.forEach(row.children, function(cell){
				if(!cell.value_1_edit){
					var col = ctrl.eMap[cell.reference]
					cell.value_1_edit = cell['value_1_'+col.doctype]
					if(25==col.doctype || 26==col.doctype){
						if(cell['value_1_'+col.doctype])
							var d = new Date(cell['value_1_'+col.doctype])
						else
							var d = new Date()
						console.log(col.doctype, cell['value_1_'+col.doctype], col.doc_id, d)
						cell.value_1_edit_date = d
						cell.value_1_edit_hour = d.getHours()
						cell.value_1_edit_minute = d.getMinutes()
					}
				}
			})
		}
	}

	var input_cell_recalc = function(cell){
		var	col = ctrl.eMap[cell.reference]
		,	tab = ctrl.eMap[col.parent]
		,	row = ctrl.eMap[cell.parent]
		if(369379==tab.reference && !tab.tab_cols_ids){//init table
			tab.tab_cols_ids = []
			angular.forEach(tab.children, function(col) {
				tab.tab_cols_ids.push(col.doc_id)
			})
		}
		var check_fn_use_cell = function(fnO, col_fn){
			if(fnO.reference==col.doc_id){
				console.log(fnO.doc_id, fnO.reference, col.doc_id, fnO.reference==col.doc_id, row['calc_value_'+col_fn.doc_id], row.doc_id)
				delete row['calc_value_'+col_fn.doc_id]
				ctrl.calc_cell2(row, col, ctrl.eMap[col_fn.reference])
				console.log(fnO.doc_id, fnO.reference, col.doc_id, fnO.reference==col.doc_id, row['calc_value_'+col_fn.doc_id], row.doc_id)
			}
			angular.forEach(fnO.children, function(v) {
				check_fn_use_cell(v, col_fn)
			})
		}
		angular.forEach(tab.children, function(col_fn){
			if(col_fn.reference && 369364==ctrl.eMap[col_fn.reference].reference2){//function - formula - calc column
				var fnEl = ctrl.eMap[col_fn.reference]
				console.log(col_fn.doc_id, fnEl.doc_id)
				check_fn_use_cell(fnEl, col_fn)
			}
		})
	}

	ctrl.inputFocus = function(row, col, cell){
		if(!cell){
			console.log(row, col, cell)
			var so =	{parent:row.doc_id, reference:col.doc_id}
			so.sql =	sql_app.INSERT_doc(so)
			so.sql +=	sql_app.SELECT_obj_with_i18n(':nextDbId1')
			so.dataAfterSave = function(response){
				console.log(response.data)
				var newEl = response.data.list1[0]
				ctrl.eMap[newEl.doc_id] = newEl
				children_push(row, newEl)
				if(!row.ref_to_col) row.ref_to_col = {}
				row.ref_to_col[col.doc_id] = newEl.doc_id
			}
			writeSql(so)
		}
	}

	ctrl.inputBlurTSdirect = function(cell){
		cell.value_1_edit = cell.value_1_edit_date.toISOString()
		ctrl.field_name_save(cell, function(){ input_cell_recalc(cell) })
	}
	ctrl.inputBlurTS = function(cell, hm){
		if('hour'==hm){
			cell.value_1_edit_date.setHours(cell.value_1_edit_hour)
		}else if('minute'==hm){
			cell.value_1_edit_date.setMinutes(cell.value_1_edit_minute)
		}
		var value_1_edit = cell.value_1_edit_date.toISOString().split('.')[0]
		if(!cell.value_1_25 || cell.value_1_25.split('.')[0] != value_1_edit){
			console.log(value_1_edit, cell.value_1_25, hm)
			ctrl.inputBlurTSdirect(cell)
		}
	}

	ctrl.inputBlur = function(cell, row, col){
		console.log(cell)
		if(cell){
			console.log(123)
			if(!cell.doc_id){
				if(!row.ref_to_col) row.ref_to_col = []
				if(!row.ref_to_col[col.doc_id]){
					angular.forEach(row.children, function(v){
						if(v.reference==col.doc_id){
							row.ref_to_col[col.doc_id] = v
							v.value_1_edit = cell.value_1_edit
							cell = v
						}
					})
				}
			}
			var el = cell
			var doctype = el.doctype?el.doctype:el.doctype_r?el.doctype_r:22
			console.log(doctype, cell.value_1_edit, el['value_1_'+doctype], el, row, col)
			if(cell.value_1_edit != cell['value_1_'+doctype]){
				ctrl.field_name_save(cell, function(){ input_cell_recalc(cell) })
			}
		}
	}

	ctrl.field_name_save = function(el, fn){
		var doctype = el.doctype?el.doctype:el.doctype_r?el.doctype_r:22
		doctype = [14,17].indexOf(el.doctype)>=0?22:doctype
		var table_name = ctrl.doctype_content_table_name[doctype]
		if(doctype==32) table_name='string'
		console.log(123, el, doctype, table_name)
		
		if(el.value_1_edit != el['value_1_'+doctype]){
			var so = {doc_id:el.doc_id, value:el.value_1_edit}
			if(!el['value_1_'+doctype]){
				so.sql = "INSERT INTO "+table_name
				+" (" + table_name + "_id, value) VALUES (:doc_id, :value);\n"
			}else{
				so.sql = "UPDATE "+table_name
				+" SET value = :value WHERE " + table_name + "_id=:doc_id ;\n"
			}
			so.dataAfterSave = function(response){
				el['value_1_'+doctype] = el.value_1_edit
				if(fn) fn()
			}
			console.log(so)
			 writeSql(so)
		}
	}

	ctrl.save_model_i18n = function(el){
//		var i18n_parent = ctrl.doc_i18n_parent['_'+ctrl.choice_data_model.doc_id]
		var i18n_parent = ctrl.i18n_parent
		console.log(el, ctrl.choice_data_model, ctrl.choice_data_model_obj, i18n_parent)
		if(el.i18n_id){
			var so = { i18n : el.i18n, i18n_id : el.i18n_id,
			dataAfterSave : function(response){
				console.log(el, response.data, so)
			},}
			so.sql = "UPDATE string SET value=:i18n WHERE string_id=:i18n_id"
			writeSql(so)
//		}else if(ctrl.choice_data_model.i18n_parent){
		}else if(i18n_parent){
			var so = {parent:i18n_parent, reference:el.doc_id, i18n:el.i18n,
			dataAfterSave : function(response){
				console.log(el, response.data, so)
				el.i18n_id = response.data.nextDbId1
			},}
			console.log(so)
			so.sql = sql_app.INSERT_doc_parent_ref()
			so.sql += "INSERT INTO string (string_id, value) VALUES (:nextDbId1, :i18n);\n"
			console.log(el, so, ctrl.choice_data_model, so.sql)
			writeSql(so)
		}
	}

	sql_app.INSERT_doc_parent_ref = function(d){
		var sql = "INSERT INTO doc (doc_id, parent, reference) VALUES (:nextDbId1, :parent, :reference); \n"
		if(d){
			if(d.parent) sql = sql.replace(':parent',d.parent)
			if(d.reference) sql = sql.replace(':reference',d.reference)
			else sql = sql.replace(':reference','null')
			if(d.nextDbId) sql = sql.replace(':nextDbId1',':nextDbId'+d.nextDbId)
		}
		return sql
	}

	ctrl.field_name_focus2 = function(el){ 
		var doctype = el.doctype?el.doctype:el.doctype_r?el.doctype_r:22
		doctype = [14,17].indexOf(el.doctype)>=0?22:doctype
		el.value_1_edit = el['value_1_'+doctype]
	}

	ctrl.field_name_focus = function(el){ 
		if(!el.value_1_edit)	ctrl.field_name_focus2(el)
	}

	ctrl.go_up_level2 = function(position, doc_id){
		var doc2doc_ids = ctrl.doc2doc_ids.slice();
		doc2doc_ids[position] = doc_id
		console.log(doc_id, position, doc2doc_ids)
		ctrl.openUrl('?doc2doc='+doc2doc_ids.toString())
	}
	ctrl.go_up_level = function(edEl_id, parent_id){
		var position = ctrl.doc2doc_ids.indexOf(edEl_id)
		if(!parent_id)
			parent_id = ctrl.eMap[edEl_id].parent
		var doc2doc_ids = ctrl.doc2doc_ids.slice();
//		var doc2doc_ids = ctrl.doc2doc_ids.splice(position,1,parent_id)
		console.log(edEl_id, parent_id, position, doc2doc_ids, ctrl.doc2doc_ids)
		doc2doc_ids[position] = parent_id
		ctrl.openUrl('?doc2doc='+doc2doc_ids.toString())
	}
	ctrl.click_data_model_close_children = function(el){
		angular.forEach(el.children, function(v,k){
			delete v.open_children
		})
	}

	ctrl.content_menu.downElement = function(el){
		console.log(el)
		upDowntElement(el, 1)
	}

	ctrl.content_menu.upElement = function(el){
		console.log(el)
		upDowntElement(el, -1)
	}

	ctrl.content_menu.minusElement = function(el){
		if(!el.children || (el.children && el.children.length==0)){
			writeSql({sql:"" +
				"DELETE FROM doc WHERE reference = :el_id AND parent in (SELECT doc_id FROM doc where reference = 285596);\n" +
				"DELETE FROM doc WHERE doc_id = :el_id "
			, el_id:el.doc_id
			, dataAfterSave : function(response) {
				var parentEl = ctrl.eMap[el.parent]
				parentEl.children.splice(parentEl.children.indexOf(el), 1)
				delete el
			}})
		}
	}

	ctrl.content_menu.addElement = function(el){
		var so =	{parent:el.doc_id}
		so.sql =	sql_app.INSERT_doc(so)
		so.sql +=	sql_app.SELECT_doc_id()
		so.dataAfterSave = function(response) {
			if(!el.children)
				el.children = []
			el.children.unshift(response.data.list1[0])
//			el.children.push(response.data.list1[0])
		}
		writeSql(so)
	}

	ctrl.content_menu.copyElement = function(el){
		ctrl.content_menu.copyObject = el
		el.countWithChildren = countWithChildren(el)
		console.log(ctrl.content_menu.copyObject)
	}
	ctrl.content_menu.cutElement=function(o){
		ctrl.content_menu.cutObject = o
		console.log(o)
	}
	ctrl.content_menu.pasteElement = function(el){
		// console.log('pasteElement:',el)
		ctrl.content_menu.typeElement('paste',el)
	}

	ctrl.content_menu.pasteElementContent = function(el){
		console.log(el)
		if(ctrl.content_menu.cutObject){
			console.log(ctrl.content_menu.cutObject)
			var so = {parent:el.parent,
				doc_id:ctrl.content_menu.cutObject.doc_id,
				sql:"UPDATE doc SET parent=:parent WHERE doc_id=:doc_id",
				dataAfterSave:function(response){
					console.log(response.data)
					delete ctrl.content_menu.cutObject
				}
			}
			writeSql(so)
		}else if(ctrl.content_menu.copyObject){
			console.log(el, ctrl.content_menu.copyObject)
			sql_app.copyElement({parent:el.parent, doc_id:':nextDbId'+1}, el.sort, {copyObject:ctrl.content_menu.copyObject, el:el})
		}
	}

	sql_app.copyElement = function(so, sort, d){
		if(d.copyObject.reference) so.reference = d.copyObject.reference
		if(d.copyObject.reference2) so.reference2 = d.copyObject.reference2
		if(d.copyObject.doctype) so.doctype = d.copyObject.doctype
		if(d.copyObject.s1value){
			so.s1value = d.copyObject.s1value
		}
		so.sql = sql_app.INSERT_doc(so)
		if(sort){
			so.sql += "INSERT INTO sort (sort_id, sort) VALUES (" +
				so.doc_id + ", " + sort + ");\n"
		}
		so.sql += sql_app.SELECT_obj_with_i18n(so.doc_id)
		console.log(d.copyObject, so.sql)
		so.dataAfterSave = function(response){
			var newEl
			angular.forEach(response.data, function(v,k){ if(k.indexOf('list')==0){
				newEl = v[0]
			}})
			ctrl.eMap[newEl.doc_id] = newEl
			if(!d.elParent){
				var elParent = ctrl.eMap[d.el.parent]
				var indexEl = elParent.children.indexOf(d.el)
				console.log(newEl, indexEl)
				elParent.children.splice(indexEl, 0, newEl)
			}else{
				d.elParent.children[sort] = newEl
			}
			if(d.copyObject.children){
				newEl.children = []
				angular.forEach(d.copyObject.children, function(v, k_sort){
					console.log(v)
					sql_app.copyElement({parent:newEl.doc_id, doc_id:':nextDbId'+1}, k_sort, {copyObject:v, elParent:newEl})
				})
			}
		}
		writeSql(so)
	}

	ctrl.content_menu.pasteElementChildContent = function(el){
		console.log(el)
		if(ctrl.content_menu.cutObject){
			console.log(ctrl.content_menu.cutObject)
			var so = {parent:el.doc_id,
				doc_id:ctrl.content_menu.cutObject.doc_id,
				sql:"UPDATE doc SET parent=:parent WHERE doc_id=:doc_id",
				dataAfterSave:function(response){
					console.log(response.data)
					delete ctrl.content_menu.cutObject
				}
			}
			writeSql(so)
		}
	}

	var countWithChildren = function(el){
		var count = 1
		if(el.children)
			angular.forEach(el.children, function(v){
				count += countWithChildren(v)
			})
		return count
	}
	ctrl.content_menu.pasteElementReference2 = function(el){
		console.log(el, ctrl.content_menu.copyObject)
		var so = {reference2:ctrl.content_menu.copyObject.doc_id,
			doc_id:el.doc_id,
			sql:"UPDATE doc SET reference2 = :reference2 WHERE doc_id = :doc_id",
			dataAfterSave:function(response){
				console.log(response)
				el.reference2 = ctrl.content_menu.copyObject.doc_id
			}
		}
		writeSql(so)
	}
	ctrl.content_menu.expandNodeData = function(node_id){
		// console.log(node_id)
		read_element(node_id, function(response){
			// console.log('expandNodeData:',ctrl.eMap[node_id])
			ctrl.content_menu.copyObject = ctrl.eMap[node_id]
		})
	}
	ctrl.content_menu.pasteElementReference1 = function(el){
		console.log(el, ctrl.content_menu.copyObject)
		var so = {reference:ctrl.content_menu.copyObject.doc_id,
			doc_id:el.doc_id,
			sql:"UPDATE doc SET reference = :reference WHERE doc_id = :doc_id",
			dataAfterSave:function(response){
				console.log(response)
				el.reference = ctrl.content_menu.copyObject.doc_id
			}
		}
		writeSql(so)
	}
	ctrl.content_menu.deleteElementReference1 = function(el){
		var so = {doc_id:el.doc_id,
			sql:"UPDATE doc SET reference = null WHERE doc_id = :doc_id",
			dataAfterSave:function(response){
				console.log(response)
				delete el.reference
			}
		}
		writeSql(so)
	}
	ctrl.content_menu.deleteElementReference2 = function(el){
		var so = {doc_id:el.doc_id,
			sql:"UPDATE doc SET reference2 = null WHERE doc_id = :doc_id",
			dataAfterSave:function(response){
				console.log(response)
				delete el.reference2 
			}
		}
		writeSql(so)
	}

	ctrl.content_menu.typeElementOnOff = function(type, el){
		var subSepMenuName = type+'_'+el.doc_id
		if(subSepMenuName == ctrl.content_menu.subSepMenuName){
			delete ctrl.content_menu.subSepMenuName
		}else{
			ctrl.content_menu.subSepMenuName = subSepMenuName 
		}
	}

	ctrl.content_menu.typeElement = function(type, el){
		ctrl.content_menu.subSepMenuName = type+'_'+el.doc_id
	}

	ctrl.select_tree_item = function(d){
		if(ctrl.content_menu.subSepMenuName && ctrl.content_menu.subSepMenuName.includes('pin_name')){
			ctrl.content_menu.typeElement('pin_name',d)
		}
		if(false&&d.doc_id==ctrl.doc2doc_ids[1]){
			alert('Дані вже відкртиті в правій панелі.')
			return
		}
		ctrl.choice_data_model_obj = d
		if(ctrl.choice_data_model_obj.cnt_child && (!ctrl.choice_data_model_obj.children || 
				ctrl.choice_data_model_obj.children.length<ctrl.choice_data_model_obj.cnt_child
		)){
			read_element_children(ctrl.choice_data_model_obj.doc_id, function(response){
//				console.log(d.doc_id)
			})
			ctrl.choice_data_model_obj.open_children = true
		}else{
			ctrl.choice_data_model_obj.open_children = 
			!ctrl.choice_data_model_obj.open_children 
		}
	}
	ctrl.doc2doc_fd = {}
	ctrl.doc2doc_fd[ctrl.doc2doc_ids[0]] = {}
	ctrl.doc2doc_fd[ctrl.doc2doc_ids[1]] = {}
//	console.log(ctrl.doc2doc_fd)
	
	read_to_folder({doc_id:ctrl.doc2doc_ids[0]}, ctrl.doc2doc_ids[0])
	read_to_folder({doc_id:ctrl.doc2doc_ids[1]}, ctrl.doc2doc_ids[1])

}

var open_children_doc2doc = ()=>{
	
	ctrl.reverced_page_link = () => {
		const reverced_page_link = [...ctrl.request.path].reverse().join('/')+'.html?doc2doc='+ctrl.doc2doc_ids.join(',')
		return reverced_page_link
	}

	ctrl.change_panel = ()=>{
		ctrl.doc2doc_ids.unshift(ctrl.doc2doc_ids[1])
		ctrl.doc2doc_ids.splice(2, 1)
		console.log(ctrl.doc2doc_ids)
	}
	var fn_r_c = function(v){
			console.log(v)
		var o = ctrl.eMap[v]
		if(371327 == o.reference){//SQL
			ctrl.sql_exe.add2exe(v)
			console.log(v, o.reference, o.reference2, o)
			if(!o.value_1_22 && o.reference){//SQL in reference?
				if(!ctrl.eMap[o.reference]){
					read_element(o.reference2, function(response){
						ctrl.sql_exe.read(o.reference2)
					})
				}
			}else{
				ctrl.sql_exe.read(v)
			}
		}
		read_element_children(v, function(response){ open_children_doc2doc() })
	}
	angular.forEach(restReadChildrenIds.slice(), function(v,k){
		restReadChildrenIds.splice(restReadChildrenIds.indexOf(v),1)
		if(!ctrl.eMap[v]){
			console.log(v, restReadChildrenIds)
			read_element(v, function(response){ fn_r_c(v) })
		}else if(!ctrl.eMap[v].children){
			fn_r_c(v)
		}
	})
}

var read_to_folder = function(d, d_start_id, doc){
	if(true || !ctrl.eMap[d_start_id]){//TODO: пропадає іконка закрити робочу праву панель
		var sql = sql_app.SELECT_obj_with_i18n(d.doc_id)
		readSql({ sql:sql, afterRead:function(response){
			var d_r = response.data.list[0]
//console.log(d.doc_id, d_r)
			if(14==d_r.doctype){//folder
				if(doc){
					doc.folder = d_r
					ctrl.doc2doc_fd[d_start_id] = doc
				}
			}else
				if(17==d_r.doctype){//document
					read_to_folder({doc_id:d_r.parent}, d_start_id, d_r)
				}else{
					read_to_folder({doc_id:d_r.parent}, d_start_id)
				}
//			console.log(d_start_id,'TODO: double read')
		}})
	}
}

function readSql(params, obj){
//	console.log(params)
	replaceParams(params)
	if(!params.error_fn)
		params.error_fn = function(response){
			console.error(response)
			console.error(params)
			console.error(response.config.params.sql)
		}
	if(!obj) obj = params
	exe_fn.httpGet(exe_fn.httpGet_j2c_table_db1_params_then_fn(
	params,
	function(response) {
//		obj.list = response.data.list
		if(obj.afterRead){
			obj.afterRead(response)
		}else if(params.afterRead){
			params.afterRead(response)
		}
	}))
}

function read_dataObject2fn(sql, afterRead, limit) {
	if(!limit){
		if(ctrl.limit){ limit = ctrl.limit
		}else{ limit = 100
		}
	}
	sql += " LIMIT "+limit
	readSql({sql:sql, afterRead:function(response){afterRead(response)}})
}

var set_ref_to_col = function(d,p) {
	if(!p.ref_to_col)	p.ref_to_col = {}
	if(d.reference)		p.ref_to_col[d.reference] = d.doc_id
}

function read_element_descendant(doc_id, fn, forEachChildFn){
	var o = ctrl.eMap[doc_id]
	if(!o){
		read_element(doc_id, function(response){
			if(fn)		fn(response)
			read_element_descendant(doc_id, fn, forEachChildFn)
		})
	}else{
		read_element_children(o.doc_id, {forEachOne:function(v, response){
			if(v.cnt_child>0){
				read_element_descendant(v.doc_id, fn, forEachChildFn)
			}
		}, forEachChildFn:forEachChildFn, fn:fn})
	}
}

function read_element_children(doc_id, fn){
	var o = ctrl.eMap[doc_id]
	if(o){
		if(o.cnt_child>0 && (!o.children || o.children.length < o.cnt_child)){
			var sql = sql_app.SELECT_children_with_i18n(doc_id)
			var fn0 = function(response){
				var oldChildren = o.children
				o.children = response.data.list
				if(oldChildren){
					angular.forEach(oldChildren, function(v){
						o.children.push(v)
					})
				}
				angular.forEach(o.children, function(v, k){
					set_ref_to_col(v,o)
					if(!ctrl.eMap[v.doc_id]){
						ctrl.eMap[v.doc_id] = v
					}else{
						o.children[k] = ctrl.eMap[v.doc_id]
					}
					if(fn && typeof fn === 'object' && fn.forEachOne)	fn.forEachOne(v,response)
					if(fn && fn.fn  && fn.fn.forEachOne)				fn.fn.forEachOne(v,response)
					if(fn && fn.forEachChildFn)			fn.forEachChildFn(v,response)
					if(exe_fn.add_eMap)									exe_fn.add_eMap(v)
				})
				if(fn && typeof fn === 'function')		fn(response)
			}
			read_dataObject2fn(sql, function(response){fn0(response)})
		}
	}
}


function read_element(doc_id, fn){
	var o = ctrl.eMap[doc_id]
	if(!o){
		var sql = sql_app.SELECT_obj_with_i18n(doc_id)
		var fn0 = function(response){
//		console.log(response.data)
			var o = response.data.list[0]
			//ctrl.eMap[o.doc_id] = o
			add_eMap(o)
			if(ctrl.eMap[o.parent]){
				if(!ctrl.eMap[o.parent].children){
					ctrl.eMap[o.parent].children = [o]
				}
			}
			if(fn)		fn(response)
		}
		read_dataObject2fn(sql, function(response){fn0(response)})
	}else{
			if(fn)		fn()
	}
}

function replaceParams(params){
	angular.forEach(params.sql.split(':'), function(v,k){
		if(k>0){
			var p = v.split(' ')[0].replace(')','').replace(',','').replace(';','').trim()
			var pv = params[p]
			if(pv){
				params.sql = params.sql.replace(':'+p, "'"+pv+"'")
			}
		}
	})
	return params
}

var upDowntElement = function(o, direction){
//	var oParent = this.eMap[o.parent]
		var oParent = ctrl.eMap[o.parent]
		var position = oParent.children.indexOf(o)
		if((position +1 == oParent.children.length) && direction == 1){// зробити першим
			var x = oParent.children.splice(position, 1)
			oParent.children.splice(0, 0, x[0])
		}else if((position == 0) && direction == -1){// зробити останнім
			console.log('зробити останнім')
			var x = oParent.children.splice(position, 1)
			oParent.children.push(x[0])
		}else{
			var x = oParent.children.splice(position, 1)
			oParent.children.splice(position + direction, 0, x[0])
		}
		var so = sqlSort(oParent)
		so.sql += sql_app.SELECT_children_with_i18n(oParent.doc_id)
//		so.sql += sql_app.SELECT_with_parent(oParent)
		so.dataAfterSave = function(response) {
			angular.forEach(response.data, function(v, k){
				if(k.includes('list')){
					angular.forEach(v, function(v2){
						var v2_old = ctrl.eMap[v2.doc_id]
						if(v2_old && v2_old.children)
							v2.children = v2_old.children
						delete v2_old
						ctrl.eMap[v2.doc_id] = v2
					})
					oParent.children = v
				}
			})
		}
		writeSql(so)
}


sql_app.replace_params = function(sql, data){
	angular.forEach(sql.split(':'), function (v){
		var v1 = v.split(' ')[0]
		.replace(',','')
		.replace(')','').trim()
		if(data[v1]){
			sql = sql.replace(':'+v1, data[v1])
		}
	})
	return sql
}

var writeSql = function(data){
	if(!data.sql)
		sql_app.INSERT_doc(data)
	replaceParams(data)
	exe_fn.httpPost
	({	url:'/r/url_sql_read_db1',
		then_fn:function(response) {
//			console.log(response.data)
			if(data.dataAfterSave)
				data.dataAfterSave(response)
		},
		data:data,
	})
}

sql_app.doc_insert_sort = function(){
	var sql = "INSERT INTO sort (sort, sort_id) VALUES (:sort, :sort_id)"
	return sql
}

sql_app.doc_update_sort = function(){
	var sql = "UPDATE sort SET sort=:sort WHERE sort_id=:sort_id"
	return sql
}

sql_app.INSERT_doc = function(so){
	if(!so.doc_id)		so.doc_id = ':nextDbId1'
	var vars = '', vals = ''
	angular.forEach(['doc_id','parent','reference','reference2','doctype'], function(k){
		var v = so[k]
		if(v){
			if(vars.length>0){
				vars += ', '
				vals += ', '
			}
			vars += k
			if(!Number.isInteger(v) && (!v || v.indexOf(':')==0))
				vals += v
			else
				vals += "'"+v+"'"
		}
	})
	if(vars.length>0){
		so.sql = "INSERT INTO doc (" + vars + ") VALUES (" + vals + ");\n"
	}
	if(so.uuid){
		so.sql += "INSERT INTO uuid (uuid_id, value) VALUES (" +
		so.doc_id + ", '" + so.uuid + "');\n"
	}
	if(so.s1value){
		so.sql += "INSERT INTO string (string_id, value) VALUES (" +
		so.doc_id + ", '" + so.s1value + "');\n"
	}
	return so.sql
}

sql_app.SELECT_doc_id = function(){
	var sql = "SELECT * FROM doc WHERE doc_id=:nextDbId1; \n"
	return sql
}

var initEditTiming = function(){

	ctrl.edTiming = {}
	ctrl.edTiming.doc_id		= 368797
	ctrl.edTiming.frequency_id	= 369936
	ctrl.edTiming.period_id		= 368861

	console.log(ctrl.edTiming)

	ctrl.edTiming.frequencySeek = function() {
		console.log(1234)
		ctrl.sql_exe.change_sql_seek2(function(){
			console.log(123)
		})
	}
	ctrl.edTiming.frequencyChange = function() {
		console.log(ctrl.edTiming, ctrl.edTiming.frequency_23)
		ctrl.edTiming.frequencySeek()
	}

	ctrl.edTiming.periodChange = function() {
		console.log(ctrl.edTiming)
	}

	ctrl.edTiming.clickTimeUnit = function(o) {
		ctrl.edTiming.periodunit = o.value_1_22
		ctrl.edTiming.periodunit_id = o.doc_id
		console.log(ctrl.edTiming, o)
	}

	ctrl.edTiming.clickType = function(type) {
		ctrl.edTiming.type = type
		console.log(ctrl.edTiming, type)
		if('frequency'==type){
			delete ctrl.edTiming.period_23
			ctrl.edTiming.frequencySeek()
		}else
		if('period'==type){
			delete ctrl.edTiming.frequency_23
		}
	}

	ctrl.edTiming.clickClean = function() {
		delete ctrl.edTiming.timing_id
		delete ctrl.edTiming.e
		delete ctrl.edTiming.periodunit
	}

	ctrl.edTiming.clickSaved = function(e) {
		ctrl.edTiming.e=e
		ctrl.edTiming.timing_id		= e.doc_id
		ctrl.edTiming.periodunit	= e.periodunit
		ctrl.edTiming.frequency_23	= e.frequency_23
		ctrl.edTiming.period_23		= e.period_23
		if(ctrl.edTiming.period_23){
			ctrl.edTiming.clickType('period')
		}else
		if(ctrl.edTiming.frequency_23){
			ctrl.edTiming.clickType('frequency')
		}
		console.log(e, ctrl.edTiming)
	}

}

var initEditObjectForm = function(){
	ctrl.initObjectForm = function(e){
		console.log(e, e.reference2)
		if(368797==e.reference2 && !ctrl.edTiming){
			initEditTiming()
		}
	}
}

var children_push = function(p,c){
	if(!p.children)	p.children = []
	p.children.push(c)
}

var initWiki = function(){
	console.log('wiki')
	ctrl.wiki = {}
	ctrl.wiki.clickContents = function() {
		ctrl.wiki.closeContents = !ctrl.wiki.closeContents
	}
}

var getCol2 = (e1)=>{
	let
	r2El	= ctrl.eMap[e1.reference2],
	rp2El	= ctrl.eMap[r2El.parent],
	col2	= getCol(r2El, rp2El)
	return col2
}

const getCol = (e, pEl, prefix0) => {
	console.log(e.doc_id, pEl.doc_id, prefix0)
	let col = '', prefix = pEl.value_1_22
	if(!pEl.value_1_22) prefix = pEl.r2value
	if(prefix0) prefix = prefix0
	if ( 372189  == e.reference) {//SELECT.cols.value
		col += 'value '+prefix+'_value'
	} else if (371969 == e.reference) {//SELECT.cols.parent
		col += 'parent '+prefix+'_p'
	} else if (371970 == e.reference) {//SELECT.cols.reference
		col += 'reference '+prefix+'_r'
	} else if (371971 == e.reference) {//SELECT.cols.reference2
		col += 'reference2 '+prefix+'_r2'
	} else if (372188 == e.reference) {//SELECT.cols.doc_id
		col += 'doc_id '+prefix+'_id'
	}
	return col
}

var initSqlExe = function($timeout){

	sql_app.exe = {}
	ctrl.sql_exe = sql_app.exe
	ctrl.sql_exe.show_sql_type='value_1_22'
	sql_app.exe.limit = 25

	var _timeout_seek_fn2
	ctrl.sql_exe.change_sql_seek2 = function(fn){
		if(_timeout_seek_fn2) $timeout.cancel(_timeout_seek_fn2)
		_timeout_seek_fn2 = $timeout(fn, 1000)
	}


	var _timeout_seek_fn
	ctrl.sql_exe.change_sql_seek = function(){
		if(_timeout_seek_fn) $timeout.cancel(_timeout_seek_fn)
		_timeout_seek_fn = $timeout(function() {
			var sql_id = ctrl.sql_exe.sql_id
			ctrl.sql_exe.sql_id = 0
			ctrl.sql_exe.read(sql_id)
		}, 1000)
	}

	ctrl.request.changeView = function(p){
		if(!ctrl.request.parameters.views) ctrl.request.parameters.views = ''
		var v = ctrl.request.parameters.views.split(',')
		console.log(p,v.toString(), v.indexOf(p))
		if(v.indexOf(p)>=0){
			v.splice(v.indexOf(p),1)
			ctrl.request.parameters.views = v.toString()
		}else{
			ctrl.request.parameters.views = v.toString()
			if(ctrl.request.parameters.views.length > 0)
				ctrl.request.parameters.views += ','
			ctrl.request.parameters.views += p
		}
		console.log(ctrl.request.parameters.views)
	}

	ctrl.sql_exe.set_sql_seek = function(itemEl, type_id){
		var o = ctrl.eMap[ctrl.eMap[ctrl.sql_exe.sql_id].ref_to_col[type_id]]
		console.log(itemEl, o.r2value)
		o.r2value = itemEl.value_1_22
		var sql_id = ctrl.sql_exe.sql_id
		ctrl.sql_exe.sql_id = 0
		ctrl.sql_exe.read(sql_id)
		ctrl.sql_exe.show_seek_list = !ctrl.sql_exe.show_seek_list 
	}

	ctrl.sql_exe.read_seek_list = function(){
		ctrl.sql_exe.show_seek_list = !ctrl.sql_exe.show_seek_list 
		var o = ctrl.eMap[ctrl.eMap[ctrl.sql_exe.sql_id].ref_to_col[371682]]
	}

	ctrl.sql_exe.sql_name = (sql_id) => {
		let sql_name = ''
		if (ctrl.eMap[sql_id])
			if (ctrl.eMap[sql_id].children)
				angular.forEach(ctrl.eMap[sql_id].children, (e) => {
					if (e && 371335 == e.reference) {//sql_name
						sql_name = e.value_1_22
					}
				})
		return (sql_name.length>0?':':'') + sql_name
	}

	let _timeout_seek_fn3
	ctrl.sql_exe.change_sql_seek3 = (el)=>{
		ctrl.sql_exe.rs2_id = el.parent
		ctrl.sql_exe.el_seek = el
		// console.log(el, ctrl.sql_exe.sql_exe)
		if(_timeout_seek_fn3) $timeout.cancel(_timeout_seek_fn3)
		_timeout_seek_fn3 = $timeout(()=> {
			// create_sql_exe(ctrl.sql_exe.rs2_id)
			console.log(ctrl.sql_exe.sql_exe)
			rw2.sql1({
				fnThen: (response) => {
					ctrl.sql_exe.readList = response.data.list
				}, params: { sql: ctrl.sql_exe.sql_exe }
			})
		}, 1000)
	}

	const replace_sql = (id) => {
		let o = ctrl.eMap[id]
		let replace = o.value_1_22
		if (371682 == o.reference) {//like_all
			replace = "'%" + o.r2value+"%'"
		}
		ctrl.sql_exe.sql_exe = ctrl.sql_exe.sql_exe.split(':sql_'+o.doc_id).join(replace)
	}

	const create_sql_exe = (sql_id) => {
		ctrl.sql_exe.sql_exe = ctrl.sql_exe.sql
		angular.forEach(ctrl.sql_exe.sp_sql_ids, (v, id) => { replace_sql(id) })
	}

	const fn2ForEach = (o, response)=>{
		if(ctrl.sql_exe.sp_sql_ids[o.doc_id]){
			if(ctrl.sql_exe.sql_exe.includes(o.doc_id)){
				replace_sql(o.doc_id)
			}
		}
	}

	ctrl.sql_exe.read_select4 = (sql_id) => {
		// console.log(sql_id, ctrl.sql_exe.sql_exe)
		rw2.read_element({
			params: { doc_id:sql_id}, fnForEach: (o) => {
				let sql0 = o.value_1_22
				// console.log(o.doc_id, o)
				if (!ctrl.sql_exe.sql) {
					ctrl.sql_exe.sql = sql0
					ctrl.sql_exe.sql_exe = sql0
					ctrl.sql_exe.sp_sql_ids = {}
				}
				if(371682 == o.reference){// SELECT.like_all
					if(!sql0) sql0 = "'%%'"
				}
				ctrl.sql_exe.sql_exe = ctrl.sql_exe.sql_exe.split(':sql_'+sql_id).join(sql0)
				if (ctrl.sql_exe.sql_exe.includes(':sql_')) {
					let sql_id = ctrl.sql_exe.sql_exe.split(':sql_')[1].split(' ')[0]
					ctrl.sql_exe.sp_sql_ids[sql_id] = {}
					// console.log(2, sql_id, ctrl.sql_exe.sql_exe)
					ctrl.sql_exe.read_select4(sql_id)
				}
			}})
	}

	ctrl.sql_exe.read_select3 = (sql_id) => {
		console.log(sql_id, ctrl.sql_exe.sql_exe)
		rw2.sql1({
			fnThen: (response) => {
				let sql0 = response.data.list[0].value
				if (!ctrl.sql_exe.sql) {
					ctrl.sql_exe.sql = sql0
					ctrl.sql_exe.sql_exe = sql0
				}
				ctrl.sql_exe.sql_exe = ctrl.sql_exe.sql_exe.split(':sql_'+sql_id).join(sql0)
				if (ctrl.sql_exe.sql_exe.includes(':sql_')) {
					let sql_id = ctrl.sql_exe.sql_exe.split(':sql_')[1].split(' ')[0]
					console.log(2, sql_id, ctrl.sql_exe.sql_exe)
					ctrl.sql_exe.read_select3(sql_id)
				}
			},
			params: { sql: 'SELECT value FROM string WHERE string_id='+ sql_id }
		})
	}

	ctrl.sql_exe.read_select2 = (sql_id) => {
		let d = ctrl.eMap[sql_id]
		ctrl.sql_exe.sp_sql_ids = {}
		ctrl.sql_exe.rs2_id = sql_id
		ctrl.sql_exe.sql = d.value_1_22
		ctrl.sql_exe.sql_exe = d.value_1_22
		rw2.readAll_element({fn2ForEach: fn2ForEach, params: { doc_id: sql_id } })
		console.log('ctrl.sql_exe.read_select2', sql_id, d)
		if (!d.value_1_22) 
			return
		console.log(sql_id, 1, ctrl.sql_exe.sql, d)
		let sp_sql = ctrl.sql_exe.sql.replace(/\n/g, ' ').split(':sql_')
		angular.forEach(sp_sql, (s, i) => {
			console.log(sql_id, i)
			if (i > 0) {
				let id = s.split(' ')[0]
				ctrl.sql_exe.sp_sql_ids[id] = {}
				rw2.readAll_element({ fn2ForEach: fn2ForEach, params: { doc_id: id } })
				// if (id == d.reference2) {
				// 	// ctrl.sql_exe.sp_sql_ids[id].v = d.r2value
				// 	ctrl.sql_exe.sql_exe = ctrl.sql_exe.sql_exe.replace(':sql_' + id, d.r2value)
				// }
			}
		})
	}

	ctrl.sql_exe.read_select = (sql_id) => {
		var d = ctrl.eMap[sql_id]
		if(ctrl.sql_exe.sql_id != sql_id){
			ctrl.sql_exe.sql_id = sql_id
		}
		d.sql = 'SELECT * FROM doc '
		let fromEl
		angular.forEach(d.children, (e) => {
			if ( 372192  == e.reference) {//SELECT.FROM
				fromEl = e
				d.sql += e.value_1_22
				angular.forEach(e.children, (e1)=>{
					d.sql +=', doc '+ e1.value_1_22
				})
				d.sql += ' '
				console.log(e.doc_id, d.sql)
			}
		})

		const setLeftJoin = (e) => {
			let sql = '\n LEFT JOIN ', onAtt

			if (e.reference2) {
				let r2El = ctrl.eMap[e.reference2]
				sql += '('+r2El.value_1_22+') '+e.value_1_22
			} else if ([23,22].indexOf(e.doctype) >= 0) {
				onAtt = 'doc_id'
				if (23 == e.doctype) {
					sql += ' integer ON integer_id= '
				} else if (22 == e.doctype) {
					sql += ' string ON string_id= '
				}
			}
			let cols = ''
			
			angular.forEach(e.children, (e1)=>{
				console.log(e1.doc_id, e1.reference, ctrl.eMap[e1.reference])
				if (371971 == e1.reference) {//SELECT.LEFT JOIN.reference2
					onAtt = 'reference2'
				} else if (372181 == e1.reference) {//SELECT.LEFT JOIN
					let sql2 = setLeftJoin(e1)
					sql += sql2
				} else if (!e1.reference && e1.reference2) {//SELECT.LEFT JOIN.ON doc_id=?
					if (!ctrl.eMap[e1.reference2])
						console.error(e1.reference2, 'is not element')
					let col2 = getCol2(e1)
					console.log(e1.reference2, col2)
					cols += col2.split(' ')[1] + ' = doc_id '
				}else{
					let 
					ljpEl	= ctrl.eMap[e.parent],
					rEl		= ctrl.eMap[e1.reference],
					rpEl	= ctrl.eMap[rEl.parent],
					col		= getCol(rEl, rpEl)
					if (372181 == ljpEl.reference) {//SELECT.LEFT JOIN
						cols += e.value_1_22 + '.' + col.split(' ')[1]+' = '+ljpEl.value_1_22+'.'
					}else{
						cols += e.value_1_22 + '.' + col.split(' ')[1]+' = '
					}
					if (e1.reference2) {
						let col2 = getCol2(e1)
						cols += col2.split(' ')[1]
					}else{
						cols += 'doc_id'
					}
				}
			})
			if (onAtt)
				sql += onAtt + ' '
			if (cols.length > 0)
				sql += ' ON ' + cols
			return sql
		}
		let cols = '' 
		angular.forEach(d.children, (e) => {
			if ( 372183  == e.reference) {//SELECT.cols
				let prefix = e.value_1_22,
				r2FromEl = ctrl.eMap[e.reference2]
				if (e.reference2) {
					let r2E = ctrl.eMap[e.reference2]
					if(r2E){
						prefix = r2E.value_1_22
					}else{
						prefix = e.r2value
					}
				}
				console.log(e.doc_id, prefix)
				if(!e.children){
					if (cols.length>0) cols += ', '
					cols += prefix + '.*'
				}else{
					angular.forEach(e.children, (e1) => {
						console.log(e1.doc_id)
						if (cols.length>0) cols += ', '
						let rEl, rpEl
						if(e1.reference){
							rEl = ctrl.eMap[e1.reference]
							if(rEl){
								rpEl = ctrl.eMap[rEl.parent]
							}
						}
						if (rEl && rpEl && 372183 == rpEl.reference) {//cols
							let rCol = getCol(rEl, rpEl)
							console.log(rCol,1, prefix)
							cols += prefix+'.'+rCol.split(' ')[1]
						}else{
							if (fromEl){
								if (r2FromEl && r2FromEl.parent == fromEl.doc_id)
									cols += r2FromEl.value_1_22 + '.'
								else
									cols += fromEl.value_1_22 + '.'
							}
							cols += getCol(e1, e, prefix)
						}
					})
				}
			} else if (372181 == e.reference) {//SELECT.LEFT JOIN
				d.sql += setLeftJoin(e)
			}
		})
		if (cols.length > 0)
			d.sql = d.sql.replace(' * ', ' '+cols+' ')
		angular.forEach(d.children, (e) => {
			if (371992 == e.reference) {//SELECT.WHERE
				let sql_where = '\n WHERE '
				const add_where = (e1, attName)=>{
					if(fromEl){
						let r2FromEl = ctrl.eMap[e1.reference2]
						if(r2FromEl && r2FromEl.parent==fromEl.doc_id){
							sql_where += fromEl.value_1_22+'.'+attName+' = '+r2FromEl.value_1_22+'.doc_id '
						}else{
							sql_where += fromEl.value_1_22+'.'+attName+' = '+e1.reference2
						}
					}else{
						sql_where += ' '+attName+' = '+e1.reference2
					}
				}
				angular.forEach(e.children, (e1, i) => {
					if(i>0){
						sql_where += ' AND '
					}
					if ( 371969  == e1.reference) {//parent
						add_where(e1, 'parent')
					} else if (371970 == e1.reference) {//reference
						add_where(e1, 'reference')
					}
				})
				d.sql += sql_where
			}
		})
		console.log(d.sql)
		readSql({ sql:d.sql+' LIMIT 10',
			afterRead:function(response){ 
				ctrl.sql_exe.readList = response.data.list
			}
		})
	}

	ctrl.sql_exe.read = (sql_id)=>{
		var d = ctrl.eMap[sql_id]
		console.log(sql_id, d.doc_id)
		if(d.cnt_child>0 && !d.children){
			read_element_children(sql_id)
		}
		if(!d.sql_inner){
			d.sql_inner = []
			d.sql_inner1 = []
		}
		if(ctrl.sql_exe.sql_id != sql_id){
			ctrl.sql_exe.read_sql = d.value_1_22
			ctrl.sql_exe.sql_id = sql_id
		}
		//console.log(ctrl.sql_exe.read_sql)
		var sp_sql = ctrl.sql_exe.read_sql.replace(/\n/g,' ').split(':sql_')
		console.log(sql_id, sp_sql[1])
		if(sp_sql[1]){
			var sql_id2 = sp_sql[1].split(' ')[0]
			var d2 = ctrl.eMap[sql_id2]
			var fn2 = (d2)=>{
				var sql2 = d2.value_1_22
				var sql_id2 = d2.doc_id
				if(371682==d2.reference){// seek.like_all 
					sql2 = "'%" + d2.r2value + "%'"
				}else 
				if(371820==d2.reference){//parameter_to_seek 
					sql2 = d2.r2value
				}else{
				}
				ctrl.sql_exe.read_sql = ctrl.sql_exe.read_sql.replace(':sql_'+sql_id2, sql2)
				d.sql_inner.push(sql_id2)
				if(d.value_1_22.indexOf(sql_id2)>=0){
					d.sql_inner1.push(sql_id2)
				}
				ctrl.sql_exe.read(sql_id)
				read_element_children(sql_id2)
			}
			if(!d2){
				read_element(sql_id2, (response)=>{
					var d2 = ctrl.eMap[sql_id2]
					//console.log(sql_id, sql_id2, d2)
					fn2(d2)
				})
			}else{
				fn2(d2)
			}
		}else{
			if(ctrl.sql_exe.read_sql.indexOf('LIMIT')<0)
				ctrl.sql_exe.read_sql += " LIMIT " + sql_app.exe.limit
			delete ctrl.sql_exe.readList
			readSql({ sql:ctrl.sql_exe.read_sql,
				afterRead:function(response){ 
					ctrl.sql_exe.readList = response.data.list
					ctrl.eMap[sql_id].readList = ctrl.sql_exe.readList
				}
			})
		}
	}

	ctrl.sql_exe.add2exe = (doc_id)=>{
		if(!sql_app.exe.list2exe) sql_app.exe.list2exe = {}
		sql_app.exe.list2exe[doc_id] = doc_id
		//ctrl.select_tree_item(ctrl.eMap[ctrl.doc2doc_ids[0]])
		if(ctrl.eMap[ctrl.doc2doc_ids[0]])
			ctrl.eMap[ctrl.doc2doc_ids[0]].open_children = true
	}

}
function sqlSort(oParent) {
	var so = { sql: '' }
	angular.forEach(oParent.children, function (v, k) {
		if (v.sort_id)
			var sql = sql_app.doc_update_sort()
		else
			var sql = sql_app.doc_insert_sort()
		sql = sql_app.replace_params(sql, { sort: k + 1, sort_id: v.doc_id, })
		so.sql += sql + ';\n'
	})
	return so
}

