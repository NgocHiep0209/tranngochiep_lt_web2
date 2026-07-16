package com.example.fashionstore.service;

import com.example.fashionstore.dto.OrderDetailRequest;
import com.example.fashionstore.dto.OrderRequest;
import com.example.fashionstore.entity.Order;
import com.example.fashionstore.entity.OrderDetail;
import com.example.fashionstore.entity.Product;
import com.example.fashionstore.exception.BadRequestException;
import com.example.fashionstore.exception.InsufficientStockException;
import com.example.fashionstore.exception.ResourceNotFoundException;
import com.example.fashionstore.repository.OrderRepository;
import com.example.fashionstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.fashionstore.entity.Customer;
import com.example.fashionstore.repository.CustomerRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Set<String> VALID_STATUSES =
            Set.of("pending", "confirmed", "shipping", "completed", "cancelled");

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final CouponService couponService;

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public Optional<Order> findById(Long id) {
        return orderRepository.findById(id);
    }

    /**
     * Tạo đơn hàng:
     * - Giá từng sản phẩm lấy từ DB tại thời điểm đặt (không tin giá client gửi lên).
     * - Kiểm tra và trừ tồn kho ngay trong transaction, nếu không đủ hàng thì rollback toàn bộ đơn.
     */
    @Transactional
    public Order createOrder(OrderRequest request) {
        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setCustomerAddress(request.getCustomerAddress());
        order.setNote(request.getNote());
        order.setStatus("pending");

        List<OrderDetail> details = new ArrayList<>();
        double total = 0;

        for (OrderDetailRequest detailReq : request.getOrderDetails()) {
            Product product = productRepository.findById(detailReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Sản phẩm không tồn tại (id: " + detailReq.getProductId() + ")"));

            int stock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
            if (stock < detailReq.getQuantity()) {
                throw new InsufficientStockException(
                        "Sản phẩm \"" + product.getName() + "\" chỉ còn " + stock + " sản phẩm trong kho");
            }

            // Trừ tồn kho ngay
            product.setStockQuantity(stock - detailReq.getQuantity());
            productRepository.save(product);

            OrderDetail detail = new OrderDetail();
            detail.setProductId(product.getId());
            detail.setProductName(product.getName());
            detail.setQuantity(detailReq.getQuantity());
            detail.setUnitPrice(product.getPrice()); // lấy giá thật từ server
            detail.setOrder(order);
            details.add(detail);

            total += product.getPrice() * detailReq.getQuantity();
        }

        // Áp dụng mã giảm giá (nếu có) - tính trên tổng tiền hàng trước giảm giá
        double discount = 0;
        String couponCode = request.getCouponCode();
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            discount = couponService.applyCoupon(couponCode, total);
            // Nếu đây là voucher khách đã "nhận" trước đó (ví voucher), đánh dấu đã dùng
            couponService.markClaimedAsUsed(request.getCustomerId(), couponCode);
        }

        order.setTotalAmount(total - discount);
        order.setCouponCode(discount > 0 ? couponCode.trim().toUpperCase() : null);
        order.setDiscountAmount(discount);
        order.setOrderDetails(details);

        return orderRepository.save(order);
    }

    @Transactional
    public Order updateStatus(Long id, String status) {
        if (status == null || !VALID_STATUSES.contains(status)) {
            throw new BadRequestException("Trạng thái không hợp lệ. Chỉ chấp nhận: " + VALID_STATUSES);
        }
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với id: " + id));

        // Nếu huỷ đơn thì hoàn lại tồn kho
        if ("cancelled".equals(status) && !"cancelled".equals(order.getStatus())) {
            for (OrderDetail detail : order.getOrderDetails()) {
                productRepository.findById(detail.getProductId()).ifPresent(product -> {
                    int stock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                    product.setStockQuantity(stock + detail.getQuantity());
                    productRepository.save(product);
                });
            }
        }

        order.setStatus(status);
        return orderRepository.save(order);
    }

    public List<Order> findMyOrders(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng"));
        return orderRepository.findByCustomerIdOrderByOrderDateDesc(customer.getId());
    }
}