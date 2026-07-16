package com.example.fashionstore.repository;

import com.example.fashionstore.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByCustomerIdOrderByCreatedAtAsc(Long customerId);

    List<ChatMessage> findByCustomerIdAndSenderRoleAndReadByCustomerFalse(Long customerId, String senderRole);

    List<ChatMessage> findByCustomerIdAndSenderRoleAndReadByAdminFalse(Long customerId, String senderRole);

    long countByCustomerIdAndSenderRoleAndReadByCustomerFalse(Long customerId, String senderRole);
}
