package org.algoritmed.amwfddb005.db;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

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
        logger.info("-----28----- \n" + data);
        writeReadSQL(data);
        Map m = (Map) ((List) data.get("list1")).get(0);
        String sql2 = env.getProperty("sql_app.RESTART_SEQUENCE");
        sql2 = sql2.replace(":restart", "" + m.get("to_id"));
        Map m2 = new HashMap<>();
        m2.put("restart", m.get("to_id"));
        m2.put("sql", sql2);
        data.put("m2", m2);
        logger.info("--36--\n" + m2);
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
        Map m = new HashMap<>();
        m.put("x", "s");
        m.put("y", 1);
        m.put("z", 2);
        m.put("a", "2");
        // Map.of("x","s","y",1);
        logger.info("-75- " + m);
        logger.info("-75- " + m);
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        final Xy xy = objectMapper.convertValue(m, Xy.class);
        logger.info("-85- " + xy);
    }

    public static void main2(String[] args) {
        String s = "2023-01-15T16:04:53.320+00:00";
        System.out.println(s);
        System.out.println(s.substring(0, 23));
        Timestamp ts = Timestamp.valueOf(s.substring(0, 23).replace("T", " "));
        System.out.println(ts);
    }
}
