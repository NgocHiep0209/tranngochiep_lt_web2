package com.example.fashionstore.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Cuộc trò chuyện được nhóm theo khách hàng (1 khách <-> admin)
    @Column(nullable = false)
    private Long customerId;

    // "USER" (khách hàng gửi) hoặc "ADMIN" (quản trị viên gửi)
    @Column(nullable = false, length = 20)
    private String senderRole;

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    // true nếu khách hàng đã xem tin nhắn này (chỉ có ý nghĩa với tin do ADMIN gửi)
    private boolean readByCustomer = false;

    // true nếu admin đã xem tin nhắn này (chỉ có ý nghĩa với tin do USER gửi)
    private boolean readByAdmin = false;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
