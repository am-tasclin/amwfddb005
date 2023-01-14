package org.algoritmed.amwfddb005.db;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class ExecuteSqlBlock {
    protected static final Logger logger = LoggerFactory.getLogger(ExecuteSqlBlock.class);

    public List<Map<String, Object>> readSelect(String sql, Map<String, Object> map) {
        List<Map<String, Object>> queryForList = dbParamJdbcTemplate.queryForList(sql, map);
        return queryForList;
    }

    public void writeReadSQL(Map<String, Object> data) {
        String sql = (String) data.get("sql");
        int i = 0;
        for (String sql_command : sql.split(";")) {
            String sql2 = sql_command.trim();
            logger.info("--29-- i = " + i + "\n --48-- " + sql2);
            String first_word = sql2.split(" ")[0];
            if ("SELECT".equals(first_word)) {
                List<Map<String, Object>> list = dbParamJdbcTemplate.queryForList(sql2, data);
                data.put("list" + i, list);
            } else {
                int update = dbParamJdbcTemplate.update(sql2, data);
                data.put("update_" + i, update);
            }
            i++;
        }
    }

    /**
     * Підготовка SQL - Доповнення ID-шками.
     * 
     * @param sql
     * @param data
     */
    public void updateNewIds(String sql, Map<String, Object> data) {
        // System.out.println(sql);
        String[] split_nextDbId = sql.split("nextDbId");
        // System.out.println(split_nextDbId.length);
        // for (String string : split_nextDbId) System.out.println(string);
        if (split_nextDbId.length > 0) {
            Map<Integer, Integer> nextDbMap = new HashMap<>();
            for (int i = 1; i < split_nextDbId.length; i++) {
                String s2 = split_nextDbId[i].split(" ")[0];
                s2 = s2.replaceAll(",", "").replaceAll("\\)", "").replaceAll(";", "").trim();
                int nextDbKey = Integer.parseInt(s2);
                nextDbMap.put(nextDbKey, nextDbKey);
            }

            // System.out.println(nextDbMap);
            // System.out.println(UUID.randomUUID());

            for (Integer key : nextDbMap.keySet())
                data.put("nextDbId" + key, nextDbId());
            // System.out.println(data);
            if (data.containsKey("uuid") && data.get("uuid").equals("uuid"))
                data.put("uuid", UUID.randomUUID());
        }
    }

    /**
     * Генератор наступного ID единого для всієї БД.
     * 
     * @return Наступний ID единий для всієй БД.
     */
    protected Integer nextDbId() {
        Integer nextDbId;
        String sql_nextDbId = "SELECT NEXTVAL('dbid')";
        nextDbId = dbJdbcTemplate.queryForObject(sql_nextDbId, Integer.class);
        // if (dbJdbcTemplate != null) {
        // } else {
        // nextDbId = ai.incrementAndGet();
        // }
        return nextDbId;
    }

    protected @Autowired NamedParameterJdbcTemplate dbParamJdbcTemplate;
    protected @Autowired JdbcTemplate dbJdbcTemplate;

    public static void main(String[] args) {
        ExecuteSqlBlock eqb = new ExecuteSqlBlock();
        Map<String, Object> data = new HashMap<>();
        System.out.println(123);
        String sql = "INSERT INTO doc (doc_id, parent) VALUES (:nextDbId1, '371576'); "
                + " SELECT *   WHERE doc_id=:nextDbId1";
        data.put("sql", sql);
        // if (ai == null) eqb.ai = new AtomicInteger(111);
        eqb.updateNewIds(sql, data);
    }

    // static AtomicInteger ai;

}
