package com.backend.model;

import java.math.BigDecimal;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Data
@Embeddable
public class OrderItem {
    private Long productId;
    private String name;
    private BigDecimal price;
    private int quantity;
}