package org.algoritmed.amwfddb005.rest;

import java.sql.Timestamp;
import java.util.Map;
import java.util.List;

import org.algoritmed.amwfddb005.db.CreditIdSqlComponent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("r")
public class CreditIdRest {
    protected static final Logger logger = LoggerFactory.getLogger(CreditIdRest.class);

    protected @Autowired CreditIdSqlComponent creditIdSqlComponent;

    @PostMapping("creditid_generate/{clientDbId}")
    public Map<String, Object> creditidGenerate(@PathVariable Long clientDbId) {
        Map<String, Object> m = Map.of("clientDbId", clientDbId, "p3", "p3value");
        logger.info("--32-- " + m);
        return creditIdSqlComponent.generateCreditId(clientDbId);
    }

    @GetMapping("creditid_ask")
    public Map<String, Object> creditid_ask() {
        long selfDbId = creditIdSqlComponent.getSelfDbId();
        logger.info("--38-- " + selfDbId);
        Map<String, Object> map = creditIdSqlComponent.postMasterCreditIdGenerate(selfDbId);
        // List l = ((List) map.get("list1")).get(0);
        Map m = (Map)((List) map.get("list1")).get(0);
        m.put("ts2", Timestamp.valueOf(((String)m.get("ts")).substring(0,23).replace("T", " ")));
        logger.info("--35-- " + m);
        creditIdSqlComponent.postClientIdCreditFromMaster(m);
        logger.info("--40-- " + m);
        return map;
    }

    // @GetMapping("test01")
    // HttpEntity<Map<String, Object>> test01() {
    // Map m = Map.of("m", "m", "m2", 2);
    // return creditIdService.test01(m);
    // }

    // @GetMapping("test02")
    // Map<String, Object> test02() {
    // Map m = Map.of("m", "clientDbId", "x", "2", "m2", (long) 2);
    // return creditIdService.creditid_ask((Long) m.get("m2"));
    // }

    // protected @Autowired CreditIdService creditIdService;


    // @GetMapping("creditid_ask/{selfDbId}")
    // public Map<String, Object> creditid_ask(@PathVariable Long selfDbId) {
    //     return Map.of("H","ello","W","orld!");
    // }
    

}
