package org.algoritmed.amwfddb005.rest;

import java.util.HashMap;
import java.util.Map;

import org.algoritmed.amwfddb005.db.CreditIdSqlComponent;
import org.algoritmed.amwfddb005.services.CreditIdService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("r")
public class CreditIdRest {

    protected @Autowired CreditIdService creditIdService;
    protected @Autowired CreditIdSqlComponent creditIdSqlComponent;

    @PostMapping("creditid_generate/{clientDbId}")
    public Map<String, Object> creditidGenerate(@PathVariable Long clientDbId) {
        Map<String, Object> m = new HashMap<>();
        m.put("clientDbId", clientDbId);
        m.put("p3", "p3value");
        System.out.println(m);
        return m;
    }
    
    @GetMapping("creditid_ask")
    public Map<String, Object> creditid_ask() {
        long selfDbId = creditIdSqlComponent.getSelfDbId();
        System.out.println("--26- "+selfDbId);
        Map<String, Object> map = creditIdSqlComponent.postMasterCreditIdGenerate(selfDbId);
        return map;
    }


    @GetMapping("test01")
    HttpEntity<Map<String, Object>> test01() {
        Map m = new HashMap<String, Object>();
        m.put("m", "m");
        m.put("m2", 2);
        return creditIdService.test01(m);
    }

    @GetMapping("test02")
    Map<String, Object> test02() {
        Map m = new HashMap<String, Object>();
        m.put("m", "m");
        m.put("m2", 2);
        long l = 123;
        return creditIdService.creditid_ask(l);
    }

    @GetMapping("creditid_ask/{id}")
    public Map<String, Object> creditid_ask(@PathVariable Long id) {
        return creditIdService.creditid_ask(id);
    }
}
