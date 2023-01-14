'use strict'
app.config(RouteProviderConfig)
singlePage.session = { tree: { l: { id: [45] }, r: { id: [45] } } }
singlePage.index_template = 'index_template.html'
sql_app.group.gp_ADN02.add()
sql_app.group.gp_ADN03.add()
sql_app.group.gp_MedicationRequest.add()

sql_app.autoSQL_AdnCRUD = {
    c: 'INSERT INTO :table_name (:table_name_id, value) VALUES (:doc_id, :value) ',
    r: 'SELECT * FROM (:sql_app.SelectADN ) x WHERE doc_id=:doc_id',
    u: 'UPDATE :table_name SET value = :value WHERE :table_name_id=:doc_id ',
    uDoc: 'UPDATE doc SET :filedName = :value WHERE doc_id=:doc_id ',
    d: 'DELETE FROM doc WHERE doc_id = :doc_id ',
    buildSql: adnId => {
        let sql = ''
        const adnEl = conf.eMap[adnId]
            , colName = adnEl.r_value_22 || adnEl.rr_value_22
            , colSimpleType = adnEl.doctype || adnEl.r_doctype || 22
            , contentTableName = sql_app.doctype_content_table_name[colSimpleType]
            , cellValue = singlePage.session.selectedRow[colName + '_' + colSimpleType]
            , cellId = singlePage.session.selectedRow[colName + '_id']
        console.log(adnId, colName, colSimpleType, cellValue, cellId)
        if (cellId) {
            sql = sql_app.autoSQL_AdnCRUD.u
                .replaceAll(':table_name', contentTableName)
                .replace(':value', "'" + cellValue + "'")
                .replace(':doc_id', cellId)
        } else {
            console.log('insert')
            const so = { parent: adnEl.parent, reference: adnEl.reference }
            sql = sql_app.INSERT_doc(so)
            // sql += sql_app.autoSQL_AdnCRUD.c
            console.log(sql)
        }
        return sql
    },
}

sql_app.doctype_content_table_name = {
    22: 'string',
    23: 'integer',
    24: 'double',
    25: 'timestamp',
    26: 'date',
    30: 'uuid',
}

// let content_menu = {} //left in MDM
class AdnContent_menu { //left in MDM
    constructor(dataFactory) { this.dataFactory = dataFactory }

    minusElement = adnId => {
        const sql = sql_app.autoSQL_AdnCRUD.d.replace(':doc_id', adnId)
        this.dataFactory.writeSql(sql, r => {
            if (1 == r.update_0) {
                const parentChildren = conf.parentChild[conf.eMap[adnId].parent],
                    childPosition = parentChildren.indexOf(adnId)
                parentChildren.splice(parentChildren, 1)
                delete conf.eMap[adnId]
            }
        })
    }

    copyElement = adnId => conf.copyAdnId = adnId
    cutElement = adnId => conf.cutAdnId = adnId
    typeElement = (type, adnId) => conf.subSepMenuName = type + '_' + adnId
    pasteElement = adnId => this.typeElement('paste', adnId)
    pasteElementContent = adnId => {
        console.log(adnId)
    }

    pasteElementReference1 = adnId => {
        const sql = sql_app.autoSQL_AdnCRUD.uDoc
            .replace(':filedName', 'reference')
            .replace(':value', conf.copyAdnId)
            .replace(':doc_id', adnId) + ';\n '
            + replaceSql(sql_app.autoSQL_AdnCRUD.r)
                .replace(':doc_id', adnId)
        console.log(adnId, sql)
        this.dataFactory.writeSql(sql, r => conf.eMap[r.list1[0].doc_id] = r.list1[0])
    }

    pasteElementReference2 = adnId => {
        console.log(adnId)
    }

    addElement = adnId => {
        const el = conf.eMap[adnId], so = { parent: el.doc_id }
        so.sql = sql_app.INSERT_doc(so)
        so.sql += replaceSql(sql_app.autoSQL_AdnCRUD.r)
        so.sql = so.sql.replace(':doc_id', ':nextDbId1')
        console.log(adnId, so)
        this.dataFactory.writeSql(so.sql, r => {
            console.log(r)
            // conf.eMap[r.list1[0].doc_id] = r.list1[0]
        })
    }

