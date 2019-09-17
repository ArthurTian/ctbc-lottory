package com.ctbc.lottory.model.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import com.ctbc.lottory.model.dto.UsrPool;
import com.ctbc.lottory.util.FnBean;

import lombok.extern.log4j.Log4j2;

@Repository
@Log4j2
public class LastPartyAdminDAOImpl {


	@Autowired
	JdbcTemplate jdbc;

	public List<UsrPool> getUserList(int start, int display) {
		String sql = "select a.*, ifnull((select keyval from systeminfo where keytype='EMPLOYEE'"
				+ " and keyid = a.employee),a.employee) as emtype from user a";
		if (start >= 0 && display >= 1) {
			sql += " limit " + display + " offset " + start;
		}
		log.info(sql);
		return jdbc.query(sql, new RowMapper<UsrPool>() {
			@Override
			public UsrPool mapRow(ResultSet rs, int i) throws SQLException {
				UsrPool usr = new UsrPool();
				usr.setUserId(rs.getString("USERID"));
				usr.setUserName(rs.getString("USERNAME"));
				usr.setIsOff(rs.getString("ISOFF"));
				usr.setDepartment(rs.getString("DEPARTMENT"));
				usr.setDepGroup(rs.getString("DEPGROUP"));
				usr.setEmType(rs.getString("EMTYPE"));
				usr.setEmployee(rs.getInt("EMPLOYEE"));
				return usr;
			}
		});
	}

	public int deleteUserList() {
		int i = jdbc.update("delete from USER");
		return i;
	}

	public Map queryLastBatchInfo(String batchType) {
		Map map = null;
		String sql = "select * from BATCHINFO where batchType= ? order by seq desc limit 1";
		log.info(sql);
		try {
			map = jdbc.queryForMap(sql, new Object[] { batchType });
		} catch (Exception ex) {
			log.error(ex.getMessage());
		}
		return map;
	}

	public String queryBatchInfo(String batchType, int seq) {
		String s = null;
		String sql = "select STATUS from BATCHINFO where batchType= ? seq = ?";
		log.info(sql);
		try {
			s = jdbc.queryForObject(sql, new Object[] { batchType, seq }, String.class);
		} catch (Exception ex) {
			log.error(ex.getMessage());
		}
		return s;
	}


