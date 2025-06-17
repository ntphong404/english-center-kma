package vn.edu.actvn.server.service;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import vn.edu.actvn.server.dto.request.attendance.AttendanceUpdateRequest;
import vn.edu.actvn.server.dto.request.payment.CreatePaymentRequest;
import vn.edu.actvn.server.dto.request.tuitionfee.CreateTuitionFeeRequest;
import vn.edu.actvn.server.dto.response.attendance.AttendanceResponse;
import vn.edu.actvn.server.dto.response.payment.PaymentResponse;
import vn.edu.actvn.server.entity.*;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.mapper.AttendanceMapper;
import vn.edu.actvn.server.mapper.PaymentMapper;
import vn.edu.actvn.server.repository.AttendanceRepository;
import vn.edu.actvn.server.repository.PaymentRepository;
import vn.edu.actvn.server.repository.TuitionFeeRepository;
import vn.edu.actvn.server.utils.BigDecimalUtils;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static lombok.AccessLevel.PRIVATE;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class PaymentService {

    PaymentRepository paymentRepository;
    TuitionFeeRepository tuitionFeeRepository;
    PaymentMapper paymentMapper;

    @PreAuthorize("hasAuthority('PAYMENT_CREATE')")
    public PaymentResponse createPayment(CreatePaymentRequest request) {
        TuitionFee tuitionFee = tuitionFeeRepository.findById(request.getTuitionFeeId())
                .orElseThrow(() -> new AppException(ErrorCode.TUITION_FEE_NOT_EXISTED));
        Payment payment = paymentMapper.toPayment(request);
        payment.setTuitionFee(tuitionFee);
        if(BigDecimalUtils.isLessThanOrEqual(payment.getPaidAmount(), BigDecimal.ZERO) ) {
            throw new AppException(ErrorCode.PAYMENT_AMOUNT_INVALID);
        } else if (BigDecimalUtils.isGreaterThanOrEqual(payment.getPaidAmount(), tuitionFee.getRemainingAmount())) {
            tuitionFee.setRemainingAmount(BigDecimal.ZERO);
        } else {
            tuitionFee.setRemainingAmount(tuitionFee.getRemainingAmount().subtract(payment.getPaidAmount()));
        }
        tuitionFeeRepository.save(tuitionFee);
        return paymentMapper.toPaymentResponse(paymentRepository.save(payment));
    }

    @PreAuthorize("hasAuthority('PAYMENT_READ')")
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }

    @PreAuthorize("hasAuthority('PAYMENT_READ')")
    public PaymentResponse getPaymentById(String id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_EXISTED));
        return paymentMapper.toPaymentResponse(payment);
    }

    public List<PaymentResponse> getPaymentsByStudentId(String studentId) {
        List<Payment> payments = paymentRepository.findByTuitionFee_Student_UserId(studentId);
        return payments.stream()
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }

    @PreAuthorize("hasAuthority('PAYMENT_READ')")
    public List<PaymentResponse> getPaymentsByStudentIdAndClassId(String studentId, String classId) {
        List<Payment> payments = paymentRepository.findByTuitionFee_Student_UserIdAndTuitionFee_EntityClass_ClassId(
                studentId, classId);
        return payments.stream()
                .map(paymentMapper::toPaymentResponse)
                .toList();
    }

    @PreAuthorize("hasAuthority('PAYMENT_READ')")
    public Page<PaymentResponse> getPagedPaymentsByStudentId(String studentId, Pageable pageable) {
        Page<Payment> paymentsPage = paymentRepository.findByTuitionFee_Student_UserId(pageable, studentId);
        return paymentsPage.map(paymentMapper::toPaymentResponse);
    }

    @PreAuthorize("hasAuthority('PAYMENT_UPDATE')")
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

    @PreAuthorize("hasAuthority('PAYMENT_DELETE')")
    public void deletePayment(String id) {
        if (!paymentRepository.existsById(id)) {
            throw new AppException(ErrorCode.PAYMENT_NOT_EXISTED);
        }
        paymentRepository.deleteById(id);
    }
}
