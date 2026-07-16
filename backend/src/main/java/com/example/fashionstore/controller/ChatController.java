package com.example.fashionstore.controller;

import com.example.fashionstore.entity.ChatMessage;
import com.example.fashionstore.entity.Customer;
import com.example.fashionstore.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // ===================== KHÁCH HÀNG (đã đăng nhập) =====================

    // Lấy toàn bộ tin nhắn của cuộc trò chuyện giữa "tôi" (khách hàng đang đăng nhập) và admin
    @GetMapping("/my")
    public ResponseEntity<List<ChatMessage>> getMyMessages(Authentication authentication) {
        Customer customer = chatService.resolveCustomer(authentication.getName());
        return ResponseEntity.ok(chatService.getMessages(customer.getId()));
    }

    // Khách hàng gửi tin nhắn cho admin
    @PostMapping("/my")
    public ResponseEntity<ChatMessage> sendMyMessage(@RequestBody Map<String, String> body, Authentication authentication) {
        Customer customer = chatService.resolveCustomer(authentication.getName());
        ChatMessage saved = chatService.sendMessage(customer.getId(), "USER", body.get("content"));
        return ResponseEntity.ok(saved);
    }

    // Khách hàng mở khung chat -> đánh dấu đã đọc tin nhắn từ admin
    @PutMapping("/my/read")
    public ResponseEntity<Void> markMyRead(Authentication authentication) {
        Customer customer = chatService.resolveCustomer(authentication.getName());
        chatService.markReadByCustomer(customer.getId());
        return ResponseEntity.noContent().build();
    }

    // Số tin nhắn admin gửi mà khách hàng chưa đọc (hiện badge trên icon chat)
    @GetMapping("/my/unread-count")
    public ResponseEntity<Map<String, Long>> getMyUnreadCount(Authentication authentication) {
        Customer customer = chatService.resolveCustomer(authentication.getName());
        return ResponseEntity.ok(Map.of("unreadCount", chatService.getUnreadCountForCustomer(customer.getId())));
    }

    // ===================== ADMIN =====================

    // Danh sách tất cả cuộc trò chuyện, sắp xếp theo tin nhắn mới nhất
    @GetMapping("/conversations")
    public ResponseEntity<List<Map<String, Object>>> getConversations() {
        return ResponseEntity.ok(chatService.getConversationsForAdmin());
    }

    // Admin xem toàn bộ tin nhắn với một khách hàng cụ thể
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ChatMessage>> getCustomerMessages(@PathVariable Long customerId) {
        return ResponseEntity.ok(chatService.getMessages(customerId));
    }

    // Admin gửi tin nhắn cho một khách hàng cụ thể
    @PostMapping("/customer/{customerId}")
    public ResponseEntity<ChatMessage> sendToCustomer(@PathVariable Long customerId, @RequestBody Map<String, String> body) {
        ChatMessage saved = chatService.sendMessage(customerId, "ADMIN", body.get("content"));
        return ResponseEntity.ok(saved);
    }

    // Admin mở một cuộc trò chuyện -> đánh dấu đã đọc tin nhắn từ khách hàng đó
    @PutMapping("/customer/{customerId}/read")
    public ResponseEntity<Void> markCustomerRead(@PathVariable Long customerId) {
        chatService.markReadByAdmin(customerId);
        return ResponseEntity.noContent().build();
    }
}
