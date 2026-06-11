package com.smartfood.restaurant_service.storage;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String store(MultipartFile file, String fileName);
    void delete(String fileName);
}