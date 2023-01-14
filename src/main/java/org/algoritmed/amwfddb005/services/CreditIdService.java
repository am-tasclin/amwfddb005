package org.algoritmed.amwfddb005.services;

import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CreditIdService {
    private static final String API_BASE_URL = "http://localhost:8080";
    private RestTemplate restTemplate;

    HttpEntity<Map<String, Object>> creditid_generate(Long dbId) {
        HttpEntity entity = new HttpEntity("Hello World");
        return entity;
    }

    HttpEntity<Map<String, Object>> creditid_ask(Long dbId) {
        return null;
    }

    public HttpEntity<Map<String, Object>> test01(Map m) {
        return new HttpEntity<Map<String, Object>>(m);
    }

    public CreditIdService() {
        this.restTemplate = new RestTemplate();
        // HttpHeaders headers = new HttpHeaders<Map<String, String>>();
        // headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
    }
}
