package com.supermarket.auth.dto;

public class UserProfileResponse {
    public String name;
    public String email;
    public String role;

    public UserProfileResponse() {}

    public UserProfileResponse(String name, String email, String role) {
        this.name = name;
        this.email = email;
        this.role = role;
    }
}