	public int insertUserList(List<UsrPool> list) {
		String sql = "insert into USER (USERID,USERNAME,DEPARTMENT,DEPGROUP,ISOFF,EMPLOYEE) "
				+ "values (?,?,?,?,?,?)";
		int updCnt = 0;
		Connection conn = null;
		PreparedStatement ps = null;
		try {
			conn = jdbc.getDataSource().getConnection();
			ps = conn.prepareStatement(sql);
			conn.setAutoCommit(false);
			for (UsrPool usr : list) {
				ps.setString(1, usr.getUserId());
				ps.setString(2, usr.getUserName());
				ps.setString(3, usr.getDepartment());
				ps.setString(4, usr.getDepGroup());
				ps.setString(5, usr.getIsOff());
				ps.setInt(6, usr.getEmployee());
				ps.addBatch();
				log.info(usr.toString());
			}
			log.info("Executin SQL update [{}]",sql);
			
			int[] upd = ps.executeBatch();
			conn.commit();
			conn.setAutoCommit(true);
			updCnt = FnBean.arrayToCnt(upd);
			log.info("insert USER for {} rows", updCnt);
		} catch (SQLException e) {
			e.printStackTrace();
		} finally {
			try {
				ps.close();
				conn.close();
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
		return updCnt;
	}

	
	
	

	public List<Map<String, Object>> getPrize() {
		String sql = "select * from PRIZE";
		List<Map<String, Object>> list = jdbc.queryForList(sql);
		log.info("{}", list);
		return list;
	}

	public int addPrize(String prizeid, String prizeName, String level, int total, String memo) {
		
		prizeid = "PL";
		String sql = "select max(cast(substr(prizeid,3) as integer)) +1 as cnt from prize";
		int id = jdbc.queryForObject(sql, Integer.class);
		prizeid += id;
		
		
		sql = "insert into PRIZE (prizeid, Prize_name,prize_level,total,memo) values (?,?,?,?,?)";
		Object[] param = new Object[] {prizeid, prizeName, level, total, memo };
		log.info(sql + ";({})", param);
		return jdbc.update(sql, param);
	}

	public int deletePrize(String prizeid) {
		String sql = "delete from  PRIZE where prizeid = ?";
		Object[] param = new Object[] { prizeid };
		log.info(sql + ";({})", param);
		return jdbc.update(sql, param);
	}

	public int updatePrize(String prizeid, String prizeName, String level, int total, String memo) {
		String sql = "update PRIZE set Prize_name=?,prize_level=?,total=?,memo=? where prizeid = ?";
		Object[] param = new Object[] { prizeName, level, total, memo, prizeid };
		log.info(sql + ";({})", param);
		return jdbc.update(sql, param);
	}

	public List<Map<String, Object>> getPrizelog() {
		return getPrizelog(null);
	}

	public List<Map<String, Object>> getPrizelog(String prizeid) {
		String sql = "SELECT a.*,(SELECT PRIZE_NAME FROM prize WHERE prizeid = a.prizeid) AS PRIZE_NAME"
				+ ",b.* FROM prize_log a,user b WHERE a.USERID = b.USERID ";
		if (prizeid != null && !"".equals(prizeid)) {
			sql += "and a.prizeid = '" + prizeid + "'";
		}
		log.info(sql);
		List<Map<String, Object>> list = jdbc.queryForList(sql);
		// log.info("{}", list);
		return list;
	}

	public int updateWinnerStatus(String userid) {
		String sql = "UPDATE PRIZE_LOG SET STATUS = '1' WHERE USERID = ?";
		log.info(sql);
		return jdbc.update(sql, new Object[] { userid });
	}

	public List<Map<String, Object>> getPrizeTablelog() {
		return getPrizeTablelog(null);
	}

	public List<Map<String, Object>> getPrizeTablelog(String prizeid) {
		String sql = "select a.* ,  (select prize_name from prize where prizeid = a.prizeid ) PRIZE_NAME from ptable_log a , ptable b where a.tbid = b.tbid";
		if (prizeid != null && !"".equals(prizeid)) {
			sql += " and a.prizeid = '" + prizeid + "'";
		}
		log.info(sql);
		List<Map<String, Object>> list = jdbc.queryForList(sql);
		log.info("{}", list);
		return list;
	}
	
	/**
	 * 
	 * @param type
	 * @param user
	 * @return
	 */
	public int updateUserStatus(String type,String user) {
		String sql = "update user set employee = ? where userid = ?";
		Object[] param = {type,user};
		if("off".equals(type)) {
			sql = "update user set isoff = 'Y' where userid = ?";
			param = new Object[] {user};
		}else if("on".equals(type)) {
			sql = "update user set isoff = 'N' where userid = ?";
			param = new Object[] {user};
		}
		return jdbc.update(sql,param);
	}
	
	
	public void deleteWinnerLog() {
		String ns = new SimpleDateFormat("MMdd_HHmmssSSS").format(new Date());
		String newTable = "PRIZE_LOG_"+ns;
		String sql = "ALTER TABLE PRIZE_LOG RENAME TO " + newTable;
		
		jdbc.execute(sql);
		
//		sql = "CREATE TABLE PRIZE_LOG AS SELECT * FROM "+newTable+" WHERE 0";
		sql = "SELECT sql FROM sqlite_master WHERE type='table' AND name=?";
		String newSql = jdbc.queryForObject(sql, new Object[] {newTable},String.class);
		newSql = newSql.replaceAll(newTable, "PRIZE_LOG");
		
//		CREATE TABLE "prize_log_215419017" (USERID TEXT, PRIZEID TEXT, TIMEST DATETIME, STATUS TEXT DEFAULT ('0'), RUNCNT INTEGER)
		jdbc.execute(newSql);
		
	}
}
