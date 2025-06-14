package vn.edu.actvn.server.mapper;

import org.mapstruct.*;
import vn.edu.actvn.server.dto.request.tuitionfee.CreateTuitionFeeRequest;
import vn.edu.actvn.server.dto.request.tuitionfee.UpdateTuitionFeeRequest;
import vn.edu.actvn.server.dto.response.tuitionfee.TuitionFeeResponse;
import vn.edu.actvn.server.entity.TuitionFee;

import java.time.LocalDate;
import java.time.YearMonth;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE, componentModel = MappingConstants.ComponentModel.SPRING)
public interface TuitionFeeMapper {
    TuitionFee toTuitionFee(CreateTuitionFeeRequest createTuitionFeeRequest);

    @Mapping(target = "studentId", source = "student.userId")
    @Mapping(target = "classId", source = "entityClass.classId")
    @Mapping(target = "yearMonth", source = "yearMonth", qualifiedByName = "localDateToYearMonth")
    TuitionFeeResponse toTuitionFeeResponse(TuitionFee tuitionFee);

    @Named("localDateToYearMonth")
    default YearMonth localDateToYearMonth(LocalDate localDate) {
        return localDate != null ? YearMonth.from(localDate) : null;
    }

    void update(UpdateTuitionFeeRequest updateTuitionFeeRequest, @MappingTarget TuitionFee tuitionFee);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void partialUpdate(UpdateTuitionFeeRequest updateTuitionFeeRequest, @MappingTarget TuitionFee tuitionFee);
}