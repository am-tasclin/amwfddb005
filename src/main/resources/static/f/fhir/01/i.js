'use strict'
class InitPageController extends AbstractController {
    constructor(dataFactory, pageLogic) {
        super(dataFactory)
        this.pl = pageLogic
    }
}; app.controller('InitPageController', InitPageController)

conf.containNumer = str => /\d/.test(str)
const readSql = 'DomainResource01 BackboneElement01 BackboneElement02 \n\
Element01 Resource01 CanonicalResource01 MetadataResource01 \n\
Logical01 Definition01 Event01 Request01'.split(/\s+/)

session.reList = 'MetadataResource01 CanonicalResource01 Resource01 DomainResource01 BackboneElement02 BackboneElement01 Element01'.split(/\s+/)
session.patternList = 'Logical01 Definition01 Event01 Request01'.split(/\s+/)

session.sumListLength = (arrayListNames, sum) => {
    ar.forEach(arrayListNames, listName => sum += session[listName] ? session[listName].length : 0)
    return sum
}

const men = {}
men.u = 'Info'

class PageLogicFactory extends PageLogic0Factory {
    constructor(dataFactory) {
        super(dataFactory)
        this.men = men
        dataFactory.sqlRowLimit = 200

        ar.forEach([4], e => console
            .log(readSql[e], '\n', sql_app[readSql[e]].sql))

        ar.forEach(readSql, n => dataFactory.readSql(sql_app[n].sql
            , r => session[n] = r.list))

        this.show_am002l = () => {
            console.log(1123, sql_app)
            men.Info = { carePlan: {} }
            // let sql_ifsQuantity = sql_app2.goal01.ifsQuantity.sql + sql_parent
            console.log(sql_app.goal01.carePlan.sql)
            dataFactory.readSql(sql_app.goal01.carePlan.sql, r1 => {
                men.Info.carePlan.list = r1.list
                let sql_add_AND = ' AND d1id = ' + r1.list[0].doc_id
                    , sql = replaceSql(sql_app.carePlan_activity.sql)
                    , sql3 = replaceSql(sql_app.carePlan_activity_mr_dosageInstruction_doseQuantity001.sql)
                dataFactory.readSql(sql + sql_add_AND
                    , r2 => men.Info.carePlan_activity = { list: r2.list })
                dataFactory.readSql(sql3 + sql_add_AND
                    , r2 => men.Info.dosageInstruction_doseQuantity = { list: r2.list })
            })
            dataFactory.readSql(sql_app.goal01.sql, r1 => {
                men.Info.list = r1.list
                let sql_add_AND = ' AND d1.parent = ' + r1.list[0].doc_id
                console.log(sql_add_AND)
                dataFactory.readSql(sql_app.goal01.ifsQuantity.sql + sql_add_AND
                    , r2 => ar.forEach(r1.list, r1Item => r1Item.ifsQuantity_list = r2.list))
                dataFactory.readSql(sql_app.goal01.ifs.sql + sql_add_AND
                    , r2 => ar.forEach(r1.list, r1Item => r1Item.ifs_list = r2.list))
            })
        }
        this.show_am002l()
    }

}; app.factory('pageLogic', PageLogicFactory)

// const sql_app2 = {}

sql_app.doseQuantity = {
    sql: 'SELECT s1.value qy_value, s2.value qy_code, d2.* FROM doc d1 \n\
    LEFT JOIN string s1 ON s1.string_id=d1.doc_id \n\
    LEFT JOIN doc d2 ON d2.parent=d1.doc_id AND d2.reference=368641 \n\
    LEFT JOIN string s2 ON s2.string_id=d2.reference2 \n\
    WHERE d1.reference=368637 ',
}

sql_app.carePlan_activity001 = {
    sql: 'SELECT d1.parent d1id, d2.* FROM doc d1 \n\
    LEFT JOIN doc d2 ON d2.parent=d1.doc_id AND d2.reference=368794 \n\
    WHERE d1.reference=368789 ', 
    // 368789=CarePlan.activity, 
    // 368794=CarePlan.activity.plannedActivityReference
}

