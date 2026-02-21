// package com.backend.service;

// import com.backend.dto.PriceResponse;
// import com.backend.dto.ProductDTO;
// import com.backend.model.Product;
// import com.backend.repo.ProductRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import java.math.BigDecimal;
// import java.util.List;
// import java.util.stream.Collectors;

// @Service
// public class ProductService {

// private final ProductRepository productRepository;
// private final AiRecommendationService aiService; // your pricing service

// @Autowired
// public ProductService(ProductRepository productRepository,
// AiRecommendationService aiService) {
// this.productRepository = productRepository;
// this.aiService = aiService;
// }

// public List<ProductDTO> getProductsPaginated(Long userId, int limit, int
// offset) {
// // Fetch paginated products
// // List<Product> products = productRepository.findAllWithPagination(offset,
// limit);

// // Convert to DTO with personalized pricing
// return products.stream()
// .map(product -> {
// PriceResponse priceInfo = aiService.getPersonalizedPrice(userId,
// product.getId());

// ProductDTO dto = new ProductDTO();
// dto.setId(product.getId());
// dto.setName(product.getName());
// dto.setOriginalPrice(product.getBasePrice());
// dto.setSuggestedPrice(BigDecimal.valueOf(priceInfo.getSuggestedPrice()));
// dto.setDiscountPercent(priceInfo.getDiscountPercent());
// dto.setReason(priceInfo.getReason());
// dto.setImage(product.getImage());
// return dto;
// })
// .collect(Collectors.toList());
// }

// public long getTotalProductCount() {
// return productRepository.countAllProducts();
// }
// }