/**
 * @license Algoritmed.AngularJS v0.1.023
 * (c) 2021-2022 Algoritmed Ltd. http://algoritmed.com
 * License: Apache-2.0 license 
 */
'use strict'

const ar = angular
const session = {}, conf = { eMap: {}, parentChild: {} }, singlePage = {}, sql_app = {}

var app = angular.module("app", ['ngRoute', 'ngResource', 'ngSanitize'])
angular.element(() => angular.bootstrap(document, ['app']))

class AbstractController { constructor(dataFactory) { this.dataFactory = dataFactory } }

class PageLogic0Factory {
    constructor(dataFactory) { 
        //this.dataFactory = dataFactory 
    }
    getSqlApp = name => sql_app[name]
    conf = conf; session = session; singlePage= singlePage
}

class RWData0Factory {
    constructor($http, $q) { this.$http = $http; this.$q = $q }
    urlSql = '/r/url_sql_read_db1'
    sqlRowLimit = 50

    httpPostSql = params => {
        let deferred = this.$q.defer()
        this.$http.post(this.urlSql, params)
            .then(response => deferred.resolve(response.data)
                , response => console.error(response.status))
        return deferred.promise
    }

    httpGetSql = params => {
        let deferred = this.$q.defer()
        if (params.sql) {
            if (params.limit) sqlRowLimit = params.limit
            params.sql = params.sql + ' LIMIT ' + this.sqlRowLimit
            this.$http.get(this.urlSql, { params: params })
                .then(response => deferred.resolve(response.data)
                    , response => console.error(response.status))
        } else deferred.resolve({ hello: 'Hello World! no SQL' })
        return deferred.promise
    }
    // deferred.reject(response.status)
    // https://metanit.com/web/angular/3.3.php

    readSql = (sql, fn) => this.httpGetSql({ sql: sql }).then(fn)
    writeSql = (sql, fn) => this.httpPostSql({ sql: sql }).then(fn)
}; app.factory('dataFactory', RWData0Factory)


let urlMap = {}
singlePage.Url = () => window.location.href.split('#!')[1]
singlePage.UrlMap = () => {
    if (singlePage.Url())
        if (Object.keys(urlMap).length === 0) singlePage.Url().split('/').forEach(v => {
            if (v) urlMap[v.split('_')[0]] = v.replace(v.split('_')[0] + '_', '')
        })
    return urlMap
}

const route01Controller = (controllerClass, pseudoRestList, templateUrl) => {
    const controllerName = controllerClass.toString().split(' ')[1]
    app.controller(controllerName, controllerClass)
    ar.forEach(pseudoRestList, pseidoRest => singlePage[pseidoRest] = {
        controller: controllerName, templateUrl: (templateUrl || singlePage.index_template),
    })
}
class RouteProviderConfig {
    constructor($routeProvider) {
        console.log('RouteProviderConfig', Object.keys(singlePage))
        angular.forEach(singlePage, (v, k) => (
            v.controller && $routeProvider.when("/" + k, v)))
        if (singlePage.index_template)
            $routeProvider.otherwise({ templateUrl: singlePage.index_template })
        else
            $routeProvider.otherwise({ template: "<h1>?</h1><p>Hey You, API</p>" })
    }
}; app.config(RouteProviderConfig)

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

    // let sql_app = ':sql_app'
    let sql_app = ':sql_app.'
    while (sql.includes(sql_app)) {
        let sql_name = sql.split(sql_app)[1].split(' ')[0]
        // console.log(sql_name)
        let sql_inner = readSql2R(sql_name)
        sql = sql.replace(sql_app + sql_name, sql_inner)
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
