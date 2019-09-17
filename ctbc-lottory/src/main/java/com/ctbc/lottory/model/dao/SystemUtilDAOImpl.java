package com.ctbc.lottory.model.dao;

import java.util.List;
import java.util.Map;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import ch.qos.logback.classic.Logger;

@Repository
public class SystemUtilDAOImpl {
	Logger log = (Logger) LoggerFactory.getLogger(getClass());
	
	@Autowired
	JdbcTemplate jdbc;
	
	
	public int insertBatchInfo(String fname, String batchType) {
		String sql = "INSERT INTO BATCHINFO (FNAME,STATUS,UPTIME,BATCHTYPE) VALUES(?,?,datetime('now','localtime'),?)";
		jdbc.update(sql, new Object[] { fname, 'I', batchType });
		sql = "select seq from batchinfo where status = 'I' and fname=? order by seq desc limit 1";
		return jdbc.queryForObject(sql, new Object[] { fname }, Integer.class);
	}
	
	
	public int updateBatchInfo(int seq, String status, String batchType, int count) {
		log.info("seq={},status={}", seq, status);
		String sql = "update BATCHINFO set status=? ,dntime=datetime('now','localtime') ,cnt=? where seq=? and batchtype=?";
		Object[] param = new Object[] { status, count, String.valueOf(seq), batchType };
		log.info(sql);
		return jdbc.update(sql, param);
	}

	public List<Map<String, Object>> getSystemKeyInfo(String keytype) {
		String sql = "select keyid,keyval from systeminfo where keytype=? and isuse ='Y' order by keyid";
		return jdbc.queryForList(sql, new Object[] {keytype});
	}
	
	public int insertAuditLog(String evntype, String sql, Object param, String evnuser) {
		return insertAuditLog(evntype, String.format(sql.replaceAll("\\?", "%s"),param) , evnuser);
	}
	public int insertAuditLog(String evntype, String evndetail, String evnuser) {
		String sql = "INSERT INTO AUDIT_LOG (EVNTYPE,EVNDETAIL,EVNUSER,UPTIME) VALUES(?,?,?, datetime('now','localtime'))";
		return jdbc.update(sql, new Object[] { evntype, evndetail, evnuser });
	}
	
}
