package com.netpulse;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import com.netpulse.engine.NetworkSimulationEngine;
import com.netpulse.service.AssignmentEvaluatorService;

/**
 * NetPulse Edu - Standalone Java Backend Application
 * Compatible with IntelliJ IDEA Community, VS Code, and standard Java SE 17+
 * 
 * Developer: Nabyl Jawahir (NIM: 20250040073)
 * Subject: Infrastruktur Jaringan & Administrasi Server
 */
public class NetPulseJavaApplication {

    private static final int PORT = 8080;

    public static void main(String[] args) {
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

            // Configure HTTP Handlers
            server.createContext("/api/java/health", new HealthHandler());
            server.createContext("/api/java/ping", new PingHandler());
            server.createContext("/api/java/topology/evaluate", new EvaluateHandler());
            server.createContext("/api/java/info", new InfoHandler());

            server.setExecutor(null); // Default single-threaded or pooled executor
            System.out.println("==================================================================");
            System.out.println("   NetPulse Edu - Java Backend Server (Assignment 5 Engine)      ");
            System.out.println("   Mahasiswa : Nabyl Jawahir | NIM: 20250040073                  ");
            System.out.println("   Server URL: http://localhost:" + PORT + "/api/java/health           ");
            System.out.println("   Ready for IntelliJ IDEA Community & VS Code execution          ");
            System.out.println("==================================================================");

            server.start();
        } catch (IOException e) {
            System.err.println("Gagal memulai server Java NetPulse: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Health check endpoint
     */
    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORSHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String response = "{"
                    + "\"status\":\"online\","
                    + "\"engine\":\"Java SE 17+ (NetPulse Simulation Core)\","
                    + "\"developer\":\"Nabyl Jawahir\","
                    + "\"nim\":\"20250040073\","
                    + "\"semester\":\"3 Teknik Informatika\","
                    + "\"timestamp\":\"" + Instant.now().toString() + "\","
                    + "\"features\":[\"Subnet Mask Calculator\",\"ICMP Echo Simulator\",\"VLAN Tagging Checker\",\"DHCP Pool Leaser\"]"
                    + "}";

            sendJsonResponse(exchange, 200, response);
        }
    }

    /**
     * ICMP Echo Ping Simulator Endpoint
     */
    static class PingHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORSHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            // Simple ICMP Ping evaluation
            String query = exchange.getRequestURI().getQuery();
            Map<String, String> params = queryToMap(query);
            String srcIp = params.getOrDefault("src", "192.168.10.10");
            String destIp = params.getOrDefault("dest", "192.168.10.1");

            boolean reachable = NetworkSimulationEngine.isSameSubnet(srcIp, destIp, "255.255.255.0");
            int latency = reachable ? (int)(Math.random() * 5 + 1) : 0;

            String response = "{"
                    + "\"sourceIp\":\"" + srcIp + "\","
                    + "\"destinationIp\":\"" + destIp + "\","
                    + "\"reachable\":" + reachable + ","
                    + "\"latencyMs\":" + latency + ","
                    + "\"ttl\":64,"
                    + "\"summary\":\"" + (reachable 
                        ? "Reply from " + destIp + ": bytes=32 time=" + latency + "ms TTL=64" 
                        : "Request timed out. Destination host unreachable.") + "\""
                    + "}";

            sendJsonResponse(exchange, 200, response);
        }
    }

    /**
     * Assignment Evaluator Endpoint
     */
    static class EvaluateHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORSHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String evaluation = AssignmentEvaluatorService.evaluateSampleAssignment();
            sendJsonResponse(exchange, 200, evaluation);
        }
    }

    /**
     * Info handler detailing project tech stack
     */
    static class InfoHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORSHeaders(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String info = "{"
                    + "\"appName\":\"NetPulse Edu\","
                    + "\"languages\":[\"Java\",\"Node.js\",\"TypeScript\",\"HTML5\",\"CSS3\"],"
                    + "\"frameworks\":[\"Express.js\",\"Vite\",\"React 19\",\"Tailwind CSS\"],"
                    + "\"ideSupport\":[\"IntelliJ IDEA Community Edition\",\"VS Code\",\"WebStorm\"],"
                    + "\"version\":\"2.5.0\""
                    + "}";

            sendJsonResponse(exchange, 200, info);
        }
    }

    private static void setCORSHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String responseJson) throws IOException {
        byte[] bytes = responseJson.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    private static Map<String, String> queryToMap(String query) {
        Map<String, String> result = new HashMap<>();
        if (query == null) return result;
        for (String param : query.split("&")) {
            String[] entry = param.split("=");
            if (entry.length > 1) {
                result.put(entry[0], entry[1]);
            } else {
                result.put(entry[0], "");
            }
        }
        return result;
    }
}