sql_app.madicationRequest_medication_dosageInstruction001 = {
    sql:'SELECT d2.doc_id d2id, d1.* FROM (:sql_app.madicationRequest_medication001 ) d1 \n\
    LEFT JOIN doc d2 ON d2.parent=d1.doc_id AND d2.reference=369984 \n\
    WHERE TRUE ',
    // 369984=MedicationRequest.dose.dosageInstruction
}

sql_app.madicationRequest_medication001 = {
    sql: 'SELECT d1.* FROM doc d1 WHERE d1.reference=371469',
    // 371469=MedicationRequest.medication
}

sql_app.madicationRequest001 = {
    sql: 'SELECT s1.value mr_medication, d1.* \n\
    FROM (:sql_app.madicationRequest_medication001 ) d1 \n\
    LEFT JOIN string s1 ON s1.string_id=reference2 \n\
    WHERE TRUE ',
}

sql_app.carePlan_activity_mr_dosageInstruction_doseQuantity001 = {
    sql:'SELECT d1.d1id, d1.doc_id plannedActivityReference_id, d4.* FROM (:sql_app.carePlan_activity ) d1 \n\
    LEFT JOIN (:sql_app.madicationRequest_medication_dosageInstruction001 ) d2 ON d2.doc_id=d1.reference2 \n\
    LEFT JOIN doc d3 ON d3.parent=d2.d2id AND d3.reference=369975 \n\
    LEFT JOIN (:sql_app.doseQuantity ) d4 ON d4.parent=d3.reference2 \n\
    WHERE TRUE ',
    // 369975 = Dosage.doseAndRate.dose.doseQuantity
}

sql_app.carePlan_activity = {
    sql: 'SELECT d3.mr_medication, d2.* FROM (:sql_app.carePlan_activity001 ) d2 \n\
    LEFT JOIN (:sql_app.madicationRequest001 ) d3 ON d2.reference2=d3.doc_id \n\
    WHERE TRUE ',
}

sql_app.goal01 = {
    name: 'if view',
    carePlan: {
        sql: 'SELECT s1.value careplan_title, d1.* FROM doc d1 \n\
        LEFT JOIN string s1 ON s1.string_id=d1.doc_id \n\
        WHERE d1.reference=372080 \n\
        AND d1.parent=376395 ',
    },
    ifsQuantity: {
        sql: 'SELECT s2r2.value quantity_comparator, s2.value detailQuantity_value, s1.value measure_code, s3.value measure_display, d3.* FROM doc d1 \n\
        LEFT JOIN string s1 ON s1.string_id=d1.reference2 \n\
        LEFT JOIN doc d3 ON d3.parent=d1.reference2 AND d3.reference=373547 \n\
        LEFT JOIN string s3 ON s3.string_id=d3.doc_id \n\
        , doc d2 \n\
        LEFT JOIN string s2 ON s2.string_id=d2.doc_id \n\
        LEFT JOIN string s2r2 ON s2r2.string_id=d2.reference2 \n\
        WHERE d1.reference=372951 AND d2.reference=373010 AND d2.parent=d1.doc_id',
    },
    ifs: {
        sql: 'SELECT s1.value  addresses_code , s2.value  addresses_display, d2.* FROM doc d1 \n\
        LEFT JOIN string s1 ON s1.string_id=d1.reference2 \n\
        LEFT JOIN doc d2 ON d2.parent=d1.reference2 AND d2.reference=373547 \n\
        LEFT JOIN string s2 ON s2.string_id=d2.doc_id \n\
        WHERE d1.reference=373031 '
    },
    sql: 'SELECT s1.value goal_note_anotation_text, d1.* FROM doc d1 \n\
    LEFT JOIN string s1 ON s1.string_id=d1.doc_id \n\
      WHERE d1.reference =376418',
}

