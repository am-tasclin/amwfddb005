package org.algoritmed.amwfddb005.services;

import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CreditIdService {
    
    // private static final String API_BASE_URL = "http://localhost:8002";
    private static final String API_BASE_URL = "http://localhost:8005";
    private RestTemplate restTemplate;

    HttpEntity<Map<String, Object>> creditid_generate(Long dbId) {
        return restTemplate.getForObject(API_BASE_URL + "/h3/" + dbId, HttpEntity.class);
    }

    public Map<String, Object> creditid_ask(Long dbId) {
        String string = API_BASE_URL + "/h3/" + dbId;
        return restTemplate.getForObject(string, Map.class);
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
