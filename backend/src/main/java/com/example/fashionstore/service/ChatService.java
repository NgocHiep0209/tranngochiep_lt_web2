package com.example.fashionstore.service;

import com.example.fashionstore.entity.ChatMessage;
import com.example.fashionstore.entity.Customer;
import com.example.fashionstore.exception.BadRequestException;
import com.example.fashionstore.exception.ResourceNotFoundException;
import com.example.fashionstore.repository.ChatMessageRepository;
import com.example.fashionstore.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private static final String ROLE_USER = "USER";
    private static final String ROLE_ADMIN = "ADMIN";

    private final ChatMessageRepository chatMessageRepository;
    private final CustomerRepository customerRepository;

    public Customer resolveCustomer(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng"));
    }

    public List<ChatMessage> getMessages(Long customerId) {
        return chatMessageRepository.findByCustomerIdOrderByCreatedAtAsc(customerId);
    }

    public ChatMessage sendMessage(Long customerId, String senderRole, String content) {
        if (content == null || content.isBlank()) {
            throw new BadRequestException("Vui lòng nhập nội dung tin nhắn");
        }
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Không tìm thấy khách hàng với id: " + customerId);
        }
        ChatMessage message = new ChatMessage();
        message.setCustomerId(customerId);
        message.setSenderRole(senderRole);
        message.setContent(content.trim());
        // Người gửi mặc định đã "đọc" tin của chính mình
        message.setReadByCustomer(ROLE_USER.equals(senderRole));
        message.setReadByAdmin(ROLE_ADMIN.equals(senderRole));
        return chatMessageRepository.save(message);
    }

    // Khách hàng vừa mở khung chat -> đánh dấu đã đọc hết tin nhắn từ ADMIN
    public void markReadByCustomer(Long customerId) {
        List<ChatMessage> unread = chatMessageRepository
                .findByCustomerIdAndSenderRoleAndReadByCustomerFalse(customerId, ROLE_ADMIN);
        unread.forEach(m -> m.setReadByCustomer(true));
        chatMessageRepository.saveAll(unread);
    }

    // Admin vừa mở một cuộc trò chuyện -> đánh dấu đã đọc hết tin nhắn từ khách đó
    public void markReadByAdmin(Long customerId) {
        List<ChatMessage> unread = chatMessageRepository
                .findByCustomerIdAndSenderRoleAndReadByAdminFalse(customerId, ROLE_USER);
        unread.forEach(m -> m.setReadByAdmin(true));
        chatMessageRepository.saveAll(unread);
    }

    // Số tin nhắn từ ADMIN mà khách hàng chưa đọc (hiện badge trên icon chat)
    public long getUnreadCountForCustomer(Long customerId) {
        return chatMessageRepository.countByCustomerIdAndSenderRoleAndReadByCustomerFalse(customerId, ROLE_ADMIN);
    }

    // Admin: danh sách các cuộc trò chuyện, mới nhất lên đầu, kèm số tin chưa đọc
    public List<Map<String, Object>> getConversationsForAdmin() {
        List<ChatMessage> all = chatMessageRepository.findAll();
        Map<Long, List<ChatMessage>> byCustomer = all.stream()
                .collect(Collectors.groupingBy(ChatMessage::getCustomerId));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<Long, List<ChatMessage>> entry : byCustomer.entrySet()) {
            Long customerId = entry.getKey();
            List<ChatMessage> messages = entry.getValue();
            messages.sort(Comparator.comparing(ChatMessage::getCreatedAt));
            ChatMessage last = messages.get(messages.size() - 1);
            long unread = messages.stream()
                    .filter(m -> ROLE_USER.equals(m.getSenderRole()) && !m.isReadByAdmin())
                    .count();

            Map<String, Object> item = new HashMap<>();
            item.put("customerId", customerId);
            customerRepository.findById(customerId).ifPresentOrElse(c -> {
                item.put("customerName", c.getFullName());
                item.put("customerEmail", c.getEmail());
            }, () -> {
                item.put("customerName", "Khách hàng #" + customerId);
                item.put("customerEmail", "");
            });
            item.put("lastMessage", last.getContent());
            item.put("lastMessageAt", last.getCreatedAt());
            item.put("lastSenderRole", last.getSenderRole());
            item.put("unreadCount", unread);
            result.add(item);
        }

        result.sort((a, b) -> ((LocalDateTime) b.get("lastMessageAt")).compareTo((LocalDateTime) a.get("lastMessageAt")));
        return result;
    }
}
