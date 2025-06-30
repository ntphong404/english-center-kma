package vn.edu.actvn.server.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.actvn.server.dto.request.teacherpayment.CreateTeacherPaymentRequest;
import vn.edu.actvn.server.dto.request.teacherpayment.UpdateTeacherPaymentRequest;
import vn.edu.actvn.server.dto.response.teacherpayment.TeacherPaymentResponse;
import vn.edu.actvn.server.entity.Teacher;
import vn.edu.actvn.server.entity.TeacherPayment;
import vn.edu.actvn.server.entity.TeacherPayment.Status;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.mapper.TeacherPaymentMapper;
import vn.edu.actvn.server.mapper.UserMapper;
import vn.edu.actvn.server.repository.TeacherPaymentRepository;
import vn.edu.actvn.server.repository.TeacherRepository;
import vn.edu.actvn.server.utils.BigDecimalUtils;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TeacherPaymentService {
    TeacherPaymentRepository teacherPaymentRepository;
    TeacherRepository teacherRepository;
    TeacherPaymentMapper teacherPaymentMapper;

    @PreAuthorize("hasRole('ADMIN')")
    public Page<TeacherPaymentResponse> getAll(String teacherId,Integer month, Integer year,Pageable pageable) {
        if(teacherId == null) teacherId = "";
        if(month == null) month = 0;
        if(year == null) year = 0;
        return teacherPaymentRepository.search(teacherId,month,year,pageable).map(teacherPaymentMapper::toResponse);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public TeacherPaymentResponse create(CreateTeacherPaymentRequest req) {
        Teacher teacher = teacherRepository.findById(req.getTeacherId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Lấy bản ghi gần nhất theo tháng/năm
        Pageable pageable = PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<TeacherPayment> page = teacherPaymentRepository
                .search(req.getTeacherId(), req.getMonth(), req.getYear(), pageable);

        BigDecimal paidAmount = req.getPaidAmount();
        BigDecimal remainingAmount = req.getAmount().subtract(paidAmount);

        if (!page.isEmpty()) {
            TeacherPayment latest = page.getContent().getFirst();
            if (BigDecimalUtils.isLessThanOrEqual(latest.getRemainingAmount(), BigDecimal.ZERO)) {
                throw new AppException(ErrorCode.ALREADY_PAID);
            } else if(BigDecimalUtils.isLessThanOrEqual(latest.getRemainingAmount(), paidAmount)) {
                remainingAmount = BigDecimal.ZERO;
            } else {
                remainingAmount = latest.getRemainingAmount().subtract(paidAmount);
            }
        }

        TeacherPayment payment = TeacherPayment.builder()
                .teacher(teacher)
                .month(req.getMonth())
                .year(req.getYear())
                .amount(req.getAmount())
                .paidAmount(paidAmount)
                .remainingAmount(remainingAmount)
                .note(req.getNote())
                .build();

        updateStatus(payment);
        teacherPaymentRepository.save(payment);

        return teacherPaymentMapper.toResponse(payment);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public TeacherPaymentResponse updatePaid(String id, UpdateTeacherPaymentRequest req) {
        TeacherPayment payment = teacherPaymentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (req.getPaidAmount() != null) {
            payment.setPaidAmount(payment.getPaidAmount().add(req.getPaidAmount()));
        }
        if (req.getNote() != null) {
            payment.setNote(req.getNote());
        }
        updateStatus(payment);
        teacherPaymentRepository.save(payment);
        return teacherPaymentMapper.toResponse(payment);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public TeacherPaymentResponse getById(String id) {
        TeacherPayment payment = teacherPaymentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return teacherPaymentMapper.toResponse(payment);
    }

    @PreAuthorize("hasRole('ADMIN')")
    private void updateStatus(TeacherPayment payment) {
        if(BigDecimalUtils.isLessThanOrEqual(payment.getRemainingAmount(), BigDecimal.ZERO)) {
            payment.setStatus(Status.PAID);
        } else if(BigDecimalUtils.isGreaterThan(payment.getRemainingAmount(), BigDecimal.ZERO) &&
                  BigDecimalUtils.isLessThan(payment.getRemainingAmount(), payment.getAmount())) {
            payment.setStatus(Status.PARTIALLY_PAID);
        } else {
            payment.setStatus(Status.UNPAID);
        }
    }
}

