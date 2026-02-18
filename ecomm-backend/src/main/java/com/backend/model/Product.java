package com.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "products")
@ToString
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "base_price", precision = 10, scale = 2)
    private BigDecimal basePrice;

    private String category;

    @Column(name = "sales_count")
    private Integer salesCount = 0; // default 0

    @Column(name = "image") // or "url" if renamed
    private String image;

    @Column(name = "description")
    private String desc;

    @Column(name = "stock")
    private Integer stock;

    // Constructors
    public Product() {
    }

    public Product(String name, BigDecimal basePrice, String category, Integer salesCount, String image) {
        this.name = name;
        this.basePrice = basePrice;
        this.category = category;
        this.image = image;
        this.salesCount = salesCount != null ? salesCount : 0;
    }

    // Getters and Setters
    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImage() {
        return this.image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getSalesCount() {
        return salesCount;
    }

    public void setSalesCount(Integer salesCount) {
        this.salesCount = salesCount;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public Integer getStock() {
        return this.stock;
    }
}