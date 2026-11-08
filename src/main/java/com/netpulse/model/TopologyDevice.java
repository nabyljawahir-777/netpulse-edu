package com.netpulse.model;

import java.util.ArrayList;
import java.util.List;

public class TopologyDevice {
    private String id;
    private String name;
    private String type; // router, switch, multilayer_switch, firewall, access_point, pc, laptop, server, printer, smartphone
    private String model;
    private double x;
    private double y;
    private List<DevicePort> ports;

    public TopologyDevice() {
        this.ports = new ArrayList<>();
    }

    public TopologyDevice(String id, String name, String type, String model, double x, double y) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.model = model;
        this.x = x;
        this.y = y;
        this.ports = new ArrayList<>();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public double getX() { return x; }
    public void setX(double x) { this.x = x; }

    public double getY() { return y; }
    public void setY(double y) { this.y = y; }

    public List<DevicePort> getPorts() { return ports; }
    public void setPorts(List<DevicePort> ports) { this.ports = ports; }
}
