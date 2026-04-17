package com.smartfood.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank @Size(min = 3, max = 20) String username,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6, max = 40) String password,
        @NotBlank String role  // "ROLE_USER" or "ROLE_OWNER"
) {}