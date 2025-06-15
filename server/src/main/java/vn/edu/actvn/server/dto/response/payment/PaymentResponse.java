package vn.edu.actvn.server.dto.response.payment;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.actvn.server.dto.response.tuitionfee.TuitionFeeResponse;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {
    String paymentId;
    TuitionFeeResponse tuitionFee;
    BigDecimal paidAmount;
}
