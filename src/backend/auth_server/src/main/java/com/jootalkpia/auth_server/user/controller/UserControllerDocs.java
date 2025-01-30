package com.jootalkpia.auth_server.user.controller;


import com.jootalkpia.auth_server.client.dto.UserLoginRequest;
import com.jootalkpia.auth_server.user.dto.LoginSuccessResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "User", description = "User 관련 API")
public interface UserControllerDocs {
    @Operation(summary = "소셜 로그인")
    @ApiResponses(
            value = {
                    @ApiResponse(responseCode = "A40004", description = "인가 코드가 만료되었습니다."),
                    @ApiResponse(responseCode = "A40005", description = "로그인 요청이 유효하지 않습니다."),
                    @ApiResponse(responseCode = "A40100", description = "액세스 토큰이 만료되었습니다."),
                    @ApiResponse(responseCode = "A40101", description = "리프레시 토큰이 만료되었습니다."),
                    @ApiResponse(responseCode = "A40102", description = "리프레시 토큰이 유효하지 않습니다."),
                    @ApiResponse(responseCode = "A40103", description = "유효하지 않은 토큰입니다."),
                    @ApiResponse(responseCode = "A40104", description = "해당 유저의 리프레시 토큰이 존재하지 않습니다.")
            }
    )
    ResponseEntity<LoginSuccessResponse> login(
            @RequestParam final String authorizationCode,
            @RequestBody final UserLoginRequest loginRequest
    );
}