sql_app.BackboneElement02 = {
    name: 'BackboneElement в атрибутах, що повторюються',
    sql: 'SELECT pps.value pps, ps.value ps, n v, d.* FROM doc dp \n\
    left join string pps on pps.string_id=dp.parent \n\
    , doc d \n\
    left join string ps on ps.string_id=d.parent \n\
    , ( SELECT doc_id, value n FROM doc, string where string_id=doc_id AND parent = 375830 \n\
    ) aat \n\
    WHERE d.reference=aat.doc_id and dp.doc_id=d.parent \n\
    ORDER BY n, ps.value',
}

sql_app.BackboneElement01 = {
    name: 'BackboneElement в атрибутах унікальні',
    sql: 'SELECT ps.value ps, s.value v, d.* FROM doc d \n\
    LEFT JOIN string s ON s.string_id=d.doc_id \n\
    LEFT JOIN string ps ON ps.string_id=d.parent \n\
    WHERE d.reference= 369784 \n\
    AND d.parent != 375830 \n\
    ORDER BY ps.value, s.value',
}

sql_app.Element01 = {
    name: 'Element',
    sql: 'SELECT s.value v, sr.value srv, d.* FROM doc d \n\
    LEFT JOIN string s ON s.string_id=d.doc_id \n\
    LEFT JOIN string sr ON sr.string_id=d.reference \n\
    WHERE   369787 in (d.reference, d.reference2) \n\
    ORDER BY s.value',
}

sql_app.Logical01 = {
    name: 'Logical',
    sql: 'SELECT value v, d.* FROM doc d \n\
    LEFT JOIN string ON string_id=d.doc_id \n\
    WHERE d.reference = 369796 \n\
    ORDER BY value',
}
sql_app.MetadataResource01 = {
    name: 'MetadataResource',
    sql: 'SELECT value v, d.* FROM doc d \n\
    LEFT JOIN string ON string_id=d.doc_id \n\
    WHERE d.reference = 369795 \n\
    ORDER BY value',
}

sql_app.Request01 = {
    name: 'Request::Pattern в ресурсах і атрибутах',
    sql: 'SELECT s.value v, sr.value srv, d.* FROM doc d \n\
    LEFT JOIN string s ON s.string_id=d.doc_id \n\
    LEFT JOIN string sr ON sr.string_id=d.reference \n\
    WHERE d.reference2 = 369767 \n\
    ORDER BY s.value',
}

sql_app.Event01 = {
    name: 'Event::Pattern в ресурсах і атрибутах',
    sql: 'SELECT s.value v, sr.value srv, d.* FROM doc d \n\
    LEFT JOIN string s ON s.string_id=d.doc_id \n\
    LEFT JOIN string sr ON sr.string_id=d.reference \n\
    WHERE d.reference2 = 369766 \n\
    ORDER BY s.value',
}

sql_app.Definition01 = {
    name: 'Definition::Pattern в ресурсах і атрибутах',
    sql: 'SELECT s.value v, sr.value srv, d.* FROM doc d \n\
    LEFT JOIN string s ON s.string_id=d.doc_id \n\
    LEFT JOIN string sr ON sr.string_id=d.reference \n\
    WHERE d.reference2 = 369778 \n\
    ORDER BY s.value',
}

sql_app.Resource01 = {
    name: 'Resource',
    sql: 'SELECT s.value v, sr.value srv, d.* FROM doc d \n\
    LEFT JOIN string s ON s.string_id=d.doc_id \n\
    LEFT JOIN string sr ON sr.string_id=d.reference \n\
    WHERE   369788 in (d.reference, d.reference2) \n\
    ORDER BY s.value',
}

sql_app.CanonicalResource01 = {
    name: 'CanonicalResource',
    sql: 'SELECT s.value v, sr.value srv, d.* FROM doc d \n\
    LEFT JOIN string s ON s.string_id=d.doc_id \n\
    LEFT JOIN string sr ON sr.string_id=d.reference \n\
    WHERE   369791 in (d.reference, d.reference2) \n\
    ORDER BY s.value',
}

sql_app.DomainResource01 = {
    name: 'DomainResource',
    sql: 'SELECT * FROM doc \n\
    LEFT JOIN string ON string_id=doc_id \n\
    WHERE reference= 369789 \n\
    ORDER BY value',
}