    field_name_save = adnId => {
        const el = conf.eMap[adnId], so = {
            doc_id: el.doc_id, value: "'" + el.valueToEdit + "'"
            , table_name: 'string', cuName: !el.value_22 ? 'c' : 'u'
        }

        so.sql = sql_app.autoSQL_AdnCRUD[so.cuName]
            .replaceAll(':table_name', so.table_name)
            .replace(':doc_id', so.doc_id)
            .replace(':value', so.value)

        so.sql += ';\n ' + sql_app.autoSQL_AdnCRUD.r
        so.sql = so.sql.replace(':doc_id', so.doc_id)
        so.sql = replaceSql(so.sql)
        this.dataFactory.writeSql(so.sql
            , r => conf.eMap[r.list1[0].doc_id] = r.list1[0])
    }

    field_name_focus = adnId => {
        const el = conf.eMap[adnId]
        if (!el.valueToEdit) {
            el.valueToEdit = el.r_doctype ? el['value_' + el.r_doctype] : el.value_22
        }
    }
    
}

const r1r2Use = {}
r1r2Use.isN = () => !isNaN(r1r2Use.r1r2*1)

class InitPageController extends AbstractController {
    constructor(dataFactory, $timeout) {
        super(); this.dataFactory = dataFactory; this.$timeout = $timeout;
        this.r1r2Use = r1r2Use
        this.date = new Date()
        this.content_menu = new AdnContent_menu(dataFactory)
    }

    seekr12Go = () => {
        let sql = 'SELECT * FROM doc WHERE reference=:r1 :andor reference2=:r2 \n\
        ORDER BY parent DESC'.replace(':r1', this.r1r2Use.r1)
            .replace(':r2', this.r1r2Use.r2)
            .replace(':andor', this.r1r2Use.r1 == this.r1r2Use.r2 ? 'OR' : 'AND')
        if (isNaN(this.r1r2Use.r1r2)) {
            console.log(this.r1r2Use.r1r2)
            sql = "SELECT * FROM string,doc WHERE doc_id=string_id AND LOWER(value) \n\
            LIKE LOWER('\%"+ this.r1r2Use.r1r2 + "%') "
            console.log(sql, this.r1r2Use, isNaN(this.r1r2Use.r1r2), "'\%" + this.r1r2Use.r1r2 + "%' ")
        }
        this.dataFactory.readSql(sql, r => this.r1r2Use.list = r.list)
    }
    seekr12 = $event => {
        if ('Enter' == $event.code) {
            console.log(this.r1r2Use)
            this.seekr12Go()
        }
    }
    seekr1r2 = $event => {
        if ('Enter' == $event.code) {
            this.r1r2Use.r1 = this.r1r2Use.r2 = this.r1r2Use.r1r2
            console.log(this.r1r2Use)
            this.seekr12Go()
        }
    }

    sqlNames = () => Object.keys(sql_app)
    delSqlKeyValue = () => {
        delete singlePage.session.sqlKey
        delete singlePage.session.sqlValue
    }
    isSelectedRow = r => singlePage.session.selectedRowId
        && (singlePage.session.selectedRowId == r[this.getSql(singlePage.session.sql).rowId]
            || singlePage.session.selectedRowId == r.doc_id
        )

    selectADN = (adnId, lr) => {
        singlePage.session.tree[lr].selectedId = adnId
        if (!singlePage.session.tree[lr].openIds)
            singlePage.session.tree[lr].openIds = []
        if (singlePage.session.tree[lr].openIds.includes(adnId))
            singlePage.session.tree[lr].openIds
                .splice(singlePage.session.tree[lr].openIds.indexOf(adnId), 1)
        else
            singlePage.session.tree[lr].openIds.push(adnId)
    }

    isSelectADN = (adnId, lr) => singlePage.session.tree[lr].selectedId &&
        singlePage.session.tree[lr].selectedId == adnId

    hasADNClosedChild = (adnId, lr) => singlePage.session.tree[lr]
        .openIds && !singlePage.session.tree[lr].openIds
            .includes(adnId) && conf.parentChild[adnId] && conf
                .parentChild[adnId].length > 0

    initSession = () => JSON.stringify(singlePage.session)

    initRL = () => angular.forEach(['l', 'r']
        , lr => angular.forEach(singlePage.session.tree[lr].id
            , id => this.dataFactory.getReadADN(id)))

