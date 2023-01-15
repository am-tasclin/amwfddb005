package org.algoritmed.amwfddb005.db;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class CreditIdSqlComponent extends ExecuteSqlBlock {
    protected static final Logger logger = LoggerFactory.getLogger(CreditIdSqlComponent.class);
    RestTemplate restTemplate = new RestTemplate();
    private static final String API_BASE_URL = "http://localhost:8002";
    // private static final String API_BASE_URL = "http://localhost:8005";

    public Map<String, Object> generateCreditId(long clientDbId) {
        String sql = env.getProperty("sql_app.INSERT_masterForClientIdCredit");
        sql += "; " + env.getProperty("sql_app.SELECT_generateCreditId");
        // Map<String, Object> data = Map.of("clientDbId", clientDbId, "sql", sql);
        Map<String, Object> data = new HashMap<>();
        data.put("clientDbId", clientDbId);
        data.put("increment", 3);
        data.put("sql", sql);
        logger.info("--23--", data);
        writeReadSQL(data);
        Map m = (Map) ((List) data.get("list1")).get(0);
        String sql2 = "; " + env.getProperty("sql_app.RESTART_SEQUENCE");
        Map m2 = new HashMap<>();
        m2.put("restart", m.get("to_id"));
        m2.put( "sql", sql2);
        data.put("m2", m2);
        logger.info("--32--", m2);
        writeReadSQL(m2);
        return data;
    }

    public Map<String, Object> test01(long clientDbId) {
        String sql = env.getProperty("sql_app.SELECT_master_client");
        logger.info("-15- " + clientDbId + "\n " + sql);
        List l = qForList(sql, Map.of("clientDbId", clientDbId, "x", "2"));
        logger.info("-21- " + incrementAtomicInteger.getAsInt() + "\n" + l.get(0));
        return null;
    }

    public Map<String, Object> postClientIdCreditFromMaster(Map data) {
        String sql = env.getProperty("sql_app.INSERT_ClientIdCreditFromMaster");
        data.put("sql", sql);
        writeReadSQL(data);
        return data;
    }

    public Map<String, Object> postMasterCreditIdGenerate(long clientDbId) {
        Map<String, Object> map = this.restTemplate.postForObject(API_BASE_URL + "/r/creditid_generate/" + clientDbId,
                null,
                Map.class);
        return map;
    }

    public long getSelfDbId() {
        String sql = "SELECT doc_id FROM doc d1 WHERE d1.reference=376504";
        // 376504 = [376504] ⚛ self | this ⚛ code:: (r:373545)
        Long l = dbJdbcTemplate.queryForObject(sql, Long.class);
        return l;
    }

    public static void main(String[] args) {
        String s = "2023-01-15T16:04:53.320+00:00";
        System.out.println(s);
        System.out.println(s.substring(0, 23));
        Timestamp ts = Timestamp.valueOf(s.substring(0, 23).replace("T", " "));
        System.out.println(ts);
    }
}
