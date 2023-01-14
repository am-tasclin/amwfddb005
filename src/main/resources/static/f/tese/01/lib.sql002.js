class RWADN01DataFactory extends RWDataFactory {
    constructor($http, $q) { super($http, $q) }
    readSql = (sql, fn) => this.httpGetSql({ sql: sql }).then(fn)
    writeSql = (sql, fn) => this.httpPostSql({ sql: sql }).then(fn)
}; app.factory('dataFactory', RWADN01DataFactory)

// const singlePage = {}, conf = {}, sql_app = {}
// const conf = {} // see lib-init.js

// var app = angular.module("app", ['ngRoute', 'ngResource', 'ngSanitize'])
// angular.element(() => angular.bootstrap(document, ['app']))

// class AbstractController { singlePage = singlePage; conf = conf; getSql = sql => sql_app[sql] }

// let readSql2R = sqlN => replaceSql(sql_app[sqlN].sql)
// let replaceSql = sql => {
//     while (sql.includes(':sql_app.')) {
//         let sql_name = sql.split(':sql_app.')[1].split(' ')[0]
//         let sql_inner = readSql2R(sql_name)
//         sql = sql.replace(':sql_app.' + sql_name, sql_inner)
//     }
//     return '' + sql
// }

class SqlAbstractController extends AbstractController {
    dataFactory
    constructor(dataFactory) {
        super()
        this.dataFactory = dataFactory
    }
}

SqlAbstractController.getChoisedListItem =
    () => !sql_app.simpleSQLselect ? '' :
        sql_app.simpleSQLs[sql_app.simpleSQLselect].choisedListItem

// app.controller("SqlController", SqlController)
class SqlController extends SqlAbstractController {
    constructor(dataFactory, $routeParams) {
        super(dataFactory)
        conf.sqlKeyName = $routeParams.sql
        console.log(conf.sqlKeyName, sql_app[conf.sqlKeyName].limit)
        let sql = readSql2R(conf.sqlKeyName)
        if (Object.keys($routeParams).includes('key'))
            sql = 'SELECT * FROM (' + sql + ') x WHERE ' + $routeParams.key + ' = ' + $routeParams.val
        // console.log('SqlController \n', Object.keys($routeParams), sql)
        conf.sql = sql
        let ctrl = this
        dataFactory.httpGetSql({ sql: sql, limit: sql_app[conf.sqlKeyName].limit })
            .then(dataSqlRequest => {
                ctrl.data = dataSqlRequest
                console.log(ctrl.data)
            })
    }
    sql_app = sql_app
}

// app.factory("dataFactory", DataFactory)
class DataFactory {
    urlSql = '/r/url_sql_read_db1'
    constructor($http, $q, $resource) {
        this.httpGetSql = params => {
            let deferred = $q.defer()
            let limit = 50
            if (params.limit) limit = params.limit
            params.sql = params.sql + ' LIMIT ' + limit
            $http.get(this.urlSql, { params: params })
                .then(response => deferred.resolve(response.data)
                    , response => {
                        console.log(response.status)
                        // deferred.reject(response.status)
                        // https://metanit.com/web/angular/3.3.php
                    })
            return deferred.promise
        }
        return this
    }
}

// FHIR element name to FHIR element_id
const name2id = n => n.toLowerCase() + '_id'
// Add element to element_id to element map.
const addEMap = (l, n) => l.forEach(e => conf.eMap[e[name2id(n)]] = e)

singlePage.Url = () => window.location.href.split('#!')[1]
// console.log(singlePage.Url())
// singlePage.PseudoREST = singlePage.Url
singlePage.UrlList = () => singlePage.Url().split('/')
// singlePage.PseudoRESTKey = key => singlePage.UrlList().filter(w => w.includes(key))

singlePage.UrlParams = () => singlePage.Url().includes('?') ? singlePage.Url().split('?')[1].split('&') : []
singlePage.UrlParamKey = (key) => singlePage.UrlParams().filter(word => word.includes(key + '='))
singlePage.UrlParamKeyValue = (key) => singlePage.UrlParamKey(key).length > 0 ? singlePage.UrlParamKey(key)[0].split('=')[1] : ''

