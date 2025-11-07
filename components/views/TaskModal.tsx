import React, { useState, useEffect } from 'react';
import { Task } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Partial<Task>) => void;
    task: Partial<Task>;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task }) => {
    const [formData, setFormData] = useState<Partial<Task>>(task);

    useEffect(() => {
        setFormData(task);
    }, [task]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!formData.title || !formData.dueDate) {
            alert('Please fill in all fields.');
            return;
        }
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={task.id ? 'Edit Task' : 'Create Task'}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-300">Title</label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        value={formData.title || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="e.g., Follow up on application"
                    />
                </div>
                
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300">Due Date</label>
                    <input
                        type="date"
                        name="dueDate"
                        id="dueDate"
                        value={formData.dueDate ? formData.dueDate.split('T')[0] : ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save Task</Button>
                </div>
            </div>
        </Modal>
    );
};

export default TaskModal;
