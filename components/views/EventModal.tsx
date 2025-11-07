import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Partial<CalendarEvent>) => void;
    event: Partial<CalendarEvent>;
}

const eventColors = [
    'bg-blue-600',
    'bg-emerald-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-violet-600',
    'bg-cyan-600',
];

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, onSave, event }) => {
    const [formData, setFormData] = useState<Partial<CalendarEvent>>(event);

    useEffect(() => {
        setFormData(event);
    }, [event]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
             setFormData(prev => ({ ...prev, [name]: e.target.checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleColorChange = (color: string) => {
        setFormData(prev => ({ ...prev, color }));
    };

    const handleSubmit = () => {
        // Basic validation
        if (!formData.title || !formData.start || !formData.end || !formData.color) {
            alert('Please fill in all required fields.');
            return;
        }
        if (formData.start > formData.end) {
            alert('End date cannot be before start date.');
            return;
        }
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={event.id ? 'Edit Event' : 'Create Event'}>
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
                        placeholder="e.g., Follow up with merchant"
                    />
                </div>
                
                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <label htmlFor="start" className="block text-sm font-medium text-slate-300">Start Date</label>
                        <input
                            type="date"
                            name="start"
                            id="start"
                            value={formData.start || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                     <div className="flex-1">
                        <label htmlFor="end" className="block text-sm font-medium text-slate-300">End Date</label>
                        <input
                            type="date"
                            name="end"
                            id="end"
                            value={formData.end || ''}
                            onChange={handleInputChange}
                            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                </div>

                <div className="flex items-center">
                    <input
                        id="allDay"
                        name="allDay"
                        type="checkbox"
                        checked={formData.allDay || false}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-accent focus:ring-accent"
                    />
                    <label htmlFor="allDay" className="ml-2 block text-sm text-slate-300">All-day event</label>
                </div>
                
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-300">Description</label>
                    <textarea
                        name="description"
                        id="description"
                        rows={3}
                        value={formData.description || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Add details about the event..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300">Color</label>
                    <div className="mt-2 flex items-center space-x-3">
                        {eventColors.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => handleColorChange(color)}
                                className={`w-8 h-8 rounded-full ${color} transition-transform duration-150 ${formData.color === color ? 'ring-2 ring-offset-2 ring-white ring-offset-slate-800' : 'hover:scale-110'}`}
                                aria-label={`Select color ${color.split('-')[1]}`}
                            />
                        ))}
                    </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save Event</Button>
                </div>
            </div>
        </Modal>
    );
};

export default EventModal;