package com.backend.controller;

import com.backend.dto.PriceResponse;
import com.backend.dto.ProductDTO;
import com.backend.dto.SearchResponse;
import com.backend.dto.SearchResultDTO;
import com.backend.model.Product;
import com.backend.model.ProductRequest;
import com.backend.repo.ProductRepository;
import com.backend.service.AiRecommendationService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ProductController {

        private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

        private final ProductRepository productRepository;
        private final AiRecommendationService aiService;

        public ProductController(ProductRepository productRepository, AiRecommendationService aiService) {
                this.productRepository = productRepository;
                this.aiService = aiService;
        }

        /**
         * Get list of products with personalized pricing based on user loyalty points
         */
        @GetMapping("/products")
        public ResponseEntity<List<ProductDTO>> getProducts(
                        @RequestParam Long userId, // Required: no default
                        @RequestParam(defaultValue = "10") int limit) {

                if (userId == null) {
                        logger.warn("Missing userId in /products request");
                        return ResponseEntity.badRequest().body(null);
                }

                List<Product> products = productRepository.findAll();

                List<ProductDTO> dtos = products.stream()
                                .limit(limit)
                                .map(product -> {
                                        PriceResponse priceInfo = aiService.getPersonalizedPrice(userId,
                                                        product.getId());

                                        ProductDTO dto = new ProductDTO();
                                        dto.setId(product.getId());
                                        dto.setName(product.getName());
                                        dto.setOriginalPrice(product.getBasePrice() != null ? product.getBasePrice()
                                                        : BigDecimal.ZERO);
                                        dto.setSuggestedPrice(BigDecimal.valueOf(priceInfo.getSuggestedPrice()));
                                        dto.setDiscountPercent(priceInfo.getDiscountPercent());
                                        dto.setReason(priceInfo.getReason());
                                        dto.setImage(product.getImage());
                                        return dto;
                                })
                                .collect(Collectors.toList());

                logger.info("Returned {} personalized products for user {}", dtos.size(), userId);
                return ResponseEntity.ok(dtos);
        }

        /**
         * Get single product with personalized pricing
         */
        @GetMapping("/products/{id}")
        public ResponseEntity<ProductDTO> getProductById(
                        @PathVariable Long id,
                        @RequestParam Long userId) { // Required: no default

                if (userId == null) {
                        logger.warn("Missing userId in /products/{} request", id);
                        return ResponseEntity.badRequest().body(null);
                }

                Product product = productRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

                PriceResponse priceInfo = aiService.getPersonalizedPrice(userId, product.getId());

                ProductDTO dto = new ProductDTO(
                                product.getId(),
                                product.getName(),
                                product.getBasePrice(),
                                BigDecimal.valueOf(priceInfo.getSuggestedPrice()),
                                priceInfo.getDiscountPercent(),
                                priceInfo.getReason(),
                                product.getImage(),
                                product.getDesc());

                logger.info("Returned personalized product {} for user {}", id, userId);
                return ResponseEntity.ok(dto);
        }

        /**
         * Get similar products with personalized pricing
         */
        @GetMapping("/products/{id}/similar")
        public ResponseEntity<List<ProductDTO>> getSimilarProducts(
                        @PathVariable Long id,
                        @RequestParam Long userId, // Required
                        @RequestParam(defaultValue = "6") int limit) {

                if (userId == null) {
                        logger.warn("Missing userId in /products/{}/similar request", id);
                        return ResponseEntity.badRequest().body(null);
                }

                List<Long> orderedIds = aiService.getSimilarProductIds(id, limit);

                if (orderedIds.isEmpty()) {
                        return ResponseEntity.ok(List.of());
                }

                List<Product> products = productRepository.findAllById(orderedIds);

                Map<Long, Product> productMap = products.stream()
                                .collect(Collectors.toMap(Product::getId, Function.identity()));

                List<ProductDTO> dtos = orderedIds.stream()
                                .filter(productMap::containsKey)
                                .map(pid -> {
                                        Product product = productMap.get(pid);
                                        PriceResponse priceInfo = aiService.getPersonalizedPrice(userId,
                                                        product.getId());

                                        return new ProductDTO(
                                                        product.getId(),
                                                        product.getName(),
                                                        product.getBasePrice(),
                                                        BigDecimal.valueOf(priceInfo.getSuggestedPrice()),
                                                        priceInfo.getDiscountPercent(),
                                                        priceInfo.getReason(),
                                                        product.getImage(),
                                                        product.getDesc());
                                })
                                .collect(Collectors.toList());

                logger.info("Returned {} similar products for product {} and user {}", dtos.size(), id, userId);
                return ResponseEntity.ok(dtos);
        }

        /**
         * Search products with semantic search + personalized pricing
         */

        @PostMapping("/admin/products")
        public ResponseEntity<Product> addProduct(@RequestBody ProductRequest request) {
                // Validate admin role (using @PreAuthorize or manual check)

                Product product = new Product();
                product.setName(request.getName());
                product.setBasePrice(request.getPrice());
                product.setCategory(request.getCategory());
                product.setStock(request.getStock());
                product.setDesc(request.getDescription());
                product.setImage(request.getImage());

                Product saved = productRepository.save(product);

                System.out.println("product saved .............");
                System.out.println(saved);
                return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        }

        @GetMapping("/search")
        public ResponseEntity<List<SearchResultDTO>> searchProducts(
                        @RequestParam String query,
                        @RequestParam(defaultValue = "6") int limit,
                        @RequestParam Long userId) { // Required

                if (userId == null) {
                        logger.warn("Missing userId in /search request");
                        return ResponseEntity.badRequest().body(null);
                }

                if (query == null || query.trim().isEmpty()) {
                        return ResponseEntity.badRequest().body(List.of());
                }

                List<SearchResponse.SearchResultItem> searchResults = aiService.searchProducts(query, limit);

                if (searchResults.isEmpty()) {
                        return ResponseEntity.ok(List.of());
                }

                List<Long> orderedIds = searchResults.stream()
                                .map(SearchResponse.SearchResultItem::getProductId)
                                .collect(Collectors.toList());

                List<Product> products = productRepository.findAllById(orderedIds);

                Map<Long, Product> productMap = products.stream()
                                .collect(Collectors.toMap(Product::getId, Function.identity()));

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
                                        dto.setImage(p.getImage());
                                        return dto;
                                })
                                .collect(Collectors.toList());

                logger.info("Search returned {} results for query '{}' and user {}", result.size(), query, userId);
                return ResponseEntity.ok(result);
        }
}