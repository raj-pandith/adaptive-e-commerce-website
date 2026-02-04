package com.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.backend.dto.PriceResponse;
import com.backend.dto.ProductDTO;
import com.backend.model.Product;
import com.backend.model.User;
import com.backend.repo.ProductRepository;
import com.backend.repo.UserRepository;
import com.backend.service.AiRecommendationService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductRepository productRepository;
    private final AiRecommendationService aiService;
    private final UserRepository userRepository;

    public ProductController(ProductRepository productRepository, AiRecommendationService aiService,
            UserRepository userRepository) {
        this.productRepository = productRepository;
        this.aiService = aiService;
        this.userRepository = userRepository;
    }

    @GetMapping("/products")
    public List<ProductDTO> getProducts(@RequestParam Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Product> products = productRepository.findAll();

        return products.stream().map(p -> {
            PriceResponse priceInfo = aiService.getPersonalizedPrice(
                    userId,
                    p.getId());

            return new ProductDTO(
                    p.getId(),
                    p.getName(),
                    p.getBasePrice(),
                    BigDecimal.valueOf(priceInfo.getSuggestedPrice()),
                    priceInfo.getDiscountPercent(),
                    priceInfo.getReason());
        }).collect(Collectors.toList());
    }

    // Just recommendations
    @GetMapping("/recommendations")
    public ResponseEntity<List<Long>> getRecommendations(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "6") int limit) {
        List<Long> recIds = aiService.getRecommendedProductIds(userId, limit);
        return ResponseEntity.ok(recIds);
    }

    @GetMapping("/products/{id}/similar")
    public ResponseEntity<List<ProductDTO>> getSimilarProducts(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") Long userId, // default user for demo
            @RequestParam(defaultValue = "6") int limit) {

        // Step 1: Get ordered list of similar product IDs from Python
        List<Long> orderedIds = aiService.getSimilarProductIds(id, limit);

        if (orderedIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        // Step 2: Fetch products (order doesn't matter here)
        List<Product> products = productRepository.findAllById(orderedIds);

        // Step 3: Create map: product ID → Product object
        Map<Long, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        // Step 4: Rebuild the list in the exact order returned by Python
        List<ProductDTO> dtos = orderedIds.stream()
                .filter(productMap::containsKey) // skip if product not found (rare)
                .map(pid -> {
                    Product product = productMap.get(pid);
                    PriceResponse priceInfo = aiService.getPersonalizedPrice(userId, product.getId());

                    return new ProductDTO(
                            product.getId(),
                            product.getName(),
                            product.getBasePrice(),
                            BigDecimal.valueOf(priceInfo.getSuggestedPrice()),
                            priceInfo.getDiscountPercent(),
                            priceInfo.getReason());
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

}