package com.backend.model;

import java.math.BigDecimal;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class ProductRequest {
    private String name;
    private BigDecimal basePrice;
    private String category;
    private Integer stock;
    private String description;
    private String image;
}