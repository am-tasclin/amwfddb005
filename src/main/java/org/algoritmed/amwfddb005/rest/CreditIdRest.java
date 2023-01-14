package org.algoritmed.amwfddb005.rest;

import java.util.HashMap;
import java.util.Map;

import org.algoritmed.amwfddb005.services.CreditIdService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("r")
public class CreditIdRest {

    protected @Autowired CreditIdService creditIdService;

    @GetMapping("test01")
    HttpEntity<Map<String, Object>> test01() {
        Map m = new HashMap<String, Object>();
        m.put("m", "m");
        m.put("m2", 2);
        return creditIdService.test01(m);
    }

    @GetMapping("creditid_ask/{id}")
    public Map<String, Object> creditid_ask(@PathVariable Long id) {
        Map<String, Object> m = new HashMap<>();
        m.put("p1", id);
        m.put("p2", "2");
        m.put("p3", "p3value");
        System.out.println(m);
        return m;
    }

    @PostMapping("creditid_generate/{id}")
    public Map<String, Object> creditid_generate(@PathVariable Long id) {
        Map<String, Object> m = new HashMap<>();
        m.put("p1", id);
        m.put("p2", "2");
        m.put("p3", "p3value");
        System.out.println(m);
        return m;
    }

}
