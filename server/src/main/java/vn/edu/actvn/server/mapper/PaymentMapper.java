package vn.edu.actvn.server.mapper;

import org.mapstruct.*;
import vn.edu.actvn.server.dto.request.payment.CreatePaymentRequest;
import vn.edu.actvn.server.dto.response.payment.PaymentResponse;
import vn.edu.actvn.server.entity.Payment;

@Mapper(
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        componentModel = MappingConstants.ComponentModel.SPRING,
        uses = {DateMapper.class,TuitionFeeMapper.class})
public interface PaymentMapper {
    Payment toPayment(CreatePaymentRequest createPaymentRequest);

    PaymentResponse toPaymentResponse(Payment payment);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void partialUpdate(CreatePaymentRequest createPaymentRequest, @MappingTarget Payment payment);
}