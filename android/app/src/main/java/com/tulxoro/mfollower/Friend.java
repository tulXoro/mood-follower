package com.tulxoro.mfollower;

public class Friend {
    private String name;
    private String emoji;
    private String status;

    public Friend(String name, String emoji, String status) {
        this.name = name;
        this.emoji = emoji;
        this.status = status;
    }

    public String getName() {
        return name;
    }

    public String getEmoji() {
        return emoji;
    }

    public String getStatus() {
        return status;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmoji(String emoji) {
        this.emoji = emoji;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
