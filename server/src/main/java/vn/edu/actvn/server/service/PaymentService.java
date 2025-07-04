package vn.edu.actvn.server.service;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import vn.edu.actvn.server.dto.request.payment.CreatePaymentRequest;
import vn.edu.actvn.server.dto.response.payment.PaymentResponse;
import vn.edu.actvn.server.entity.*;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.mapper.PaymentMapper;
import vn.edu.actvn.server.repository.PaymentRepository;
import vn.edu.actvn.server.repository.TuitionFeeRepository;
import vn.edu.actvn.server.utils.BigDecimalUtils;

import java.math.BigDecimal;

import static lombok.AccessLevel.PRIVATE;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class PaymentService {

    PaymentRepository paymentRepository;
    TuitionFeeRepository tuitionFeeRepository;
    PaymentMapper paymentMapper;

    @PreAuthorize("hasAuthority('PAYMENT_CREATE') || hasRole('ADMIN')")
    public PaymentResponse createPayment(CreatePaymentRequest request) {
        TuitionFee tuitionFee = tuitionFeeRepository.findById(request.getTuitionFeeId())
                .orElseThrow(() -> new AppException(ErrorCode.TUITION_FEE_NOT_EXISTED));
        Payment payment = paymentMapper.toPayment(request);
        payment.setTuitionFee(tuitionFee);
        if(BigDecimalUtils.isLessThanOrEqual(payment.getPaidAmount(), BigDecimal.ZERO) ) {
            throw new AppException(ErrorCode.PAYMENT_AMOUNT_INVALID);
        } else if (BigDecimalUtils.isGreaterThanOrEqual(payment.getPaidAmount(), tuitionFee.getRemainingAmount())) {
            tuitionFee.setRemainingAmount(BigDecimal.ZERO);
            tuitionFee.setPaidAmount(tuitionFee.getAmount());
        } else {
            tuitionFee.setRemainingAmount(tuitionFee.getRemainingAmount().subtract(payment.getPaidAmount()));
            tuitionFee.setPaidAmount(tuitionFee.getPaidAmount().add(payment.getPaidAmount()));
        }
        tuitionFeeRepository.save(tuitionFee);
        return paymentMapper.toPaymentResponse(paymentRepository.save(payment));
    }

    @PreAuthorize("hasAuthority('PAYMENT_READ') || hasRole('ADMIN')")
    public Page<PaymentResponse> getAllPayments(String studentId,String classId, Pageable pageable) {
        if (studentId == null) {
            studentId = "";
        }
        if (classId == null) {
            classId = "";
        }
        return paymentRepository.search(studentId, classId, pageable)
                .map(paymentMapper::toPaymentResponse);
    }

    @PreAuthorize("hasAuthority('PAYMENT_READ') || hasRole('ADMIN')")
    public PaymentResponse getPaymentById(String id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_EXISTED));
        return paymentMapper.toPaymentResponse(payment);
    }

    @PreAuthorize("hasAuthority('PAYMENT_READ') || hasRole('ADMIN')")
    public Page<PaymentResponse> getPaymentByTuitionFeeId(String tuitionFeeId, Pageable pageable) {
        return paymentRepository.findAllByTuitionFee_TuitionFeeId(tuitionFeeId, pageable).map(paymentMapper::toPaymentResponse);
    }

    @PreAuthorize("hasAuthority('PAYMENT_UPDATE') || hasRole('ADMIN')")
    public PaymentResponse updatePayment(String id, CreatePaymentRequest request) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_EXISTED));

        paymentMapper.partialUpdate(request, payment);

        if (request.getTuitionFeeId() != null) {
            TuitionFee tuitionFee = tuitionFeeRepository.findById(request.getTuitionFeeId())
                    .orElseThrow(() -> new AppException(ErrorCode.TUITION_FEE_NOT_EXISTED));
            payment.setTuitionFee(tuitionFee);
        }

        payment = paymentRepository.save(payment);
        return paymentMapper.toPaymentResponse(payment);
    }

    @PreAuthorize("hasAuthority('PAYMENT_DELETE') || hasRole('ADMIN')")
    public void deletePayment(String id) {
        if (!paymentRepository.existsById(id)) {
            throw new AppException(ErrorCode.PAYMENT_NOT_EXISTED);
        }
        paymentRepository.deleteById(id);
    }
}

