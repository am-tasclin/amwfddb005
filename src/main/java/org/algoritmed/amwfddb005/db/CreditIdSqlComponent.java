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

    /**
     * On MASTER DB
     * 
     * @param clientDbId
     * @return
     */
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
        Map m = getList1_0(data);
        Map m2 = restartSequence(m.get("to_id"));
        data.put("masterSequence", m2);
        return data;
    }

    public Map getList1_0(Map<String, Object> data) {
        Map m = (Map) ((List) data.get("list1")).get(0);
        return m;
    }

    private Map restartSequence(Object newSequenceId) {
        String sql2 = env.getProperty("sql_app.RESTART_SEQUENCE");
        sql2 = sql2.replace(":restart", "" + newSequenceId);
        Map m2 = new HashMap<>();
        m2.put("restart", newSequenceId);
        m2.put("sql", sql2);
        logger.info("--36--\n" + m2);
        writeReadSQL(m2);
        return m2;
    }

    public Map<String, Object> test01(long clientDbId) {
        String sql = env.getProperty("sql_app.SELECT_master_client");
        logger.info("-15- " + clientDbId + "\n " + sql);
        List l = qForList(sql, Map.of("clientDbId", clientDbId, "x", "2"));
        logger.info("-21- " + incrementAtomicInteger.getAsInt() + "\n" + l.get(0));
        return null;
    }

    /**
     * On CLIENT DB
     * 
     * @param data0Map
     * @return
     */
    public Map<String, Object> postClientIdCreditFromMaster(Map data0Map) {
        String sql = env.getProperty("sql_app.INSERT_ClientIdCreditFromMaster");
        data0Map.put("sql", sql);
        writeReadSQL(data0Map);
        logger.info("-72- " + data0Map);
        Map m2 = restartSequence(data0Map.get("from_id"));
        data0Map.put("clientSequence", m2);
        return data0Map;
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

    public Map masterCreditIdMap(Map<String, Object> data) {
        String sql = env.getProperty("sql_app.SELECT_isMasterId");
        // logger.info("\n -125- " + sql + "\n -123- " + data);
        logger.info("\n -125- " + sql);
        Map m = dbJdbcTemplate.queryForMap(sql);
        logger.info("\n -129- " + m.get("ismasterid") + "\n -127- " + m);
        return m;
    }

    public void writeReadMasterCreditId(Map<String, Object> data) {
        logger.info("\n -128- " + data);
        Map<String, Object> map = this.restTemplate.postForObject(
                API_BASE_URL + "/r/writeReadSQL",
                data, Map.class);
        logger.info("\n -128- " + map);

    }
}
