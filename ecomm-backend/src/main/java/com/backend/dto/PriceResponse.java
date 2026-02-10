package com.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.ToString;

@ToString
public class PriceResponse {
    @JsonProperty("suggested_price")
    private double suggestedPrice;

    @JsonProperty("discount_percent")
    private double discountPercent;
    private String reason;
    private String image;

    public String getImage() {
        return this.image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    // Getters + Setters
    public double getSuggestedPrice() {
        return suggestedPrice;
    }

    public void setSuggestedPrice(double suggestedPrice) {
        this.suggestedPrice = suggestedPrice;
    }

    public double getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(double discountPercent) {
        this.discountPercent = discountPercent;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}