    readSessionSqlTable = () => {
        // console.log('sql', singlePage.session.sql, sql_app[singlePage.session.sql])
        // console.log('sql', singlePage.session.sql,)
        const sqlColumnsPattern = 'LEFT JOIN (:columnSql ) :columnName ON :columnName_parent=row_id '
        if (singlePage.session.sql) {
            if (sql_app[singlePage.session.sql]) {
                let sqlColumns = ''
                angular.forEach(sql_app[singlePage.session.sql].columns, (v, k) => {
                    sqlColumns += '\n' + sqlColumnsPattern
                        .replace(':columnSql', sql_app[v.sqlName + '_' + k].sql)
                        .replaceAll(':columnName', sql_app[v.sqlName + '_' + k].colName)
                    console.log(k, v.sqlName,)
                })
                const sql = buildSqlWithKeyValue(singlePage.session.sql
                    , singlePage.session.sqlKey, singlePage.session.sqlValue)
                this.dataFactory.readSqlTable(sql)
            } else {
                const autoSql = sql_app.autoSql
                    , createAutoSqlName = singlePage.session.sql.split('_')[0]
                    , ontologyId = singlePage.session.sql.split('_')[1]
                if (sql_app.autoSql['create' + createAutoSqlName + 'Sql']) {
                    const ctrl = this
                    this.$timeout(() => {
                        sql_app.autoSql['create' + createAutoSqlName + 'Sql'](ontologyId)
                        ctrl.exeSql()
                    }, 400)

                }
            }
        }
    }

    setSessionTableColumnSqlName = sqlName => {
        const columnObj = sql_app[singlePage.session.sql]
            .columns[singlePage.session.sqlSelectedColumnId]
        console.log(sqlName, columnObj)
        columnObj.sqlName = sqlName.split('_')[0]
    }


    editRow = () => singlePage.session.CRUD = singlePage.session.CRUD != 'U' ? 'U' : ''
    saveEditRow = () => {
        const patternId = singlePage.session.sql.split('_')[1] * 1
            , patternEl = conf.eMap[patternId]
        console.log(singlePage.session.selectedRow)
        let sql = sql_app.autoSQL_AdnCRUD.buildSql(patternId)
        angular.forEach(conf.parentChild[patternId]
            , adnId => sql += (sql.length > 0 ? ';\n\ ' : '')
                + sql_app.autoSQL_AdnCRUD.buildSql(adnId))
    }

    saveEditRow01 = () => {
        const patternId = singlePage.session.sql.split('_')[1] * 1
            , patternEl = conf.eMap[patternId]
        singlePage.session.nextDbId = 1
        console.log(singlePage.session.selectedRow, patternId, patternEl)
        let sql = ''
        angular.forEach(singlePage.session.selectedRow, (value, key) => {
            if (key.split('_')[1] != 'id') {
                const cellName = key.split('_')[0]
                    , cellTypeNumber = key.split('_')[1]
                    , cellId = singlePage.session.selectedRow[cellName + '_id']
                    , contentTableName = sql_app.doctype_content_table_name[cellTypeNumber]
                console.log(key, cellId, cellName, cellId, contentTableName, value, key)

                if (cellId) {
                    sql += sql.length > 0 ? ';\n\ ' : ''
                    sql += sql_app.autoSQL_AdnCRUD.u
                        .replaceAll(':table_name', contentTableName)
                        .replace(':value', "'" + value + "'")
                        .replace(':doc_id', cellId)
                    console.log(sql)
                } else if (value) {
                    console.log('insert ', key, value, 11)

                }
            }
        })
    }

    clickRow = row => {
        singlePage.session.selectedRow = row
        const rowMeta = conf.eMap[singlePage.session.sql.split('_')[1]]
        console.log(123, rowMeta)
    }

