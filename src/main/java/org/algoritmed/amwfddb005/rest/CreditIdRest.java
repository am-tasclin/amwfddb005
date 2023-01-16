package org.algoritmed.amwfddb005.rest;

import java.sql.Timestamp;
import java.util.Map;

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

    /**
     * On MASTER DB
     * @param clientDbId
     * @return
     */
    @PostMapping("creditid_generate/{clientDbId}")
    public Map<String, Object> creditidGenerate(@PathVariable Long clientDbId) {
        return creditIdSqlComponent.generateCreditId(clientDbId);
    }

    @GetMapping("creditid_ask")
    public Map<String, Object> creditid_ask() {
        long selfDbId = creditIdSqlComponent.getSelfDbId();
        logger.info("--38-- " + selfDbId);
        Map<String, Object> data = creditIdSqlComponent.postMasterCreditIdGenerate(selfDbId);
        Map m = creditIdSqlComponent.getList1_0(data);
        m.put("ts2", Timestamp.valueOf(((String) m.get("ts")).substring(0, 23).replace("T", " ")));
        logger.info("--35-- " + m);
        creditIdSqlComponent.postClientIdCreditFromMaster(m);
        logger.info("--40-- " + m);
        return data;
    }

}
