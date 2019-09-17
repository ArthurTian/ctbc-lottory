package com.ctbc.lottory.controller.response;

public enum ErrorCode {
	
	
	
	SUCCESS(0, "Success"),
	FAIL(9,"Data Error"),
	
	FILE_EMPTY(1001, "File is Empty"),
	
	WINNER_UPDATE_FAIL(2001, "Winner Status update Fail."),
	
	RECORD_UPDATE_FAIL(9001, "Record update Fail.");
	
	private int errorCode = -1;
	private String errorMessage = null;
	
	private ErrorCode(int errorCode, String errorMessage) {
		this.errorCode = errorCode;
		this.errorMessage = errorMessage;
	}

	
	public int getErrorCode() {
		return errorCode;
	}
	public void setErrorCode(int errorCode) {
		this.errorCode = errorCode;
	}
	public String getErrorMessage() {
		return errorMessage;
	}
	public void setErrorMessage(String errorMessage) {
		this.errorMessage = errorMessage;
	}
	
	
}
