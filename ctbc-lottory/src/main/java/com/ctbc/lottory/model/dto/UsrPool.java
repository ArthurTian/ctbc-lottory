package com.ctbc.lottory.model.dto;

public class UsrPool {

	// End Party Use (*USER)
	String userId;
	String userName;
	String department = "";
	String depGroup = "";
	String isOff = "N";
	int employee = 1;
	String emType;
	
	
	

	public int getEmployee() {
		return employee;
	}

	public void setEmployee(int employee) {
		this.employee = employee;
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

	public String getEmType() {
		return emType;
	}

	public void setEmType(String emType) {
		this.emType = emType;
	}


}
