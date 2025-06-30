package vn.edu.actvn.server.service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import vn.edu.actvn.server.dto.request.auth.AuthenticationRequest;
import vn.edu.actvn.server.dto.request.auth.IntrospectRequest;
import vn.edu.actvn.server.dto.request.auth.LogoutRequest;
import vn.edu.actvn.server.dto.request.auth.RefreshRequest;
import vn.edu.actvn.server.dto.response.auth.AuthenticationResponse;
import vn.edu.actvn.server.dto.response.auth.IntrospectResponse;
import vn.edu.actvn.server.entity.InvalidatedToken;
import vn.edu.actvn.server.entity.User;
import vn.edu.actvn.server.exception.AppException;
import vn.edu.actvn.server.exception.ErrorCode;
import vn.edu.actvn.server.mapper.UserMapper;
import vn.edu.actvn.server.repository.*;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;
    UserMapper userMapper;
    TeacherRepository teacherRepository;
    StudentRepository studentRepository;
    ParentRepository parentRepository;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.access-exp}")
    protected long ACCESS_EXPIRATION;

    @NonFinal
    @Value("${jwt.refresh-exp}")
    protected long REFRESH_EXPIRATION;

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;

        try {
            verifyToken(token);
        } catch (AppException e) {
            isValid = false;
        }

        return IntrospectResponse.builder().valid(isValid).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        switch (user.getRole().getName()) {
            case "STUDENT" -> {
                user = studentRepository.findById(user.getUserId())
                        .orElseThrow(()->new AppException(ErrorCode.USER_NOT_EXISTED));
            }
            case "TEACHER" -> {
                user = teacherRepository.findById(user.getUserId())
                        .orElseThrow(()->new AppException(ErrorCode.USER_NOT_EXISTED));
            }
            case "PARENT" -> {
                user = parentRepository.findById(user.getUserId())
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            }
            case "ADMIN" -> {
            }
            default -> throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }
        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!authenticated)
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        var accessToken = generateToken(user, ACCESS_EXPIRATION);
        var refreshToken = generateRefreshToken(user, REFRESH_EXPIRATION);

        return AuthenticationResponse.builder()
                .user(userMapper.toUserResponse(user))
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .authenticated(true)
                .build();
    }

    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        invalidateTokenSafe(request.getAccessToken(), "access");
        invalidateTokenSafe(request.getRefreshToken(), "refresh");
    }

    private void invalidateTokenSafe(String token, String type) throws ParseException, JOSEException {
        try {
            var signedToken = verifyToken(token);
            String jit = signedToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signedToken.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                    .id(jit)
                    .expiryTime(expiryTime)
                    .type(type)
                    .build();

            invalidatedTokenRepository.save(invalidatedToken);
        } catch (AppException e) {
            log.warn("{} token already expired or invalid", type);
        }
    }

    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        var signedJWT = verifyToken(request.getToken());

        var username = signedJWT.getJWTClaimsSet().getSubject();

        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        var type = signedJWT.getJWTClaimsSet().getStringClaim("type");
        if (!"refresh".equals(type)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        var token = generateToken(user, ACCESS_EXPIRATION);

        return AuthenticationResponse.builder()
                .accessToken(token)
                .refreshToken(request.getToken())
                .authenticated(true)
                .build();
    }

    private String generateToken(User user, long validDuration) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("actvn.edu.vn")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(validDuration, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .claim("type", "access")
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new RuntimeException(e);
        }
    }

    private String generateRefreshToken(User user, long validDuration) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("actvn.edu.vn")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(validDuration, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("type", "refresh")
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create refresh token", e);
            throw new RuntimeException(e);
        }
    }

    private SignedJWT verifyToken(String token) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        if (!(verified && expiryTime.after(new Date())))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        if (invalidatedTokenRepository
                .existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        return signedJWT;
    }

    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (user.getRole() != null) {
            stringJoiner.add("ROLE_" + user.getRole().getName());

            if (user.getRole().getPermissions() != null && !user.getRole().getPermissions().isEmpty()) {
                user.getRole().getPermissions().forEach(permission ->
                        stringJoiner.add(permission.getPermission())
                );
            }
        }

        return stringJoiner.toString();
    }

    @Transactional
    @Scheduled(cron = "0 0 0 * * *")
    public int clearTokenDatabase() {
        log.warn("Clearing expired tokens...");

        Instant now = Instant.now();
        java.sql.Date accessThreshold = new java.sql.Date(now.minusSeconds(ACCESS_EXPIRATION).toEpochMilli());
        java.sql.Date refreshThreshold = new java.sql.Date(now.minusSeconds(REFRESH_EXPIRATION).toEpochMilli());

        // Xoá access token hết hạn
        int accessDeleted = invalidatedTokenRepository
                .deleteByTypeAndExpiryTimeBefore("access", accessThreshold);

        // Xoá refresh token hết hạn
        int refreshDeleted = invalidatedTokenRepository
                .deleteByTypeAndExpiryTimeBefore("refresh", refreshThreshold);

        log.warn("Deleted {} expired access tokens and {} expired refresh tokens", accessDeleted, refreshDeleted);
        return accessDeleted + refreshDeleted;
    }

}
