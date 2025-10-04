import React, { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import { Task } from '../types';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: () => void;
  onClose: () => void;
}

interface FormData {
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  is_urgent: boolean;
  estimated_hours: number;
  actual_hours: number;
  due_date: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    is_urgent: false,
    estimated_hours: 1,
    actual_hours: 0,
    due_date: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        is_urgent: task.is_urgent,
        estimated_hours: task.estimated_hours,
        actual_hours: task.actual_hours,
        due_date: task.due_date || ''
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    setLoading(true);

    try {
      if (task) {
        await tasksAPI.update(task.id, formData);
      } else {
        await tasksAPI.create(formData);
      }
      onSubmit();
    } catch (error: any) {
      console.error('Error saving task:', error);
      alert(error.response?.data?.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{task ? 'Edit Task' : 'Create New Task'}</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Estimated Hours</label>
              <input
                type="number"
                name="estimated_hours"
                value={formData.estimated_hours}
                onChange={handleChange}
                min="0"
                step="0.5"
              />
            </div>

            <div className="form-group">
              <label>Actual Hours</label>
              <input
                type="number"
                name="actual_hours"
                value={formData.actual_hours}
                onChange={handleChange}
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="is_urgent"
                  checked={formData.is_urgent}
                  onChange={handleChange}
                />
                Urgent Task
              </label>
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
              />
            </div>
          </div>

          {formData.actual_hours > 0 && (
            <div className="efficiency-display">
              Efficiency Ratio: {(formData.estimated_hours / formData.actual_hours).toFixed(2)}
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (task ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