    buildSqlApp = () => {
        if (this.add_sql_app) return this.add_sql_app = null
        const sessionSqlAppObj = sql_app[singlePage.session.sql]
        console.log(sessionSqlAppObj)
        let add_sql_app = 'sql_app.' + singlePage.session.sql + ' = '
        add_sql_app += JSON.stringify(sessionSqlAppObj, ' ', 2)
        add_sql_app += '\n // ' + sessionSqlAppObj.sql + '\n\n '
        angular.forEach(sessionSqlAppObj.columns, (v, k) => {
            const sqlAppName = v.sqlName + '_' + k, sqlAppObj = sql_app[sqlAppName]
            add_sql_app += 'sql_app.' + sqlAppName + ' = '
            add_sql_app += JSON.stringify(sqlAppObj, ' ', 2) + '\n'
            console.log(k, v, sqlAppName, sqlAppObj, 1)
        })
        add_sql_app += '\n // END: buildSqlApp - sql_app.' + singlePage.session.sql + ' \n '
        this.add_sql_app = add_sql_app
    }

    exeSql = () => {
        let sql = buildSqlWithKeyValue(singlePage.session.sql)
        // console.log(sql)
        this.dataFactory.readSqlTable(sql)
    }

    exeSqlX = () => {
        const sessionSqlObj = sql_app[singlePage.session.sql]
        //console.log(singlePage.session.sql, '\n', sessionSqlObj)
        let sql = sessionSqlObj.sql
        if (sessionSqlObj.parentId && sessionSqlObj.parentIn) {
            sql = 'SELECT * FROM (' + sql + ') x WHERE ' + sessionSqlObj.parentId + ' IN (' + sessionSqlObj.parentIn + ')'
        }
        // (
        singlePage.session.CRUD = 'R' //) && 
        sql = buildSqlWithKeyValue(sql)
        console.log(sql)
        this.dataFactory.readSqlTable(sql)
    }

    getSqlAppNames = () => Object.keys(sql_app)

    createTableSql = () => {
        const param = { parent: singlePage.session.tree.l.selectedId }
        console.log('-> click createTableSql/autoSql \n----\n', sql_app.autoSql.sql)
        this.rowSql = sql_app.autoSql.createTableSql(param)
        console.log(this.rowSql)
    }

    createRowSql = () => {
        console.log('-> click autoSql \n----\n', sql_app.autoSql.rowSql)
        this.rowSql = sql_app.autoSql.createRowSql({ parent: singlePage.session.tree.l.selectedId })
    }

}; app.controller('InitPageController', InitPageController)

const routeController = controllerClass => {
    const controllerName = controllerClass.toString().split(' ')[1]
    app.controller(controllerName, controllerClass)
    return { templateUrl: 'mc-sql-design.html', controller: controllerName, }
}

class InitSessionController extends InitPageController {
    constructor(dataFactory, $timeout) {
        super(dataFactory, $timeout)
        singlePage.session = JSON.parse(decodeURI(singlePage.UrlMap()['init']))
        if (!singlePage.session.selectedLR) singlePage.session.selectedLR = 'l'

        this.initRL()
        this.readSessionSqlTable()

        let parents = ''
        angular.forEach(['l', 'r'], lr => angular.forEach(singlePage.session
            .tree[lr].openIds, parent => parents += ',' + parent))

        // console.log(parents)

        angular.forEach(['l', 'r'], lr => angular.forEach(singlePage.session
            .tree[lr].openIds, parent => this.dataFactory.getReadADN_children(parent)
        ))
    }
}; angular.forEach(['init_:json',]
    , v => singlePage[v] = routeController(InitSessionController))

class InitChildrenController extends InitPageController {
    constructor(dataFactory) {
        super(dataFactory)
        singlePage.session.selectedLR = singlePage.UrlMap()['children'].split('_')[1]
        if (!singlePage.session.tree.l.id)
            singlePage.session.tree.l.id = singlePage.UrlMap()['children']
        console.log(singlePage.UrlMap()['children'], singlePage.session.sqlKey)
        // console.log(singlePage.session)
        if (singlePage.session.sqlKey == 'parent') {
            singlePage.session.sqlValue = singlePage.UrlMap()['children'].split('_')[0]
            singlePage.session.sqlLR = singlePage.UrlMap()['children'].split('_')[1]
            console.log(singlePage.session)
            this.readSessionSqlTable()
        }

        console.log(singlePage.UrlMap()['children'].split('_')[0])
        this.dataFactory.getReadADN_children(singlePage.UrlMap()['children'].split('_')[0])

    }
}; angular.forEach(['children_:lId',]
    , v => singlePage[v] = routeController(InitChildrenController))

