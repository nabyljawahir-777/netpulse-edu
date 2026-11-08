package com.netpulse;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.management.ManagementFactory;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

public class NetPulseApplication {

    private static final int DEFAULT_PORT = 8080;
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final long START_TIME = System.nanoTime();

    public static void main(String[] args) {

        int port = DEFAULT_PORT;
        String envPort = System.getenv("PORT");

        if (envPort != null && !envPort.trim().isEmpty()) {
            try {
                port = Integer.parseInt(envPort.trim());
            } catch (NumberFormatException e) {
                System.out.println("[WARN] Invalid PORT. Using 8080.");
            }
        }

        try {
            HttpServer server = HttpServer.create(
                    new InetSocketAddress(port), 0
            );

            server.createContext("/", new StaticFileHandler());

            server.createContext("/api/health", new HealthHandler());
            server.createContext("/api/ping", new PingHandler());
            server.createContext("/api/verify-topology", new VerifyHandler());
            server.createContext("/api/export-assignment", new ExportHandler());
            server.createContext("/api/devices", new DevicesHandler());
            server.createContext("/api/azure/status", new AzureStatusHandler());

            server.setExecutor(null);

            System.out.println("==================================================");
            System.out.println("             NETPULSE EDU SERVER");
            System.out.println("==================================================");
            System.out.println("[STATUS] Port: " + port);
            System.out.println("[WEB]    http://localhost:" + port);
            System.out.println("[API]    http://localhost:" + port + "/api/health");
            System.out.println("[PURE]   http://localhost:" + port + "/pure");
            System.out.println("[JAVA]   " + System.getProperty("java.version"));
            System.out.println("==================================================");

            server.start();

        } catch (IOException e) {
            System.err.println("[ERROR] Cannot start NetPulse Edu: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ==================================================
    // STATIC FRONTEND HANDLER
    // ==================================================

    static class StaticFileHandler implements HttpHandler {

        @Override
        public void handle(HttpExchange exchange) throws IOException {

            String method = exchange.getRequestMethod();

            if (!method.equalsIgnoreCase("GET")
                    && !method.equalsIgnoreCase("HEAD")) {
                sendError(exchange, 405, "Method Not Allowed");
                return;
            }

            String requestPath = exchange.getRequestURI().getPath();

            if (requestPath == null || requestPath.isEmpty()) {
                requestPath = "/";
            }

            // Preserve the old frontend under /pure.
            if (requestPath.equals("/pure")
                    || requestPath.equals("/pure/")) {
                requestPath = "/pure/index.html";
            }

            if (requestPath.equals("/")) {
                requestPath = "/index.html";
            }

            if (requestPath.contains("..")) {
                sendError(exchange, 403, "Forbidden");
                return;
            }

            byte[] fileBytes = loadStaticFile(requestPath);

            if (fileBytes == null) {
                sendError(exchange, 404, "404 Not Found: " + requestPath);
                return;
            }

            String mimeType = getMimeType(requestPath);

            exchange.getResponseHeaders().set("Content-Type", mimeType);
            exchange.getResponseHeaders().set(
                    "Cache-Control",
                    requestPath.endsWith(".html") ? "no-cache" : "public, max-age=3600"
            );

            if (method.equalsIgnoreCase("HEAD")) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }

            exchange.sendResponseHeaders(200, fileBytes.length);

            try (OutputStream output = exchange.getResponseBody()) {
                output.write(fileBytes);
            }
        }

        private byte[] loadStaticFile(String requestPath) throws IOException {

            String resourcePath = "/static" + requestPath;

            // First: load from packaged JAR.
            try (InputStream input =
                         NetPulseApplication.class.getResourceAsStream(resourcePath)) {

                if (input != null) {
                    return input.readAllBytes();
                }
            }

            // Second: load from local project directory.
            Path baseDirectory = Path.of(
                    "src", "main", "resources", "static"
            ).toAbsolutePath().normalize();

            Path requestedFile = baseDirectory
                    .resolve(requestPath.substring(1))
                    .normalize();

            if (!requestedFile.startsWith(baseDirectory)) {
                return null;
            }

            File file = requestedFile.toFile();

            if (file.exists() && file.isFile()) {
                return Files.readAllBytes(requestedFile);
            }

            return null;
        }

        private String getMimeType(String path) {

            String lower = path.toLowerCase();

            if (lower.endsWith(".html")) return "text/html; charset=UTF-8";
            if (lower.endsWith(".css")) return "text/css; charset=UTF-8";
            if (lower.endsWith(".js")) return "application/javascript; charset=UTF-8";
            if (lower.endsWith(".json") || lower.endsWith(".map"))
                return "application/json; charset=UTF-8";

            if (lower.endsWith(".png")) return "image/png";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg"))
                return "image/jpeg";
            if (lower.endsWith(".svg")) return "image/svg+xml";
            if (lower.endsWith(".ico")) return "image/x-icon";
            if (lower.endsWith(".webp")) return "image/webp";

            if (lower.endsWith(".pdf")) return "application/pdf";

            if (lower.endsWith(".woff")) return "font/woff";
            if (lower.endsWith(".woff2")) return "font/woff2";
            if (lower.endsWith(".ttf")) return "font/ttf";

            if (lower.endsWith(".wasm")) return "application/wasm";

            return "application/octet-stream";
        }
    }

    // ==================================================
    // HEALTH API
    // ==================================================

    static class HealthHandler implements HttpHandler {

        @Override
        public void handle(HttpExchange exchange) throws IOException {

            setCORS(exchange);

            if (handleOptions(exchange)) return;

            if (!requireMethod(exchange, "GET")) return;

            double uptime = (System.nanoTime() - START_TIME)
                    / 1_000_000_000.0;

            Map<String, Object> response = new LinkedHashMap<>();

            response.put("status", "UP");
            response.put("service", "NetPulse Edu API (Java Backend)");
            response.put("version", "2.5.0");
            response.put("uptime", uptime);
            response.put("timestamp", Instant.now().toString());

            response.put("supportedLanguages", List.of(
                    "Java SE 17+ (Maven)",
                    "TypeScript",
                    "JavaScript",
                    "HTML5",
                    "CSS3"
            ));

            response.put("compatibleIDEs", List.of(
                    "IntelliJ IDEA Community Edition",
                    "Visual Studio Code",
                    "WebStorm"
            ));

            response.put(
                    "cloudPlatform",
                    "Microsoft Azure App Service / Container Apps"
            );

            sendJson(exchange, 200, response);
        }
    }

    // ==================================================
    // PING SIMULATOR API
    // ==================================================

    static class PingHandler implements HttpHandler {

        @Override
        public void handle(HttpExchange exchange) throws IOException {

            setCORS(exchange);

            if (handleOptions(exchange)) return;

            if (!requireMethod(exchange, "POST")) return;

            JsonNode body;

            try {
                body = readJsonBody(exchange);
            } catch (IOException e) {
                sendError(exchange, 400, "Invalid JSON request body");
                return;
            }

            String sourceIp = getText(body, "sourceIp");
            String targetIp = getText(body, "targetIp");

            if (sourceIp == null || targetIp == null
                    || !isValidIPv4(sourceIp)
                    || !isValidIPv4(targetIp)) {

                sendError(exchange, 400,
                        "Valid sourceIp and targetIp are required");
                return;
            }

            JsonNode connections = body.path("connections");

            boolean hasConnections =
                    connections.isArray() && !connections.isEmpty();

            boolean sameSubnet = isSameSubnet(sourceIp, targetIp);

            int transmitted = 4;

            int received = sameSubnet
                    ? 4
                    : (hasConnections ? 3 : 0);

            double packetLoss =
                    ((transmitted - received) / 4.0) * 100;

            int latency = sameSubnet
                    ? ThreadLocalRandom.current().nextInt(1, 9)
                    : ThreadLocalRandom.current().nextInt(12, 37);

            Map<String, Object> response = new LinkedHashMap<>();

            response.put("success", received > 0);
            response.put("sourceIp", sourceIp);
            response.put("targetIp", targetIp);
            response.put("packetsTransmitted", transmitted);
            response.put("packetsReceived", received);
            response.put("packetLoss", packetLoss + "%");
            response.put("avgLatencyMs", latency);

            response.put("summary",
                    received > 0
                            ? "Reply from " + targetIp
                            + ": bytes=32 time=" + latency + "ms TTL=64"
                            : "Request timed out. Destination host unreachable."
            );

            sendJson(exchange, 200, response);
        }
    }

    // ==================================================
    // TOPOLOGY VERIFICATION API
    // ==================================================

    static class VerifyHandler implements HttpHandler {

        @Override
        public void handle(HttpExchange exchange) throws IOException {

            setCORS(exchange);

            if (handleOptions(exchange)) return;

            if (!requireMethod(exchange, "POST")) return;

            JsonNode body;

            try {
                body = readJsonBody(exchange);
            } catch (IOException e) {
                sendError(exchange, 400, "Invalid JSON request body");
                return;
            }

            JsonNode devices = body.path("devices");
            JsonNode connections = body.path("connections");

            int deviceCount =
                    devices.isArray() ? devices.size() : 0;

            int connectionCount =
                    connections.isArray() ? connections.size() : 0;

            int configuredPorts = 0;

            if (devices.isArray()) {

                for (JsonNode device : devices) {

                    JsonNode ports = device.path("ports");

                    if (!ports.isArray()) continue;

                    for (JsonNode port : ports) {

                        String ip = getText(port, "ip");

                        if (ip != null && !ip.trim().isEmpty()) {
                            configuredPorts++;
                        }
                    }
                }
            }

            boolean enoughDevices = deviceCount >= 2;
            boolean hasConnections = connectionCount >= 1;
            boolean configuredIp = configuredPorts >= 2;

            int score = 0;

            if (enoughDevices) score += 30;
            if (hasConnections) score += 40;
            if (configuredIp) score += 30;

            List<Map<String, Object>> checks = new ArrayList<>();

            checks.add(check(
                    "Device Verification",
                    enoughDevices,
                    enoughDevices
                            ? "At least two devices detected."
                            : "At least two devices are required.",
                    30
            ));

            checks.add(check(
                    "Network Connections",
                    hasConnections,
                    hasConnections
                            ? "Network connections detected."
                            : "At least one connection is required.",
                    40
            ));

            checks.add(check(
                    "IP Configuration",
                    configuredIp,
                    configuredIp
                            ? "At least two configured IP ports detected."
                            : "At least two configured IP ports are required.",
                    30
            ));

            Map<String, Object> response = new LinkedHashMap<>();

            response.put(
                    "labId",
                    getText(body, "labId") == null
                            ? "custom-lab"
                            : getText(body, "labId")
            );

            response.put("score", score);
            response.put("completed", score >= 90);
            response.put("checks", checks);
            response.put("evaluationTimestamp", Instant.now().toString());

            sendJson(exchange, 200, response);
        }

        private Map<String, Object> check(
                String name,
                boolean passed,
                String feedback,
                int score
        ) {

            Map<String, Object> result = new LinkedHashMap<>();

            result.put("name", name);
            result.put("passed", passed);
            result.put("feedback", feedback);
            result.put("score", passed ? score : 0);

            return result;
        }
    }

    // ==================================================
    // ASSIGNMENT EXPORT API
    // ==================================================

    static class ExportHandler implements HttpHandler {

        @Override
        public void handle(HttpExchange exchange) throws IOException {

            setCORS(exchange);

            if (handleOptions(exchange)) return;

            if (!requireMethod(exchange, "POST")) return;

            JsonNode body;

            try {
                body = readJsonBody(exchange);
            } catch (IOException e) {
                sendError(exchange, 400, "Invalid JSON request body");
                return;
            }

            String studentName = getText(body, "studentName");
            String studentNim = getText(body, "studentNim");
            String labTitle = getText(body, "labTitle");

            int score = body.has("score") && body.get("score").canConvertToInt()
                    ? body.get("score").asInt()
                    : 100;

            int deviceCount = body.path("devices").isArray()
                    ? body.path("devices").size()
                    : 0;

            int connectionCount = body.path("connections").isArray()
                    ? body.path("connections").size()
                    : 0;

            List<Object> objectives = new ArrayList<>();

            if (body.path("objectives").isArray()) {
                body.path("objectives").forEach(objectives::add);
            }

            Map<String, Object> student = new LinkedHashMap<>();

            student.put("name",
                    studentName == null ? "Nabyl Jawahir" : studentName);
            student.put("nim",
                    studentNim == null ? "20250040073" : studentNim);
            student.put("semester", "3 Teknik Informatika");

            Map<String, Object> submission = new LinkedHashMap<>();

            submission.put(
                    "labTitle",
                    labTitle == null ? "NetPulse Edu Topology" : labTitle
            );

            submission.put("score", score);
            submission.put(
                    "status",
                    score >= 100 ? "COMPLETED" : "IN_PROGRESS"
            );

            submission.put("totalDevices", deviceCount);
            submission.put("totalCables", connectionCount);
            submission.put("objectives", objectives);
            submission.put("submittedAt", Instant.now().toString());

            Map<String, Object> report = new LinkedHashMap<>();

            report.put("institution", "Universitas Nusa Putra");
            report.put(
                    "course",
                    "Infrastruktur Jaringan & Administrasi Server (Assignment 5)"
            );

            report.put("student", student);
            report.put("submission", submission);

            Map<String, Object> response = new LinkedHashMap<>();

            response.put("success", true);
            response.put("report", report);
            response.put(
                    "message",
                    "Assignment report generated successfully for evaluation."
            );

            sendJson(exchange, 200, response);
        }
    }

    // ==================================================
    // CISCO DEVICE API
    // ==================================================

    static class DevicesHandler implements HttpHandler {

        @Override
        public void handle(HttpExchange exchange) throws IOException {

            setCORS(exchange);

            if (handleOptions(exchange)) return;

            if (!requireMethod(exchange, "GET")) return;

            List<Map<String, Object>> devices = new ArrayList<>();

            devices.add(device("Router 2911", "Intermediary",
                    "Gig0/0", "Gig0/1", "Gig0/2"));

            devices.add(device("Switch 2960", "Intermediary",
                    "Fa0/1", "Fa0/2", "Fa0/3", "Gig0/1"));

            devices.add(device("L3 Switch 3560", "Intermediary",
                    "Fa0/1", "Fa0/2", "Gig0/1", "Gig0/2"));

            devices.add(device("ASA 5505 Firewall", "Security",
                    "Eth0/0 (Outside)", "Eth0/1 (Inside)", "Eth0/2 (DMZ)"));

            devices.add(device("AP Wireless", "Wireless",
                    "Eth0", "SSID"));

            devices.add(device("PC Workstation", "End Device",
                    "FastEthernet0"));

            devices.add(device("Laptop", "End Device",
                    "FastEthernet0"));

            devices.add(device("Web Server", "End Device",
                    "FastEthernet0"));

            devices.add(device("Network Printer", "End Device",
                    "FastEthernet0"));

            devices.add(device("Smart Phone", "End Device",
                    "Wireless0"));

            sendJson(exchange, 200, Map.of("devices", devices));
        }

        private Map<String, Object> device(
                String name,
                String category,
                String... ports
        ) {

            Map<String, Object> result = new LinkedHashMap<>();

            result.put("name", name);
            result.put("category", category);
            result.put("ports", List.of(ports));

            return result;
        }
    }

    // ==================================================
    // AZURE STATUS API
    // ==================================================

    static class AzureStatusHandler implements HttpHandler {

        @Override
        public void handle(HttpExchange exchange) throws IOException {

            setCORS(exchange);

            if (handleOptions(exchange)) return;

            if (!requireMethod(exchange, "GET")) return;

            Map<String, Object> environment = new LinkedHashMap<>();

            environment.put("PORT", System.getenv().getOrDefault("PORT", "8080"));
            environment.put("WEBSITES_PORT", "8080");
            environment.put("JAVA_OPTS", "-XX:+UseG1GC -Xmx512m");

            Map<String, Object> response = new LinkedHashMap<>();

            response.put("cloud", "Microsoft Azure");

            response.put("services", List.of(
                    "Azure App Service (Linux Web App)",
                    "Azure Container Apps",
                    "Azure Kubernetes Service (AKS)"
            ));

            response.put("containerImage", "netpulse-edu-java:latest");

            response.put(
                    "dockerfile",
                    "Dockerfile (Multi-stage Eclipse Temurin OpenJDK 17)"
            );

            response.put("pipelines", List.of(
                    "azure-pipelines.yml",
                    "github-actions-azure-deploy.yml"
            ));

            response.put("armTemplate", "azuredeploy.json");
            response.put("port", 8080);
            response.put("env", environment);

            sendJson(exchange, 200, response);
        }
    }

    // ==================================================
    // SHARED UTILITIES
    // ==================================================

    private static JsonNode readJsonBody(HttpExchange exchange)
            throws IOException {

        return MAPPER.readTree(exchange.getRequestBody());
    }

    private static String getText(JsonNode node, String field) {

        JsonNode value = node.path(field);

        if (value.isMissingNode() || value.isNull()) {
            return null;
        }

        return value.asText();
    }

    private static boolean isValidIPv4(String ip) {

        String[] parts = ip.split("\\.", -1);

        if (parts.length != 4) return false;

        for (String part : parts) {

            try {
                int value = Integer.parseInt(part);

                if (value < 0 || value > 255) {
                    return false;
                }

            } catch (NumberFormatException e) {
                return false;
            }
        }

        return true;
    }

    private static boolean isSameSubnet(String ip1, String ip2) {

        if (!isValidIPv4(ip1) || !isValidIPv4(ip2)) {
            return false;
        }

        String[] first = ip1.split("\\.");
        String[] second = ip2.split("\\.");

        return first[0].equals(second[0])
                && first[1].equals(second[1])
                && first[2].equals(second[2]);
    }

    private static boolean handleOptions(HttpExchange exchange)
            throws IOException {

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return true;
        }

        return false;
    }

    private static boolean requireMethod(
            HttpExchange exchange,
            String expectedMethod
    ) throws IOException {

        if (!expectedMethod.equalsIgnoreCase(exchange.getRequestMethod())) {
            sendError(exchange, 405, "Method Not Allowed");
            return false;
        }

        return true;
    }

    private static void setCORS(HttpExchange exchange) {

        exchange.getResponseHeaders().set(
                "Access-Control-Allow-Origin", "*"
        );

        exchange.getResponseHeaders().set(
                "Access-Control-Allow-Methods", "GET, POST, OPTIONS"
        );

        exchange.getResponseHeaders().set(
                "Access-Control-Allow-Headers",
                "Content-Type, Authorization"
        );
    }

    private static void sendJson(
            HttpExchange exchange,
            int statusCode,
            Object data
    ) throws IOException {

        byte[] bytes = MAPPER.writeValueAsBytes(data);

        exchange.getResponseHeaders().set(
                "Content-Type",
                "application/json; charset=UTF-8"
        );

        exchange.sendResponseHeaders(statusCode, bytes.length);

        try (OutputStream output = exchange.getResponseBody()) {
            output.write(bytes);
        }
    }

    private static void sendError(
            HttpExchange exchange,
            int statusCode,
            String message
    ) throws IOException {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("success", false);
        response.put("error", message);

        sendJson(exchange, statusCode, response);
    }
}
