package com.netpulse;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * NetPulse Edu - Full Java Backend Server (Cisco & LMS Simulator)
 * Native Java SE 17+ Application for IntelliJ IDEA Community Edition & Microsoft Azure App Service.
 *
 * Developer: Nabyl Jawahir (NIM: 20250040073)
 * Course: Infrastruktur Jaringan & Administrasi Server
 * University: Universitas Nusa Putra (Sukabumi)
 */
public class NetPulseApplication {

    private static final int DEFAULT_PORT = 8080;

    public static void main(String[] args) {
        // Read port from PORT environment variable (Azure App Service / Container standard)
        int port = DEFAULT_PORT;
        String envPort = System.getenv("PORT");
        if (envPort != null && !envPort.trim().isEmpty()) {
            try {
                port = Integer.parseInt(envPort.trim());
            } catch (NumberFormatException e) {
                System.out.println("[WARN] Format PORT invalid, menggunakan default 8080");
            }
        }

        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

            // 1. Static HTML & CSS Frontend Handlers
            server.createContext("/", new StaticFileHandler());

            // 2. REST API Endpoints (Health, Ping, LMS Evaluation, Devices, Azure Info)
            server.createContext("/api/health", new HealthHandler());
            server.createContext("/api/ping", new PingHandler());
            server.createContext("/api/verify-topology", new VerifyHandler());
            server.createContext("/api/devices", new DevicesHandler());
            server.createContext("/api/azure/status", new AzureStatusHandler());

            server.setExecutor(null); // default executor

            System.out.println("===============================================================================");
            System.out.println("   NETPULSE EDU - FULL JAVA BACKEND SERVER                                      ");
            System.out.println("   Cisco Packet Tracer & Real-time LMS Assignment Simulator                    ");
            System.out.println("   Mahasiswa : Nabyl Jawahir | NIM: 20250040073                                ");
            System.out.println("   Teknik Informatika Semester 3 - Universitas Nusa Putra                      ");
            System.out.println("-------------------------------------------------------------------------------");
            System.out.println("   [STATUS] Running on Port: " + port);
            System.out.println("   [WEB UI] http://localhost:" + port + "/  (Pure HTML5 & CSS3 Frontend)           ");
            System.out.println("   [API]    http://localhost:" + port + "/api/health (Azure Health Probe)          ");
            System.out.println("   [ENV]    IntelliJ IDEA Community & Microsoft Azure Ready                   ");
            System.out.println("===============================================================================");

            server.start();
        } catch (IOException e) {
            System.err.println("[ERROR] Gagal menjalankan NetPulse Java Server: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Serves pure HTML and CSS frontend files from src/main/resources/static/ or classpath
     */
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path == null || path.equals("/") || path.isEmpty()) {
                path = "/index.html";
            }

            // Prevent path traversal
            if (path.contains("..")) {
                sendError(exchange, 403, "Forbidden");
                return;
            }

            // Try loading from classpath first (packaged JAR mode for Azure)
            String resourcePath = "/static" + path;
            InputStream is = NetPulseApplication.class.getResourceAsStream(resourcePath);

            // If not found in classpath, try filesystem (IntelliJ IDEA project development mode)
            byte[] fileBytes = null;
            if (is != null) {
                fileBytes = is.readAllBytes();
                is.close();
            } else {
                File file = new File("src/main/resources/static" + path);
                if (file.exists() && !file.isDirectory()) {
                    try (FileInputStream fis = new FileInputStream(file)) {
                        fileBytes = fis.readAllBytes();
                    }
                }
            }

            if (fileBytes != null) {
                String mimeType = getMimeType(path);
                exchange.getResponseHeaders().set("Content-Type", mimeType + "; charset=UTF-8");
                exchange.getResponseHeaders().set("Cache-Control", "no-cache");
                exchange.sendResponseHeaders(200, fileBytes.length);
                OutputStream os = exchange.getResponseBody();
                os.write(fileBytes);
                os.close();
            } else {
                sendError(exchange, 404, "404 Not Found: " + path);
            }
        }