class InitTreeController extends InitPageController {
    constructor(dataFactory) {
        super(dataFactory)
        angular.forEach(singlePage.UrlMap()['tree'].split(',')
            , (t, tk) => angular.forEach(t.split('_')
                , (v, k) => singlePage.session.tree[!tk ? 'l' : 'r'].id[k] = 1 * v))
        if (singlePage.UrlMap()['tree'] == 'tree'
            && isNaN(singlePage.session.tree.l.id)
        ) singlePage.session.tree.l.id = 45

        console.log(123, singlePage.UrlMap()['tree']
            , singlePage.session.tree)

        this.initRL()

    }

}; angular.forEach(['tree', 'tree_:lId', 'tree_:lId,:rId',]
    , v => singlePage[v] = routeController(InitTreeController))

const replaceSlash = ';'

class InitSqlTableController extends InitPageController {
    constructor(dataFactory) { super(dataFactory); this.readSqlTable() }

    readSqlTable = () => {
        if (singlePage.session.sqlUrl != singlePage.Url()) {
            singlePage.session.sqlUrl = singlePage.Url().replace(/\//g, replaceSlash)
            singlePage.session.sql = singlePage.UrlMap()['sql']

            if (singlePage.UrlList()[2]) {
                let sqlWhereKV = singlePage.UrlList()[2].split('=')
                singlePage.session.sqlKey = sqlWhereKV[0]
                singlePage.session.sqlValue = sqlWhereKV[1].split('_')[0]
                singlePage.session.sqlLR = sqlWhereKV[1].split('_')[1]
            }

            this.readSessionSqlTable()
        }
    }

}; angular.forEach(['sql_:sql', 'sql_:sql/:key1=:val1',]
    , v => singlePage[v] = routeController(InitSqlTableController))

class RWADNDataFactory extends RWADN01DataFactory {
    constructor($http, $q) { super($http, $q) }

    // readSql = (sql, fn) => this.httpGetSql({ sql: sql }).then(rD => { fn(rD) })
    // readSql = (sql, fn) => this.httpGetSql({ sql: sql }).then(fn)
    readSqlTable = sql => this.readSql(sql
        , responceData => conf.sqlTableData = responceData.list)

    //ADN - Abstract Data Node
    getReadADN = docId => {
        const deferred = this.$q.defer()
        conf.eMap[docId] ? deferred.resolve(conf.eMap[docId]) : this.readSql(
            buildSqlWithKeyValue('SelectADN', 'doc_id', docId)
            , responceADN_Data => deferred.resolve(add_eMap(responceADN_Data.list[0]))
        )
        return deferred.promise
    }

    getReadADN_children = docId => this.getReadADN(docId).then(() => this.readSql(
        buildSqlWithKeyValue('SelectADN', 'parent', docId)
        , responceChildren => angular.forEach(responceChildren.list
            , child => addParentChild(add_eMap(child)))))

}; app.factory('dataFactory', RWADNDataFactory)

// console.log(buildSqlWithKeyValue('SelectADN', 'doc_id', 373458))

let CarePlan_1 = {
    // fdf
    title: "Доступні Вакцини і способи їх застосування.",
    activity: [

    ]
}
let x = CarePlan_1
// вибірка з https://build.fhir.org/valueset-vaccine-code.html
let ValueSet_1 = {
    system: "http://hl7.org/fhir/sid/cvx",
    compose: {
        include: [{
            concept: [
                {
                    code: "207",
                    display: "SARS-COV-2 (COVID-19) vaccine, mRNA, spike protein, LNP, preservative free, 100 mcg/0.5mL dose"
                }]
        }]
    }
}


conf.doctype_fa = {
    14: 'far fa-folder',
    17: 'far fa-file',
}

let xx = {
    "update_id": 463166687,
    "message": {
        "message_id": 256, "from": {
            "id": '{ your - user - id}',
            "is_bot": false,
            "first_name": "Simon",
            "last_name": "Scholz",
            "language_code": "en-US"
        },
        "chat": {
            "id": '{ your - chat - id }',
            "first_name": "Simon",
            "last_name": "Scholz",
            "type": "private"
        },
        "date": 1519229850,
        "text": "/now Hamburg",
        "entities": [{
            "offset": 0, "length": 4,
            "type": "bot_command"
        }]
    }
}
