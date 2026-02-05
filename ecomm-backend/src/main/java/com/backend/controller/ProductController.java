package com.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.backend.dto.PriceResponse;
import com.backend.dto.ProductDTO;
import com.backend.dto.SearchResponse;
import com.backend.dto.SearchResultDTO;
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

    @GetMapping("/search")
    public ResponseEntity<List<SearchResultDTO>> searchProducts(
            @RequestParam String query,
            @RequestParam(defaultValue = "6") int limit,
            @RequestParam(defaultValue = "1") Long userId) {

        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(List.of());
        }

        // Get list of similar product IDs from Python semantic search
        List<SearchResponse.SearchResultItem> searchResults = aiService.searchProducts(query, limit);

        if (searchResults.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        // Extract product IDs (preserving order from similarity)
        List<Long> orderedIds = searchResults.stream()
                .map(SearchResponse.SearchResultItem::getProductId)
                .collect(Collectors.toList());

        // Fetch full products from DB
        List<Product> products = productRepository.findAllById(orderedIds);

        // Map ID → Product for re-ordering
        Map<Long, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        // Rebuild response in Python's similarity order, with personalized prices
        List<SearchResultDTO> result = orderedIds.stream()
                .filter(productMap::containsKey)
                .map(pid -> {
                    Product p = productMap.get(pid);
                    PriceResponse priceInfo = aiService.getPersonalizedPrice(userId, p.getId());

                    SearchResultDTO dto = new SearchResultDTO();
                    dto.setId(p.getId());
                    dto.setName(p.getName());
                    dto.setOriginalPrice(p.getBasePrice());
                    dto.setSuggestedPrice(BigDecimal.valueOf(priceInfo.getSuggestedPrice()));
                    dto.setDiscountPercent(priceInfo.getDiscountPercent());
                    dto.setReason(priceInfo.getReason());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

}