import { TuitionFeeResponse } from "./tuitionfee";

export interface PaymentResponse {
    paymentId: string;
    tuitionFee: TuitionFeeResponse;
    paidAmount: number;
}

export interface PaymentCreateRequest {
    tuitionFeeId: string;
    paidAmount: number;
}