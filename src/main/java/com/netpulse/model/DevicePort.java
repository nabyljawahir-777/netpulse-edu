package com.netpulse.model;

public class DevicePort {
    private String id;
    private String name;
    private String ip;
    private String subnet;
    private String mac;
    private String status; // up, down
    private int vlan;
    private String mode; // access, trunk
    private String ipAssignment; // static, dhcp

    public DevicePort() {
        this.status = "down";
        this.vlan = 1;
        this.mode = "access";
        this.ipAssignment = "static";
    }

    public DevicePort(String id, String name, String mac) {
        this();
        this.id = id;
        this.name = name;
        this.mac = mac;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIp() { return ip; }
    public void setIp(String ip) { this.ip = ip; }

    public String getSubnet() { return subnet; }
    public void setSubnet(String subnet) { this.subnet = subnet; }

    public String getMac() { return mac; }
    public void setMac(String mac) { this.mac = mac; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getVlan() { return vlan; }
    public void setVlan(int vlan) { this.vlan = vlan; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getIpAssignment() { return ipAssignment; }
    public void setIpAssignment(String ipAssignment) { this.ipAssignment = ipAssignment; }
}
