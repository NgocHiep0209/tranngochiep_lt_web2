package com.example.fashionstore.service;

import com.example.fashionstore.dto.CouponValidationResponse;
import com.example.fashionstore.dto.CustomerCouponResponse;
import com.example.fashionstore.entity.Coupon;
import com.example.fashionstore.entity.CustomerCoupon;
import com.example.fashionstore.exception.BadRequestException;
import com.example.fashionstore.exception.ResourceNotFoundException;
import com.example.fashionstore.repository.CouponRepository;
import com.example.fashionstore.repository.CustomerCouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponService {

    private static final Set<String> VALID_TYPES = Set.of("PERCENT", "FIXED");

    private final CouponRepository couponRepository;
    private final CustomerCouponRepository customerCouponRepository;

    public List<Coupon> findAll() {
        return couponRepository.findAll();
    }

    public Coupon findById(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá với id: " + id));
    }

    @Transactional
    public Coupon create(Coupon coupon) {
        validateInput(coupon);
        couponRepository.findByCodeIgnoreCase(coupon.getCode()).ifPresent(c -> {
            throw new BadRequestException("Mã giảm giá \"" + coupon.getCode() + "\" đã tồn tại");
        });
        coupon.setId(null);
        coupon.setUsedCount(0);
        if (coupon.getActive() == null) coupon.setActive(true);
        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon update(Long id, Coupon payload) {
        validateInput(payload);
        Coupon existing = findById(id);
        couponRepository.findByCodeIgnoreCase(payload.getCode()).ifPresent(c -> {
            if (!c.getId().equals(id)) {
                throw new BadRequestException("Mã giảm giá \"" + payload.getCode() + "\" đã tồn tại");
            }
        });
        existing.setCode(payload.getCode().trim().toUpperCase());
        existing.setDescription(payload.getDescription());
        existing.setDiscountType(payload.getDiscountType());
        existing.setDiscountValue(payload.getDiscountValue());
        existing.setMaxDiscountAmount(payload.getMaxDiscountAmount());
        existing.setMinOrderAmount(payload.getMinOrderAmount());
        existing.setStartDate(payload.getStartDate());
        existing.setEndDate(payload.getEndDate());
        existing.setUsageLimit(payload.getUsageLimit());
        existing.setActive(payload.getActive() != null ? payload.getActive() : existing.getActive());
        return couponRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        Coupon coupon = findById(id);
        couponRepository.delete(coupon);
    }

    private void validateInput(Coupon coupon) {
        if (coupon.getCode() == null || coupon.getCode().trim().isEmpty()) {
            throw new BadRequestException("Mã giảm giá không được để trống");
        }
        if (coupon.getDiscountType() == null || !VALID_TYPES.contains(coupon.getDiscountType().toUpperCase())) {
            throw new BadRequestException("Loại giảm giá không hợp lệ. Chỉ chấp nhận: " + VALID_TYPES);
        }
        coupon.setDiscountType(coupon.getDiscountType().toUpperCase());
        if (coupon.getDiscountValue() == null || coupon.getDiscountValue() <= 0) {
            throw new BadRequestException("Giá trị giảm giá phải lớn hơn 0");
        }
        if ("PERCENT".equals(coupon.getDiscountType()) && coupon.getDiscountValue() > 100) {
            throw new BadRequestException("Giảm theo phần trăm không được vượt quá 100%");
        }
        if (coupon.getStartDate() != null && coupon.getEndDate() != null
                && coupon.getStartDate().isAfter(coupon.getEndDate())) {
            throw new BadRequestException("Ngày bắt đầu phải trước ngày kết thúc");
        }
    }

    /**
     * Kiểm tra mã giảm giá có hợp lệ và áp dụng được cho đơn hàng có tổng tiền orderAmount không.
     * Không tăng usedCount ở đây (chỉ dùng để preview trước khi đặt hàng).
     */
    public CouponValidationResponse validate(String rawCode, Double orderAmount) {
        Coupon coupon = getUsableCoupon(rawCode, orderAmount);
        double discount = calculateDiscount(coupon, orderAmount);
        return new CouponValidationResponse(
                coupon.getCode(),
                discount,
                Math.max(0, orderAmount - discount),
                "Áp dụng mã giảm giá thành công"
        );
    }

    /**
     * Được gọi trong lúc tạo đơn hàng (OrderService). Trả về số tiền được giảm,
     * đồng thời tăng usedCount ngay trong cùng transaction với việc tạo đơn.
     */
    @Transactional
    public double applyCoupon(String rawCode, double orderAmount) {
        Coupon coupon = getUsableCoupon(rawCode, orderAmount);
        double discount = calculateDiscount(coupon, orderAmount);
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
        return discount;
    }

    private Coupon getUsableCoupon(String rawCode, Double orderAmount) {
        if (rawCode == null || rawCode.trim().isEmpty()) {
            throw new BadRequestException("Vui lòng nhập mã giảm giá");
        }
        Coupon coupon = couponRepository.findByCodeIgnoreCase(rawCode.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Mã giảm giá không tồn tại"));

        if (!Boolean.TRUE.equals(coupon.getActive())) {
            throw new BadRequestException("Mã giảm giá này đã bị vô hiệu hóa");
        }
        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            throw new BadRequestException("Mã giảm giá chưa đến thời gian sử dụng");
        }
        if (coupon.getEndDate() != null && now.isAfter(coupon.getEndDate())) {
            throw new BadRequestException("Mã giảm giá đã hết hạn sử dụng");
        }
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() != null
                && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Mã giảm giá đã hết lượt sử dụng");
        }
        double amount = orderAmount != null ? orderAmount : 0;
        if (coupon.getMinOrderAmount() != null && amount < coupon.getMinOrderAmount()) {
            throw new BadRequestException(
                    "Đơn hàng cần tối thiểu " + formatVnd(coupon.getMinOrderAmount()) + " để áp dụng mã này");
        }
        return coupon;
    }

    private double calculateDiscount(Coupon coupon, double orderAmount) {
        double discount;
        if ("PERCENT".equals(coupon.getDiscountType())) {
            discount = orderAmount * (coupon.getDiscountValue() / 100.0);
            if (coupon.getMaxDiscountAmount() != null) {
                discount = Math.min(discount, coupon.getMaxDiscountAmount());
            }
        } else {
            discount = coupon.getDiscountValue();
        }
        return Math.min(discount, orderAmount);
    }

    private String formatVnd(double amount) {
        return String.format("%,.0f₫", amount);
    }

    // ===== Ví voucher của khách hàng (nhận mã ở thanh điều hướng, áp ở checkout) =====

    /**
     * Danh sách mã giảm giá đang mở cho khách "nhận" (còn hiệu lực, còn lượt dùng).
     * Nếu có customerId thì đánh dấu luôn mã nào khách đã nhận rồi.
     */
    public List<CustomerCouponResponse> getClaimableCoupons(Long customerId) {
        LocalDateTime now = LocalDateTime.now();
        List<CustomerCoupon> myClaims = customerId != null
                ? customerCouponRepository.findByCustomerId(customerId)
                : List.of();

        return couponRepository.findAll().stream()
                .filter(c -> Boolean.TRUE.equals(c.getActive()))
                .filter(c -> c.getStartDate() == null || !now.isBefore(c.getStartDate()))
                .filter(c -> c.getEndDate() == null || !now.isAfter(c.getEndDate()))
                .filter(c -> c.getUsageLimit() == null || c.getUsedCount() == null || c.getUsedCount() < c.getUsageLimit())
                .map(c -> {
                    CustomerCoupon claim = myClaims.stream()
                            .filter(mc -> mc.getCoupon().getId().equals(c.getId()))
                            .findFirst().orElse(null);
                    return toResponse(c, claim != null, claim != null && Boolean.TRUE.equals(claim.getUsed()));
                })
                .collect(Collectors.toList());
    }

    /**
     * Khách bấm "Nhận voucher": lưu mã vào ví riêng của khách đó, mỗi khách chỉ nhận được 1 lần/mã.
     */
    @Transactional
    public CustomerCouponResponse claimCoupon(Long customerId, Long couponId) {
        if (customerId == null) {
            throw new BadRequestException("Vui lòng đăng nhập để nhận voucher");
        }
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá"));

        if (!Boolean.TRUE.equals(coupon.getActive())) {
            throw new BadRequestException("Mã giảm giá này đã bị vô hiệu hóa");
        }
        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            throw new BadRequestException("Mã giảm giá chưa đến thời gian sử dụng");
        }
        if (coupon.getEndDate() != null && now.isAfter(coupon.getEndDate())) {
            throw new BadRequestException("Mã giảm giá đã hết hạn sử dụng");
        }
        if (customerCouponRepository.existsByCustomerIdAndCouponId(customerId, couponId)) {
            throw new BadRequestException("Bạn đã nhận mã giảm giá này rồi");
        }

        CustomerCoupon claim = new CustomerCoupon();
        claim.setCustomerId(customerId);
        claim.setCoupon(coupon);
        customerCouponRepository.save(claim);

        return toResponse(coupon, true, false);
    }

    /**
     * Voucher mà khách đã nhận (ví voucher) - dùng để hiển thị ở trang thanh toán.
     */
    public List<CustomerCouponResponse> getMyCoupons(Long customerId) {
        if (customerId == null) {
            return List.of();
        }
        return customerCouponRepository.findByCustomerId(customerId).stream()
                .map(claim -> toResponse(claim.getCoupon(), true, Boolean.TRUE.equals(claim.getUsed())))
                .collect(Collectors.toList());
    }

    /**
     * Sau khi đặt hàng thành công có áp mã, nếu mã đó nằm trong ví của khách thì đánh dấu đã dùng
     * để không hiện lại ở danh sách "voucher của bạn" cho lần thanh toán sau.
     */
    @Transactional
    public void markClaimedAsUsed(Long customerId, String code) {
        if (customerId == null || code == null) {
            return;
        }
        couponRepository.findByCodeIgnoreCase(code.trim()).ifPresent(coupon ->
                customerCouponRepository.findByCustomerIdAndCouponId(customerId, coupon.getId())
                        .ifPresent(claim -> {
                            claim.setUsed(true);
                            customerCouponRepository.save(claim);
                        })
        );
    }

    private CustomerCouponResponse toResponse(Coupon c, boolean claimed, boolean used) {
        return new CustomerCouponResponse(
                c.getId(), c.getCode(), c.getDescription(), c.getDiscountType(),
                c.getDiscountValue(), c.getMaxDiscountAmount(), c.getMinOrderAmount(),
                c.getEndDate(), claimed, used
        );
    }
}
