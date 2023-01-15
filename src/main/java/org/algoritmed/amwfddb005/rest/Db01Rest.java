package org.algoritmed.amwfddb005.rest;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.algoritmed.amwfddb005.db.ExecuteSqlBlock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("r")
public class Db01Rest {
    protected static final Logger logger = LoggerFactory.getLogger(Db01Rest.class);
    

    @GetMapping("url_sql_read_db1")
    public Map<String, Object> url_sql_read_db1(@RequestParam(value = "sql", required = true) String sql,
            HttpServletRequest request) {
        // Map<String, Object> map = new HashMap<String, Object>();
        logger.info(" -32- " + executeSqlBlock.incrementAtomicInteger.getAsInt() + " GET /r/url_sql_read_db1");
        Map<String, Object> map = sqlParamToMap(request);
        List<Map<String, Object>> queryForList = executeSqlBlock.readSelect(sql, map);
        map.put("list", queryForList);
        return map;
    }

    @Transactional
    @PostMapping("url_sql_read_db1")
    public Map<String, Object> url_sql_read_db1(@RequestBody Map<String, Object> data, Principal principal) {
        logger.info(" -55- POST " + executeSqlBlock.incrementAtomicInteger.getAsInt() + " /r/url_sql_read_db1");
        String sql = (String) data.get("sql");
        executeSqlBlock.updateNewIds(sql, data);
        // System.out.println(data);
        executeSqlBlock.writeReadSQL(data);
        data.remove("sql");
        return data;
    }

    protected @Autowired ExecuteSqlBlock executeSqlBlock;

    private Map<String, Object> sqlParamToMap(HttpServletRequest request) {
        Map<String, String[]> parameterMap = request.getParameterMap();
        Map<String, Object> map = new HashMap<String, Object>();
        for (String key : parameterMap.keySet()) {
            String[] v = parameterMap.get(key);
            String val = v[0];
            map.put(key, val);
        }
        map.remove("sql");
        return map;
    }

}
