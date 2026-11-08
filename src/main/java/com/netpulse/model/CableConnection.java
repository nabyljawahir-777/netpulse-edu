package com.netpulse.model;

public class CableConnection {
    private String id;
    private String sourceDeviceId;
    private String sourcePortId;
    private String targetDeviceId;
    private String targetPortId;
    private String cableType; // straight, cross, console, serial, coaxial
    private boolean active;

    public CableConnection() {
        this.active = true;
    }

    public CableConnection(String id, String sourceDeviceId, String sourcePortId, String targetDeviceId, String targetPortId, String cableType) {
        this.id = id;
        this.sourceDeviceId = sourceDeviceId;
        this.sourcePortId = sourcePortId;
        this.targetDeviceId = targetDeviceId;
        this.targetPortId = targetPortId;
        this.cableType = cableType;
        this.active = true;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSourceDeviceId() { return sourceDeviceId; }
    public void setSourceDeviceId(String sourceDeviceId) { this.sourceDeviceId = sourceDeviceId; }

    public String getSourcePortId() { return sourcePortId; }
    public void setSourcePortId(String sourcePortId) { this.sourcePortId = sourcePortId; }

    public String getTargetDeviceId() { return targetDeviceId; }
    public void setTargetDeviceId(String targetDeviceId) { this.targetDeviceId = targetDeviceId; }

    public String getTargetPortId() { return targetPortId; }
    public void setTargetPortId(String targetPortId) { this.targetPortId = targetPortId; }

    public String getCableType() { return cableType; }
    public void setCableType(String cableType) { this.cableType = cableType; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
