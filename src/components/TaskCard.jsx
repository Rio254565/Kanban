import React from 'react';
import '../styles/KanbanBoard.css';

const TaskCard = ({ task, user }) => {
  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 4: return '🔴'; // Urgent
      case 3: return '🔺'; // High
      case 2: return '🔸'; // Medium
      case 1: return '🔹'; // Low
      default: return '⚪'; // No priority
    }
  };

  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'done': return '✅';
      case 'in progress': return '🔄';
      case 'todo': return '○';
      case 'backlog': return '•';
      default: return '•';
    }
  };

  return (
    <div className="task-card">
      <div className="task-content">
        <div className="task-header">
          <span className="task-id">{task.id}</span>
          <div className="avatar" title={user?.name || 'Unassigned'}>
            {user?.name?.[0] || '?'}
          </div>
        </div>
        <div className="task-title-container">
          <span className="status-icon">{getStatusIcon(task.status)}</span>
          <h3 className="task-title">{task.title}</h3>
        </div>
        <div className="task-footer">
          <div className="task-priority">
            <span className="priority-icon">{getPriorityIcon(task.priority)}</span>
          </div>
          <div className="task-tags">
            {task.tag && (
              <div className="tag">
                <span className="tag-dot">•</span>
                <span className="tag-text">{task.tag}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
