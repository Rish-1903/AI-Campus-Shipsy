import React, { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import { Task, TasksResponse } from '../types';
import TaskForm from './TaskForm';
import TaskFilter from './TaskFilter';
import AIAnalysis from './AIAnalysis';

interface Filters {
  page: number;
  limit: number;
  status: string;
  priority: string;
  is_urgent: string;
  search: string;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 5,
    status: '',
    priority: '',
    is_urgent: '',
    search: ''
  });

  const loadTasks = async () => {
    setLoading(true);
    
    try {
      const response = await tasksAPI.getAll(filters);
      const data: TasksResponse = response.data;
      
      setTasks(data.tasks);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const handleCreate = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.delete(id);
        loadTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleFormSubmit = () => {
    loadTasks();
    handleFormClose();
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  return (
    <div className="task-list-container">
      <div className="task-header">
        <h2>Task Management</h2>
        <button onClick={handleCreate} className="btn-primary">
          Create New Task
        </button>
      </div>

      {/* AI Analysis Section */}
      <AIAnalysis />

      <TaskFilter filters={filters} onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks found</h3>
          <p>Create your first task to get started!</p>
          <button onClick={handleCreate} className="btn-primary">
            Create Your First Task
          </button>
        </div>
      ) : (
        <>
          <div className="tasks-grid">
            {tasks.map(task => (
              <div key={task.id} className={`task-card priority-${task.priority} ${task.is_urgent ? 'urgent' : ''}`}>
                <div className="task-header">
                  <h3>{task.title}</h3>
                  <div className="task-actions">
                    <button onClick={() => handleEdit(task)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDelete(task.id)} className="btn-delete">Delete</button>
                  </div>
                </div>
                
                <p className="task-description">{task.description}</p>
                
                <div className="task-details">
                  <span className={`status status-${task.status}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={`priority priority-${task.priority}`}>
                    {task.priority}
                  </span>
                  {task.is_urgent && <span className="urgent-badge">URGENT</span>}
                </div>

                <div className="task-metrics">
                  <div>Estimated: {task.estimated_hours}h</div>
                  <div>Actual: {task.actual_hours}h</div>
                  <div>Efficiency: {task.efficiency_ratio.toFixed(2)}</div>
                </div>

                {task.due_date && (
                  <div className="task-due-date">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              <button 
                disabled={filters.page <= 1}
                onClick={() => handlePageChange(filters.page - 1)}
              >
                Previous
              </button>
              
              <span>Page {filters.page} of {pagination.pages}</span>
              
              <button 
                disabled={filters.page >= pagination.pages}
                onClick={() => handlePageChange(filters.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showForm && (
        <TaskForm 
          task={editingTask}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default TaskList;
