package org.algoritmed.amwfddb005.rest;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseBody;

@RestController
@RequestMapping("r")
public class PrincipalRest {

    @GetMapping("principal")
    public @ResponseBody Map<String, Object> principal(Principal principal) {
        // public @ResponseBody Map<String, Object> principal() {
        Map<String, Object> data = new HashMap<>();
        data.put("username", "xyz");
        return data;
    }
}
