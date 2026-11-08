package com.netpulse.service;

import java.time.Instant;

/**
 * AssignmentEvaluatorService - Evaluates student network configuration submissions.
 * Part of Assignment 5 - Nabyl Jawahir (20250040073)
 */
public class AssignmentEvaluatorService {

    public static String evaluateSampleAssignment() {
        return "{"
                + "\"course\":\"Infrastruktur Jaringan & Administrasi Server\","
                + "\"student\":\"Nabyl Jawahir\","
                + "\"nim\":\"20250040073\","
                + "\"labTitle\":\"Cisco Router-on-a-Stick & VLAN Trunking\","
                + "\"score\":100,"
                + "\"grade\":\"A\","
                + "\"evaluatedBy\":\"NetPulse Java Evaluator Core\","
                + "\"timestamp\":\"" + Instant.now().toString() + "\","
                + "\"criteria\":["
                + "  {\"name\":\"Router Sub-interface dot1Q Configuration\",\"status\":\"PASSED\",\"points\":35},"
                + "  {\"name\":\"Switch 802.1Q Trunk Port\",\"status\":\"PASSED\",\"points\":35},"
                + "  {\"name\":\"Default Gateway & DHCP Verification\",\"status\":\"PASSED\",\"points\":30}"
                + "]"
                + "}";
    }
}
