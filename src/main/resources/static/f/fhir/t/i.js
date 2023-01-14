'use strict'
class InitPageController extends AbstractController {
    constructor(dataFactory, pageLogic) { super(dataFactory); this.pl = pageLogic }
}; app.controller('InitPageController', InitPageController)

const readSql = 'ValueSetTitle CodeSystemTitle'.split(/\s+/)
session.eMap = {}

class PageLogicFactory extends PageLogic0Factory {
    constructor(dataFactory) {
        super(dataFactory)
        dataFactory.sqlRowLimit = 200

        // ar.forEach([0], e => console.log(readSql[e], '\n', sql_app[readSql[e]].sql))

        dataFactory.readSql(sql_app.CodeSystemTitle.sql, r => session.CodeSystemTitle = r.list)
        dataFactory.readSql(sql_app.ValueSetTitle.sql, r => session.ValueSetTitle = r.list
            && ar.forEach(r.list, item => session.eMap[item.doc_id] = item))

        dataFactory.readSql(replaceSql(sql_app.UseValueSet.sql), r => session.UseValueSet = r.list)

        console.log(replaceSql(sql_app.UseValueSet.sql))
    }
}; app.factory('pageLogic', PageLogicFactory)

sql_app.UseValueSet = {
    name: 'Використання ValueSet в атрибутах FHIR класів',
    sql: 'SELECT c.value c, sr.value sr, srr.value srr \n\
    , vs.doc_id vs_id, d.doc_id usevs_id, dr.*, d.reference2 c_id \n\
    FROM doc p, doc d \n\
    LEFT JOIN string c ON d.reference2=c.string_id \n\
    LEFT JOIN doc dr ON dr.doc_id=d.reference \n\
    LEFT JOIN string sr ON dr.doc_id=sr.string_id \n\
    LEFT JOIN string srr ON dr.reference=srr.string_id \n\
    , (:sql_app.ValueSetTitle ) vs \n\
    WHERE vs.doc_id=p.reference2 \n\
    AND p.doc_id=d.parent',
}

sql_app.ValueSetTitle = {
    name: 'ValueSet.title',
    sql: 'SELECT s.value title, d.* FROM doc d \n\
    LEFT JOIN string s ON s.string_id=d.doc_id \n\
    WHERE d.reference = 372045',
}

sql_app.CodeSystemTitle = {
    name: 'CodeSystem.title',
    sql: 'SELECT s.value title, d.* FROM doc d \n\
    LEFT JOIN string s ON s.string_id=d.doc_id \n\
    WHERE d.reference = 373575',
}
