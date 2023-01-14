package org.algoritmed.amwfddb005.resttest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloResource {

   @GetMapping("/hello")
   public String sayHello() {
      return "Hello World";
   }

   @PostMapping("/h5")
   Map<String, Object> h5(@RequestBody Map<String, Object> map) {
      System.out.println(map);
      extracted01(map);
      map.put("p1", 123);
      return map;
   }

   @GetMapping("/h4/{map}")
   public Map<String, Object> h4(@PathVariable Map<String, Object> map) {
      System.out.println(map);
      extracted01(map);
      System.out.println(map.get("map"));
      return map;
   }

   private void extracted01(Map<String, Object> map) {
      System.out.println(map.keySet());
      for (String k1 : map.keySet()) {
         System.out.println(k1 + "- = -" + (map.get(k1) instanceof Map) + "--" + (map.get(k1) instanceof String));
         if (map.get(k1) instanceof Map) {
            extracted01((Map<String, Object>) map.get(k1));
         } else if (map.get(k1) instanceof List) {
            List list = (List) map.get(k1);
            System.out.println(k1 + " : " + list);
            for (Object o1 : list) {
               System.out.println(o1);
            }
         } else if (map.get(k1) instanceof String) {
            System.out.println(k1 + " : " + map.get(k1));
         }
      }
   }

   @GetMapping("/h3/{id}")
   public Map<String, Object> h3(@PathVariable Long id) {
      System.out.println(123);
      System.out.println(id);
      Map<String, Object> m = new HashMap<>();
      m.put("p1", id);
      m.put("p2", "2");
      m.put("p3", "p3value");
      System.out.println(m);
      extractedSql02(m, id);
      return m;
   }

	protected @Autowired NamedParameterJdbcTemplate dbParamJdbcTemplate;

   @GetMapping("/h2")
   public Map<String, Object> h2() {
      Map<String, Object> m = new HashMap<>();
      m.put("p2", "2");
      Long id = (long) 12;
      extractedSql02(m, id);
      return m;
   }

   private void extractedSql02(Map<String, Object> m, Long id) {
      m.put("id", id);
      String sql = "SELECT value FROM string WHERE string_id = :id";
      List<Map<String, Object>> queryForList = dbParamJdbcTemplate.queryForList(sql, m);
      String value = (String) queryForList.get(0).get("value");
      m.put("v", value);
   }

}
