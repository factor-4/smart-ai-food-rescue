package com.smartfood.restaurant_service.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryFileStorageService implements FileStorageService {

    private final Cloudinary cloudinary;

    public CloudinaryFileStorageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Override
    @CircuitBreaker(name = "cloudinaryUpload", fallbackMethod = "storeFallback")
    public String store(MultipartFile file, String fileName) {
        try {
            String publicId = fileName.contains(".")
                    ? fileName.substring(0, fileName.lastIndexOf('.'))
                    : fileName;

            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "folder", "bag-images",
                            "overwrite", true
                    )
            );
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image to Cloudinary", e);
        }
    }

    public String storeFallback(MultipartFile file, String fileName, Throwable t) {
        // In a production app, log the error and alert the team
        return "/images/no-image-available.png";
    }

    @Override
    public void delete(String fileName) {
        try {
            String publicId = "bag-images/" + (fileName.contains(".")
                    ? fileName.substring(0, fileName.lastIndexOf('.'))
                    : fileName);
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete image from Cloudinary", e);
        }
    }
}