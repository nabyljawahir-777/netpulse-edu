package com.netpulse.engine;

import java.util.regex.Pattern;

/**
 * Network Simulation Engine (Subnetting, IP Calculation, ICMP, Routing)
 * Written in Java for Assignment 5 - NetPulse Edu.
 */
public class NetworkSimulationEngine {

    private static final Pattern IPV4_PATTERN = Pattern.compile(
            "^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
    );

    /**
     * Validates if string is a valid IPv4 address
     */
    public static boolean isValidIPv4(String ip) {
        if (ip == null || ip.trim().isEmpty()) return false;
        return IPV4_PATTERN.matcher(ip.trim()).matches();
    }

    /**
     * Converts dotted decimal IP string to 32-bit integer
     */
    public static long ipToLong(String ip) {
        String[] octets = ip.split("\\.");
        long result = 0;
        for (int i = 0; i < 4; i++) {
            result |= (Long.parseLong(octets[i]) << (24 - (8 * i)));
        }
        return result & 0xFFFFFFFFL;
    }

    /**
     * Converts CIDR prefix (e.g., 24) to Subnet Mask string (e.g. 255.255.255.0)
     */
    public static String cidrToMask(int prefix) {
        if (prefix < 0 || prefix > 32) return "255.255.255.0";
        long mask = (0xFFFFFFFFL << (32 - prefix)) & 0xFFFFFFFFL;
        return String.format("%d.%d.%d.%d",
                (mask >> 24) & 0xFF,
                (mask >> 16) & 0xFF,
                (mask >> 8) & 0xFF,
                mask & 0xFF
        );
    }

    /**
     * Checks if two IPv4 addresses belong to the same subnet given a subnet mask
     */
    public static boolean isSameSubnet(String ip1, String ip2, String mask) {
        if (!isValidIPv4(ip1) || !isValidIPv4(ip2) || !isValidIPv4(mask)) {
            return false;
        }
        long ip1Long = ipToLong(ip1);
        long ip2Long = ipToLong(ip2);
        long maskLong = ipToLong(mask);

        return (ip1Long & maskLong) == (ip2Long & maskLong);
    }

    /**
     * Calculates usable hosts for a given CIDR
     */
    public static int getUsableHosts(int cidr) {
        if (cidr >= 31) return 0;
        return (int) Math.pow(2, 32 - cidr) - 2;
    }
}
