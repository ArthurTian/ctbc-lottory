package com.ctbc.lottory.model.dto;

public class Winner {

	String userId;
	String userName;
	String department;
	String depGroup;
	String isOff;
	String status;
	int runcnt;

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public int getRuncnt() {
		return runcnt;
	}

	public void setRuncnt(int runcnt) {
		this.runcnt = runcnt;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getDepartment() {
		return department;
	}

	public void setDepartment(String department) {
		this.department = department;
	}

	public String getDepGroup() {
		return depGroup;
	}

	public void setDepGroup(String depGroup) {
		this.depGroup = depGroup;
	}

	public String getIsOff() {
		return isOff;
	}

	public void setIsOff(String isOff) {
		this.isOff = isOff;
	}

}
