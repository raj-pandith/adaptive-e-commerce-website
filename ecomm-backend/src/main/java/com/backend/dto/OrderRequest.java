package com.backend.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data
public class OrderRequest {
    private Long userId;
    private BigDecimal totalAmount;
    private List<CartItemDTO> items;
}
