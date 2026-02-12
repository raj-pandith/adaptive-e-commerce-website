package com.backend.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ProductDTO {
    private Long id;
    private String name;
    private BigDecimal originalPrice;
    private BigDecimal suggestedPrice;
    private double discountPercent;
    private String reason;
    private String image;
    private String desc;

    // Constructor
    public ProductDTO(Long id, String name, BigDecimal originalPrice,
            BigDecimal suggestedPrice, double discountPercent, String reason, String image, String desc) {
        this.id = id;
        this.name = name;
        this.originalPrice = originalPrice;
        this.suggestedPrice = suggestedPrice;
        this.discountPercent = discountPercent;
        this.reason = reason;
        this.image = image;
        this.desc = desc;
    }

    public ProductDTO() {
        // TODO Auto-generated constructor stub
    }

    public String getDesc() {
        return this.desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public String getImage() {
        return this.image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    // Getters (add setters if needed)
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public BigDecimal getSuggestedPrice() {
        return suggestedPrice;
    }

    public double getDiscountPercent() {
        return discountPercent;
    }

    public String getReason() {
        return reason;
    }
}
