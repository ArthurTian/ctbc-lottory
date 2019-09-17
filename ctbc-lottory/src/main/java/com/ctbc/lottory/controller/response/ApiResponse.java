package com.ctbc.lottory.controller.response;

import lombok.Data;

@Data
public class ApiResponse {

	private int errorcode = 0;
	private String errormsg = "";
	private Object data = null;
	private int seqno;

	public static ApiResponse.Builder getBuilder() {
		return new ApiResponse.Builder();
	}

	protected ApiResponse(ApiResponse.Builder builder) {
		this.errorcode = builder.errorcode;
		this.errormsg = builder.errormsg;
		this.data = builder.data;
	}

	public static final class Builder {
		private int errorcode = 0;
		private String errormsg = "";
		private Object data = null;

		public ApiResponse.Builder status(ErrorCode error) {
			if (error != null) {
				this.errorcode = error.getErrorCode();
				this.errormsg = error.getErrorMessage();
			}
			return this;
		}

		public ApiResponse.Builder data(Object data) {
			this.data = data;
			return this;
		}

		public ApiResponse build() {
			return new ApiResponse(this);
		}
	}
}
