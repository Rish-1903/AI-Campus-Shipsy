import React from 'react';

interface TaskFilterProps {
  filters: any;
  onFilterChange: (filters: any) => void;
}

const TaskFilter: React.FC<TaskFilterProps> = ({ filters, onFilterChange }) => {
  const handleChange = (key: string, value: string) => {
    onFilterChange({ [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      status: '',
      priority: '',
      is_urgent: '',
      search: '',
      page: 1
    });
  };

  return (
    <div className="task-filters">
      <div className="filter-group">
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <select 
          value={filters.status} 
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="filter-group">
        <select 
          value={filters.priority} 
          onChange={(e) => handleChange('priority', e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="filter-group">
        <select 
          value={filters.is_urgent} 
          onChange={(e) => handleChange('is_urgent', e.target.value)}
        >
          <option value="">All Tasks</option>
          <option value="true">Urgent Only</option>
          <option value="false">Not Urgent</option>
        </select>
      </div>

      <div className="filter-group">
        <select 
          value={filters.limit} 
          onChange={(e) => handleChange('limit', e.target.value)}
        >
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
        </select>
      </div>

      <button onClick={clearFilters} className="btn-secondary">
        Clear Filters
      </button>
    </div>
  );
};

export default TaskFilter;