        private String getMimeType(String path) {
            if (path.endsWith(".html")) return "text/html";
            if (path.endsWith(".css")) return "text/css";
            if (path.endsWith(".js")) return "application/javascript";
            if (path.endsWith(".json")) return "application/json";
            if (path.endsWith(".png")) return "image/png";
            if (path.endsWith(".svg")) return "image/svg+xml";
            if (path.endsWith(".ico")) return "image/x-icon";
            return "text/plain";
        }
    }

    /**
     * Azure App Service & Container Health Check Handler
     */
    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String response = "{"
                    + "\"status\":\"UP\","
                    + "\"service\":\"NetPulse Edu Java Backend\","
                    + "\"developer\":\"Nabyl Jawahir\","
                    + "\"nim\":\"20250040073\","
                    + "\"course\":\"Infrastruktur Jaringan (Assignment 5)\","
                    + "\"javaVersion\":\"" + System.getProperty("java.version") + "\","
                    + "\"os\":\"" + System.getProperty("os.name") + "\","
                    + "\"cloudPlatform\":\"Microsoft Azure App Service / Container Apps\","
                    + "\"timestamp\":\"" + Instant.now().toString() + "\""
                    + "}";

            sendJson(exchange, 200, response);
        }
    }

    /**
     * ICMP Echo Ping Simulator Endpoint
     */
    static class PingHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String query = exchange.getRequestURI().getQuery();
            Map<String, String> params = parseQuery(query);
            String srcIp = params.getOrDefault("src", "192.168.10.15");
            String destIp = params.getOrDefault("dest", "192.168.10.1");

            // Subnet verification (IPv4 class C check)
            boolean sameSubnet = isSameSubnet(srcIp, destIp);
            int latency = sameSubnet ? (int)(Math.random() * 6 + 1) : 0;
            int bytes = 32;
            int ttl = 64;

            String response = "{"
                    + "\"success\":" + sameSubnet + ","
                    + "\"sourceIp\":\"" + srcIp + "\","
                    + "\"destinationIp\":\"" + destIp + "\","
                    + "\"packetsTransmitted\":4,"
                    + "\"packetsReceived\":" + (sameSubnet ? 4 : 0) + ","
                    + "\"packetLoss\":\"" + (sameSubnet ? "0%" : "100%") + "\","
                    + "\"latencyMs\":" + latency + ","
                    + "\"ttl\":" + ttl + ","
                    + "\"reply\":\"" + (sameSubnet 
                        ? "Reply from " + destIp + ": bytes=" + bytes + " time=" + latency + "ms TTL=" + ttl
                        : "Request timed out. Destination host unreachable.") + "\""
                    + "}";

            sendJson(exchange, 200, response);
        }

        private boolean isSameSubnet(String ip1, String ip2) {
            String[] oct1 = ip1.split("\\.");
            String[] oct2 = ip2.split("\\.");
            if (oct1.length < 3 || oct2.length < 3) return false;
            return oct1[0].equals(oct2[0]) && oct1[1].equals(oct2[1]) && oct1[2].equals(oct2[2]);
        }
    }

    /**
     * Realtime LMS Assignment Evaluator
     */
    static class VerifyHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String response = "{"
                    + "\"assignment\":\"Assignment 5 - NetPulse Edu\","
                    + "\"student\":\"Nabyl Jawahir (20250040073)\","
                    + "\"score\":100,"
                    + "\"status\":\"COMPLETED\","
                    + "\"criteria\":["
                    + "  {\"name\":\"Cabling Verification\",\"passed\":true,\"score\":40},"
                    + "  {\"name\":\"IP & Subnet Mask Configuration\",\"passed\":true,\"score\":30},"
                    + "  {\"name\":\"DHCP & Inter-VLAN Routing\",\"passed\":true,\"score\":30}"
                    + "],"
                    + "\"evaluatedAt\":\"" + Instant.now().toString() + "\""
                    + "}";

            sendJson(exchange, 200, response);
        }
    }

    /**
     * List of supported Cisco devices
     */
    static class DevicesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String response = "{"
                    + "\"devices\":["
                    + "  {\"name\":\"Router 2911\",\"category\":\"Intermediary\",\"ports\":[\"Gig0/0\",\"Gig0/1\",\"Gig0/2\"]},"
                    + "  {\"name\":\"Switch 2960\",\"category\":\"Intermediary\",\"ports\":[\"Fa0/1\",\"Fa0/2\",\"Fa0/3\",\"Gig0/1\"]},"
                    + "  {\"name\":\"L3 Switch 3560\",\"category\":\"Intermediary\",\"ports\":[\"Fa0/1\",\"Fa0/2\",\"Gig0/1\",\"Gig0/2\"]},"
                    + "  {\"name\":\"ASA 5505 Firewall\",\"category\":\"Security\",\"ports\":[\"Eth0/0 (Outside)\",\"Eth0/1 (Inside)\",\"Eth0/2 (DMZ)\"]},"
                    + "  {\"name\":\"AP Wireless\",\"category\":\"Wireless\",\"ports\":[\"Eth0\",\"SSID\"]},"
                    + "  {\"name\":\"PC Workstation\",\"category\":\"End Device\",\"ports\":[\"FastEthernet0\"]},"
                    + "  {\"name\":\"Laptop\",\"category\":\"End Device\",\"ports\":[\"FastEthernet0\"]},"
                    + "  {\"name\":\"Web Server\",\"category\":\"End Device\",\"ports\":[\"FastEthernet0\"]},"
                    + "  {\"name\":\"Network Printer\",\"category\":\"End Device\",\"ports\":[\"FastEthernet0\"]},"
                    + "  {\"name\":\"Smart Phone\",\"category\":\"End Device\",\"ports\":[\"Wireless0\"]}"
                    + "]"
                    + "}";

            sendJson(exchange, 200, response);
        }
    }

    /**
     * Azure deployment details and environment metadata
     */
    static class AzureStatusHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            setCORS(exchange);
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            String response = "{"
                    + "\"cloud\":\"Microsoft Azure\","
                    + "\"supportedServices\":[\"Azure App Service (Linux Web App)\",\"Azure Container Apps\",\"Azure Kubernetes Service (AKS)\"],"
                    + "\"containerImage\":\"netpulse-edu-java:latest\","
                    + "\"dockerfile\":\"Dockerfile (Multi-stage Eclipse Temurin OpenJDK 17)\","
                    + "\"ciCdPipelines\":[\"azure-pipelines.yml\",\"github-actions-azure-deploy.yml\"],"
                    + "\"armTemplate\":\"azuredeploy.json\","
                    + "\"environmentVariables\":{"
                    + "  \"PORT\":\"8080\","
                    + "  \"WEBSITES_PORT\":\"8080\","
                    + "  \"JAVA_OPTS\":\"-XX:+UseG1GC -Xmx512m\""
                    + "}"
                    + "}";

            sendJson(exchange, 200, response);
        }
    }

    private static void setCORS(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private static void sendJson(HttpExchange exchange, int statusCode, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    private static void sendError(HttpExchange exchange, int statusCode, String message) throws IOException {
        byte[] bytes = message.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    private static Map<String, String> parseQuery(String query) {
        Map<String, String> result = new HashMap<>();
        if (query == null) return result;
        for (String param : query.split("&")) {
            String[] pair = param.split("=");
            if (pair.length > 1) {
                result.put(pair[0], pair[1]);
            } else if (pair.length == 1) {
                result.put(pair[0], "");
            }
        }
        return result;
    }
}
