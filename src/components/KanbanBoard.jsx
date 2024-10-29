import React, { useState, useEffect } from 'react';
import TaskCard from './TaskCard';
import '../styles/KanbanBoard.css';

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState(localStorage.getItem('grouping') || 'status');
  const [sorting, setSorting] = useState(localStorage.getItem('sorting') || 'priority');
  const [displaySettings, setDisplaySettings] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('https://api.quicksell.co/v1/internal/frontend-assignment');
      const data = await response.json();
      setTickets(data.tickets);
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    localStorage.setItem('grouping', grouping);
    localStorage.setItem('sorting', sorting);
  }, [grouping, sorting]);

  const getPriorityLabel = (priority) => {
    const labels = {
      4: 'Urgent',
      3: 'High',
      2: 'Medium',
      1: 'Low',
      0: 'No priority'
    };
    return labels[priority];
  };

  // Add this handler for dropdown clicks
  const handleDropdownClick = (e) => {
    e.stopPropagation(); // Prevent click from bubbling up
  };

  // Modify the groupTickets function to fix user grouping
  const groupTickets = () => {
    let grouped = {};
    
    if (grouping === 'status') {
      grouped = tickets.reduce((acc, ticket) => {
        const status = ticket.status;
        if (!acc[status]) acc[status] = [];
        acc[status].push(ticket);
        return acc;
      }, {});
    } else if (grouping === 'user') {
      // Create groups for all users first
      users.forEach(user => {
        grouped[user.name] = [];
      });
      // Add "Unassigned" group
      grouped['Unassigned'] = [];
      
      // Distribute tickets to user groups
      tickets.forEach(ticket => {
        const user = users.find(u => u.id === ticket.userId);
        if (user) {
          grouped[user.name].push(ticket);
        } else {
          grouped['Unassigned'].push(ticket);
        }
      });
      
      // Remove empty groups
      Object.keys(grouped).forEach(key => {
        if (grouped[key].length === 0) {
          delete grouped[key];
        }
      });
    } else if (grouping === 'priority') {
      // Initialize all priority groups
      const priorities = {
        4: 'Urgent',
        3: 'High',
        2: 'Medium',
        1: 'Low',
        0: 'No priority'
      };
      
      Object.values(priorities).forEach(priority => {
        grouped[priority] = [];
      });

      tickets.forEach(ticket => {
        const priorityLabel = priorities[ticket.priority];
        grouped[priorityLabel].push(ticket);
      });
      
      // Remove empty groups
      Object.keys(grouped).forEach(key => {
        if (grouped[key].length === 0) {
          delete grouped[key];
        }
      });
    }

    // Sort tickets within each group
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        if (sorting === 'priority') {
          return b.priority - a.priority;
        } else {
          return a.title.localeCompare(b.title);
        }
      });
    });

    return grouped;
  };

  const getGroupIcon = (group) => {
    switch(group.toLowerCase()) {
      case 'no priority': return '⚪';
      case 'urgent': return '🔴';
      case 'high': return '🔺';
      case 'medium': return '🔸';
      case 'low': return '🔹';
      default: return '•';
    }
  };

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <div className="display-button" onClick={() => setDisplaySettings(!displaySettings)}>
          <span>Display ⚙️</span>
          {displaySettings && (
            <div className="display-dropdown" onClick={handleDropdownClick}>
              <div className="dropdown-item">
                <label>Grouping</label>
                <select 
                  value={grouping} 
                  onChange={(e) => setGrouping(e.target.value)}
                >
                  <option value="status">Status</option>
                  <option value="user">User</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
              <div className="dropdown-item">
                <label>Ordering</label>
                <select 
                  value={sorting} 
                  onChange={(e) => setSorting(e.target.value)}
                >
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="kanban-board">
        {Object.entries(groupTickets()).map(([group, groupTickets]) => (
          <div key={group} className="kanban-column">
            <div className="column-header">
              <div className="column-header-left">
                <span className="group-icon">{getGroupIcon(group)}</span>
                <h2 className="column-title">{group}</h2>
                <span className="task-count">{groupTickets.length}</span>
              </div>
              <div className="column-header-right">
                <button className="icon-button">+</button>
                <button className="icon-button">⋯</button>
              </div>
            </div>
            <div className="task-list">
              {groupTickets.map((ticket) => (
                <TaskCard 
                  key={ticket.id} 
                  task={ticket} 
                  user={users.find(u => u.id === ticket.userId)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
