package org.algoritmed.amwfddb005.db;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class CreditIdSqlComponent extends ExecuteSqlBlock {
    RestTemplate restTemplate = new RestTemplate();
    // private static final String API_BASE_URL = "http://localhost:8002";
    private static final String API_BASE_URL = "http://localhost:8005";

    public CreditIdSqlComponent() {
        // this.restTemplate = new RestTemplate();
    }

    public Map<String, Object> postMasterCreditIdGenerate(long clientDbId) {
        Map<String, Object> map = this.restTemplate.postForObject(API_BASE_URL + "/r/creditid_generate/" + clientDbId, null,
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
