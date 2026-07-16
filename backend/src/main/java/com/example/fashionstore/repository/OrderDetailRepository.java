package com.example.fashionstore.repository;

import com.example.fashionstore.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

    // Tổng số lượng đã bán theo từng sản phẩm, bỏ qua các đơn đã hủy
    // (dùng để sắp xếp "Bán chạy nhất" và cho dashboard thống kê)
    @Query("SELECT od.productId AS productId, SUM(od.quantity) AS totalQty " +
           "FROM OrderDetail od " +
           "WHERE od.order.status <> 'cancelled' " +
           "GROUP BY od.productId " +
           "ORDER BY SUM(od.quantity) DESC")
    List<ProductSoldQuantity> findBestSellingProductIds();

    interface ProductSoldQuantity {
        Long getProductId();
        Long getTotalQty();
    }
}