singlePage.FirstUrl = () => singlePage.Url() ? singlePage.Url().split('/')[1] : ''
// singlePage.FirstUrlTag = () => singlePage.FirstUrl().split('_')[0]
singlePage.FirstUrlId = () => singlePage.FirstUrl().split('_')[1]

// singlePage.LastUrl = () => singlePage.Url() ? singlePage.Url().split('/')[singlePage.Url().split('/').length - 1] : ''
// singlePage.LastUrlTag = () => singlePage.LastUrl().split('_')[0]
// singlePage.LastUrlId = () => singlePage.LastUrl().split('_')[1]

singlePage.UrlOnOff = (s, p) => singlePage.Url().includes(s)
    ? singlePage.UrlList().slice(0, p).join('/')
    : singlePage.UrlList().slice(0, p).concat([s]).join('/')
// singlePage.UrlOnOff = s => singlePage.Url().includes(s)?singlePage.Url().replace(s,''):(singlePage.Url()+s)

const urlMap = {}
singlePage.UrlMap = () => {
    // if (Object.keys(urlMap).length === 0)
    singlePage.Url().split('/').forEach(v => {
        if (v)
            urlMap[v.split('_')[0]] = v.replace(v.split('_')[0] + '_', '')
    })
    return urlMap
}

conf.sqlAppToLink = text =>
    !text ? '' : ('' + text).replace(new RegExp(':(sql_app\\.)(\\w+)', 'gi'), ':<b>$1<a href="#!/sql/$2">$2</a></b>')
conf.sqlAppToLink2 = text =>
    !text ? '' : ('' + text).replace(new RegExp(':(sql_app\\.)(\\w+)', 'gi'), ':<b>$1<a href="#!/sql_$2">$2</a></b>')

conf.sqlAppKeys = () => Object.keys(sql_app)
conf.modalDisplay = { display: null }

// app.config(RouteProviderConfig)
class RouteProviderConfig {
    constructor($routeProvider) {
        console.log('RouteProviderConfig', Object.keys(singlePage))
        angular.forEach(singlePage, (v, k) => {
            if (v.controller) {
                if (!v.controllerAs) v.controllerAs = 'ctrl'
                // console.log(k)
                $routeProvider.when("/" + k, v)
            }
        })
        if (singlePage.index_template)
            $routeProvider.otherwise({ templateUrl: singlePage.index_template })
        else
            $routeProvider.otherwise({ template: "<h1>?</h1><p>Hi API</p>" })
    }
}

class RouteProviderFHIRConfig {
    constructor($routeProvider) {
        console.log('RouteProviderConfig')
        let rpo = key => {
            let rpo = {
                templateUrl: '/f/sql/04/ResourceFHIR.html',
                controllerAs: 'ctrl',
            }
            rpo.controller = 'InitFHIResourceController'
            if (conf.FHIR[key].controller)
                rpo.controller = conf.FHIR[key].controller
            return rpo
        }
        let kIdREST = (pref, k) => {
            let kElId = k + '_:' + k + '_id'
            // console.log(k, kElId)
            $routeProvider.when(pref + "/" + kElId, rpo(k))
            return kElId
        }
        angular.forEach(conf.FHIR, (v, k1) => {
            // console.log(k1)
            $routeProvider.when('/' + k1, rpo(k1))
            let k1Id = kIdREST('', k1)
            angular.forEach(conf.FHIR[k1].children, (k2) => {
                $routeProvider.when('/' + k1 + '/' + k2, rpo(k2))
                $routeProvider.when('/' + k1Id + '/' + k2, rpo(k2))
                let k12Id = kIdREST('/' + k1Id, k2)
                angular.forEach(conf.FHIR[k2].children, (k3) => {
                    $routeProvider.when("/" + k1 + '/' + k2 + '/' + k3, rpo(k3))
                    $routeProvider.when('/' + k1Id + '/' + k12Id + '/' + k3, rpo(k3))
                    let k123Id = kIdREST('/' + k1Id + '/' + k12Id, k3)
                })
            })
        })
    }
}
