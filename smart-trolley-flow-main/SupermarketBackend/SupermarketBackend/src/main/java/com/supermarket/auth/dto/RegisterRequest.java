package com.supermarket.auth.dto;

public class RegisterRequest {
    public String name;
    public String email;
    public String password;
    /** Optional: ROLE_CUSTOMER. Defaults to ROLE_CUSTOMER. Admin cannot be registered. */
    public String role;
}

