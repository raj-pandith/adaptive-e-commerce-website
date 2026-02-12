package com.backend.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class CartItemDTO {
    private Long productId;
    private String name;
    private BigDecimal price;
    private int quantity;
}
