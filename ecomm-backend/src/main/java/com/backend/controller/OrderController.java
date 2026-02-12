package com.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.OrderRequest;
import com.backend.model.Order;
import com.backend.model.OrderItem;
import com.backend.repo.OrderRepository;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;

    public OrderController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // Save order after payment success
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest request) {
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setTotalAmount(request.getTotalAmount());
        order.setOrderId("ORD-" + System.currentTimeMillis());
        order.setStatus("COMPLETED");

        // Convert cart items to OrderItem
        List<OrderItem> items = request.getItems().stream()
                .map(i -> {
                    OrderItem item = new OrderItem();
                    item.setProductId(i.getProductId());
                    item.setName(i.getName());
                    item.setPrice(i.getPrice());
                    item.setQuantity(i.getQuantity());
                    return item;
                })
                .collect(Collectors.toList());

        order.setItems(items);

        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(saved);
    }

    // Get user's order history
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        return ResponseEntity.ok(orders);
    }
}
