'use strict';
var app = angular.module("app", ['ngRoute', 'ngResource', 'ngSanitize'])
angular.element(() => angular.bootstrap(document, ['app']))

// not for $scope
const sql_app = {}
// for|as $scope

sql_app.cmd = {}
sql_app.cmd.addGroup = (group) => sql_app.group[group]
    .add() && console.log(group, sql_app.group[group])

const singlePage = {}/* $route fn */
    , conf = { eMap: {}, parentChild: {}, }/* conf page|app|content */
class AbstractController {
    singlePage = singlePage; conf = conf;
    getSql = sqlName => sql_app[sqlName]
    getConf = confName => conf[confName]
}

const add_eMap = v => v && (conf.eMap[v.doc_id] = v)
const getSetList = (o, n) => o[n] ? o[n] : o[n] = []
const getSetParentChild = v => getSetList(conf.parentChild, v.parent)
// const getSetParentChild = v => conf.parentChild[v.parent] ?
//     conf.parentChild[v.parent] : conf.parentChild[v.parent] = []
const addParentChild = v => !getSetParentChild(v).includes(v.doc_id) ?
    getSetParentChild(v).push(v.doc_id) : null

conf.modalDisplay = { display: null }

conf.adn = { cr: {} }
conf.adn.cr.tree = { r: {}, l: {}, }
conf.adn.cr.tree.urlGo = () => window.location.href = '#!/tree_' + conf.adn.cr.tree.url()
conf.adn.cr.tree.url = () => singlePage.session.tree.l.id.join('_') + ',' + singlePage.session.tree.r.id.join('_')

conf.adn.cr.tree.r.plus = id => lFn.plus(singlePage.session.tree.r.id, id) && conf.adn.cr.tree.urlGo()
conf.adn.cr.tree.l.plus = id => lFn.plus(singlePage.session.tree.l.id, id) && conf.adn.cr.tree.urlGo()

conf.adn.cr.tree.r.minus = id => lFn.minus(singlePage.session.tree.r.id
    , singlePage.session.tree.r.id.indexOf(id)) && conf.adn.cr.tree.urlGo()
conf.adn.cr.tree.l.minus = id => lFn.minus(singlePage.session.tree.l.id
    , singlePage.session.tree.l.id.indexOf(id)) && conf.adn.cr.tree.urlGo()

conf.adn.cr.tree.r.parent = id => lFn.parent(singlePage.session.tree.r.id, id) && conf.adn.cr.tree.urlGo()
conf.adn.cr.tree.l.parent = id => lFn.parent(singlePage.session.tree.l.id, id) && conf.adn.cr.tree.urlGo()

conf.adn.cr.tree.r.up = id => lFn.up(singlePage.session.tree.r.id
    , singlePage.session.tree.r.id.indexOf(id)) && conf.adn.cr.tree.urlGo()
conf.adn.cr.tree.l.up = id => lFn.up(singlePage.session.tree.l.id
    , singlePage.session.tree.l.id.indexOf(id)) && conf.adn.cr.tree.urlGo()
conf.adn.cr.tree.r.dn = id => lFn.dn(singlePage.session.tree.r.id
    , singlePage.session.tree.r.id.indexOf(id)) && conf.adn.cr.tree.urlGo()
conf.adn.cr.tree.l.dn = id => lFn.dn(singlePage.session.tree.l.id
    , singlePage.session.tree.l.id.indexOf(id)) && conf.adn.cr.tree.urlGo()

const lFn = {}
lFn.parent = (ids, id) => ids.includes(conf.eMap[id].parent) && lFn.minus(ids, ids.indexOf(id)) ||
    (ids[ids.indexOf(id)] = conf.eMap[id].parent)
lFn.minus = (ids, p) => ids.splice(p, 1)
lFn.plus = (ids, id) => !ids.includes(id) && ids.splice(0, 0, ids.indexOf(id) > 0 ? ids
    .splice(ids.indexOf(id), 1)[0] : id)
lFn.dn = (ids, p) => (p + 1 == ids.length) && ids.splice(0, 0, ids.splice(ids.length - 1, 1)[0])
    || ([ids[p], ids[p + 1]] = [ids[p + 1], ids[p]])
lFn.up = (ids, p) => (p == 0 && ids.splice(ids.length, 0, ids.splice(0, 1)[0])
    || ([ids[p - 1], ids[p]] = [ids[p], ids[p - 1]]))

