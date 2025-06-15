package vn.edu.actvn.server.utils;

import java.math.BigDecimal;

public class BigDecimalUtils {

    public static boolean isEqual(BigDecimal a, BigDecimal b) {
        return a != null && b != null && a.compareTo(b) == 0;
    }

    public static boolean isGreaterThan(BigDecimal a, BigDecimal b) {
        return a != null && b != null && a.compareTo(b) > 0;
    }

    public static boolean isGreaterThanOrEqual(BigDecimal a, BigDecimal b) {
        return a != null && b != null && a.compareTo(b) >= 0;
    }

    public static boolean isLessThan(BigDecimal a, BigDecimal b) {
        return a != null && b != null && a.compareTo(b) < 0;
    }

    public static boolean isLessThanOrEqual(BigDecimal a, BigDecimal b) {
        return a != null && b != null && a.compareTo(b) <= 0;
    }

    public static boolean isZero(BigDecimal a) {
        return a != null && a.compareTo(BigDecimal.ZERO) == 0;
    }

    public static boolean isNegative(BigDecimal a) {
        return a != null && a.compareTo(BigDecimal.ZERO) < 0;
    }

    public static boolean isPositive(BigDecimal a) {
        return a != null && a.compareTo(BigDecimal.ZERO) > 0;
    }
}
