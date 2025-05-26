import React, { useEffect, useState, useCallback } from 'react';
import { getActivityLogsForTask } from '../../api/activityLogService';

const ActivityLogList = ({ taskId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getActivityLogsForTask(taskId, localStorage.getItem('jira-token'));
      setLogs(data);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  },[taskId]);

  useEffect(() => {
    if (taskId) loadLogs();
  }, [taskId, loadLogs]);

  if (loading) return <div>Loading activity logs...</div>;

  return (
    <div>
      <h3>Activity Log</h3>
      <ul style={{ maxHeight: 200, overflowY: 'auto' }}>
        {logs.map((log) => (
          <li key={log.id}>
            [{new Date(log.timestamp).toLocaleString()}] User {log.user_id} {log.action}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLogList;