// Get sql from our name
const pathValue = (o, a) => a.length == 0 ? o : pathValue(o[a.shift()], a),
    firstFunctionObj = (o, a) => a[0].includes('(') ? o[a[0].split('(')[0]] : a.length == 0 ? o : firstFunctionObj(o[a.shift()], a),
    firstFunctionName = a => a[0].includes('(') ? a[0].split('(')[0] : a.length == 0 ? null : a.shift() && firstFunctionName(a)

// Named structured SQL to native SQL
const replaceSql = sql => {

    while (sql.includes(':fn_sql_app.')) {
        const sql_fnStr = sql.split(':fn_sql_app.')[1].split(' ')[0]
        let sql_fnPath = sql_fnStr.split('.')
        const fnName = firstFunctionName(sql_fnPath)
        // console.log(sql_fnStr, fnName)
        const fnParamsStr = sql_fnStr.split(fnName + '(')[1].split(')')[0]
        // console.log(sql_fnStr, fnName, '\n-fn(PARAMS)->\n', fnParamsStr)
        sql_fnPath = sql_fnStr.split('.')
        // console.log(sql_fnStr, sql_fnPath, 1)
        const fnObj = firstFunctionObj(sql_app[sql_fnPath.shift()], sql_fnPath)
        sql_fnPath = fnParamsStr.split('.')
        // console.log(sql_fnPath)
        const fnParamObj = pathValue(sql_app[sql_fnPath.shift()], sql_fnPath)
        // console.log(fnObj, fnParamObj)
        let fnSql = fnObj(fnParamObj)
        sql = sql.replace(':fn_sql_app.' + sql_fnStr, fnSql)
        // console.log(sql)
    }

    while (sql.includes(':var_sql_app.')) {
        const sql_varName = sql.split(':var_sql_app.')[1].split(' ')[0],
            sql_varPath = sql_varName.split('.'),
            sql_varVal = pathValue(sql_app[sql_varPath.shift()], sql_varPath)
        // console.log(sql_varName, '=', sql_varVal)
        sql = sql.replace(':var_sql_app.' + sql_varName, sql_varVal)
    }

    while (sql.includes(':sql_app.')) {
        let sql_name = sql.split(':sql_app.')[1].split(' ')[0]
        // console.log(sql_name)
        let sql_inner = readSql2R(sql_name)
        sql = sql.replace(':sql_app.' + sql_name, sql_inner)
    }
    return '' + sql
}

const readSql2R = sqlN => sql_app[sqlN] && replaceSql(sql_app[sqlN].sql)

const buildSqlWithKeyValue = (sqlName, key, value) => {
    let sql = readSql2R(sqlName)
    if (key && value) {
        // const whereDocAlias = sql_app[sqlName].whereDocAlias ?
        //     (sql_app[sqlName].whereDocAlias + '.') : ''
        // sql += ' WHERE ' + whereDocAlias + key + ' = ' + value
        sql = 'SELECT * FROM (' + sql + ') x WHERE ' + key + ' = ' + value
    }

    if (sql_app[sqlName] && sql_app[sqlName].oderBy) sql += ' ORDER BY ' + sql_app[sqlName].oderBy
    return sql
}

class AmSqlHtml {
    constructor($compile) {
        this.link = (s, e) => {
            let sqlE = sql_app[conf.sqlKeyName]
            if (sqlE.sqlHtml)
                if (sqlE.sqlHtml[s.k] != null) {
                    e.html(sqlE.sqlHtml[s.k])
                    $compile(e.contents())(s)
                }
        }
    }
    restrict = 'A'
}

class RWDataFactory {
    constructor($http, $q) { this.$http = $http; this.$q = $q }
    urlSql = '/r/url_sql_read_db1'
    // sqlRowLimit = 50
    sqlRowLimit = 100

    httpPostSql = params => {
        let deferred = this.$q.defer()

        this.$http.post(this.urlSql, params
        ).then(response => deferred.resolve(response.data)
            , response => console.error(response.status)
        )

        return deferred.promise
    }

    httpGetSql = params => {
        let deferred = this.$q.defer()
        if (params.sql) {
            if (params.limit) sqlRowLimit = params.limit
            params.sql = params.sql + ' LIMIT ' + this.sqlRowLimit
            this.$http.get(this.urlSql, { params: params }
            ).then(response => deferred.resolve(response.data)
                , response => console.error(response.status)
            )
        } else deferred.resolve({ hello: 'Hello World! no SQL' })
        return deferred.promise
    }
    // deferred.reject(response.status)
    // https://metanit.com/web/angular/3.3.php

}
console.log(123, "RWDataFactory")
console.log(RWDataFactory)
app.factory("dataFactory", RWDataFactory)
