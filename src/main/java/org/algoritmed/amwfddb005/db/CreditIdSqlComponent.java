package org.algoritmed.amwfddb005.db;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class CreditIdSqlComponent extends ExecuteSqlBlock {
    RestTemplate restTemplate = new RestTemplate();
    // private static final String API_BASE_URL = "http://localhost:8002";
    private static final String API_BASE_URL = "http://localhost:8005";

    public Map<String, Object> test02(long clientDbId) {
        String sql = env.getProperty("sql_app.INSERT_masterForClientIdCredit");
        // Map<String, Object> data = Map.of("clientDbId", clientDbId, "sql", sql);
        Map<String, Object> data = new HashMap<>();
        data.put("clientDbId", clientDbId);
        data.put("increment", 3);
        data.put("sql", sql);
        writeReadSQL(data);
        return data;
    }

    public Map<String, Object> test01(long clientDbId) {
        String sql = env.getProperty("sql_app.SELECT_master_client");
        logger.info("-15- " + clientDbId + "\n " + sql);
        List l = qForList(sql, Map.of("clientDbId", clientDbId, "x", "2"));
        logger.info("-21- " + incrementAtomicInteger.getAsInt() + "\n" + l.get(0));
        return null;
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
}
