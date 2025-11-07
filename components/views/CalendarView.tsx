import React, { useState, useMemo } from 'react';
import { CalendarEvent } from '../../types';
import Button from '../ui/Button';
import EventModal from './EventModal';
import { useData } from '../../contexts/DataContext';

// Helper function to format date
const format = (date: Date, formatStr: string) => {
    return new Intl.DateTimeFormat('en-US', { 
        year: formatStr.includes('YYYY') ? 'numeric' : undefined,
        month: formatStr.includes('MMMM') ? 'long' : '2-digit',
        day: formatStr.includes('DD') ? '2-digit' : undefined,
    }).format(date);
};

// Generates mock events relative to the current month
const generateInitialEvents = (): CalendarEvent[] => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    return [
        { id: 'evt-1', title: 'Follow up: Brooklyn Bagel', start: formatDate(new Date(year, month, 2)), end: formatDate(new Date(year, month, 2)), allDay: true, color: 'bg-blue-600' },
        { id: 'evt-2', title: 'Underwriting Review: QCC', start: formatDate(new Date(year, month, 5)), end: formatDate(new Date(year, month, 5)), allDay: true, color: 'bg-amber-600' },
        { id: 'evt-3', title: 'Team Meeting', start: formatDate(new Date(year, month, 11)), end: formatDate(new Date(year, month, 11)), allDay: true, color: 'bg-violet-600' },
        { id: 'evt-4', title: 'Call with Investor', start: formatDate(new Date(year, month, 11)), end: formatDate(new Date(year, month, 11)), allDay: true, color: 'bg-rose-600' },
        { id: 'evt-5', title: 'Funding Call: Bronx Auto', start: formatDate(new Date(year, month, 20)), end: formatDate(new Date(year, month, 20)), allDay: true, color: 'bg-emerald-600' },
        { id: 'evt-6', title: 'Doc Review: Stellar Logistics', start: formatDate(new Date(year, month, 27)), end: formatDate(new Date(year, month, 27)), allDay: true, color: 'bg-cyan-600' },
    ];
};


const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarEvent> | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(generateInitialEvents);
  const { tasks } = useData();

  const allEvents = useMemo(() => {
      const taskEvents: CalendarEvent[] = tasks
          .filter(task => !task.completed && task.dueDate)
          .map(task => ({
              id: `task-${task.id}`,
              title: task.title,
              start: task.dueDate.split('T')[0],
              end: task.dueDate.split('T')[0],
              allDay: true,
              color: 'bg-rose-600', // A distinct color for tasks
              description: `Task related to merchant: ${task.merchantId}`,
          }));
      return [...events, ...taskEvents];
  }, [events, tasks]);

  const today = new Date();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays: {date: Date, isCurrentMonth: boolean}[] = [];

  for (let i = 0; i < startingDayOfWeek; i++) {
    const day = new Date(firstDayOfMonth);
    day.setDate(day.getDate() - (startingDayOfWeek - i));
    calendarDays.push({ date: day, isCurrentMonth: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    calendarDays.push({ date: day, isCurrentMonth: true });
  }

  const totalCells = calendarDays.length > 35 ? 42 : 35; 
  const remainingCells = totalCells - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    const day = new Date(lastDayOfMonth);
    day.setDate(day.getDate() + i);
    calendarDays.push({ date: day, isCurrentMonth: false });
  }
  
  const numRows = totalCells / 7;

  const goToPreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  
  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedEvent({ start: dateStr, end: dateStr, allDay: true, color: 'bg-blue-600', title: '' });
    setIsModalOpen(true);
  };
  
  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    if (event.id.startsWith('task-')) {
        alert(`This is a task and cannot be edited from the calendar.\n\nTitle: ${event.title}`);
        return;
    }
    setSelectedEvent(event);
    setIsModalOpen(true);
  };
  
  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    if (eventData.id) {
        // Update existing event
        setEvents(events.map(e => e.id === eventData.id ? { ...e, ...eventData } as CalendarEvent : e));
    } else {
        // Create new event, ensuring required fields exist
        if (eventData.title && eventData.start && eventData.end && eventData.color) {
            const newEvent: CalendarEvent = {
                id: `evt-${Date.now()}`,
                title: eventData.title,
                start: eventData.start,
                end: eventData.end,
                allDay: eventData.allDay ?? true,
                color: eventData.color,
                description: eventData.description,
            };
            setEvents(prevEvents => [...prevEvents, newEvent]);
        } else {
            console.error("Attempted to create an event with missing required fields.");
        }
    }
    setIsModalOpen(false);
    setSelectedEvent(null);
    // TODO: Add API call to persist event
  };
  
  const handleCreateEventClick = () => {
      const todayStr = new Date().toISOString().split('T')[0];
      setSelectedEvent({ start: todayStr, end: todayStr, allDay: true, color: 'bg-blue-600', title: '' });
      setIsModalOpen(true);
  };

  return (
    <>
      {isModalOpen && selectedEvent && (
        <EventModal
            isOpen={isModalOpen}
            onClose={() => {
                setIsModalOpen(false);
                setSelectedEvent(null);
            }}
            onSave={handleSaveEvent}
            event={selectedEvent}
        />
      )}
      <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg p-4 sm:p-6 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center">
            <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Previous month">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="text-xl font-semibold text-white text-center w-48">
              {format(currentDate, 'MMMM YYYY')}
            </h2>
            <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Next month">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <Button onClick={handleCreateEventClick} size="sm">Create Event</Button>
        </div>
        <div 
            className="grid grid-cols-7 gap-px text-center text-sm font-medium text-slate-300 bg-slate-700 border border-slate-700 rounded-md overflow-hidden flex-grow"
            style={{ gridTemplateRows: `auto repeat(${numRows}, minmax(0, 1fr))` }}
        >
          {daysOfWeek.map(day => (
            <div key={day} className="py-2 bg-slate-800/70">{day}</div>
          ))}
          
          {calendarDays.map(({ date, isCurrentMonth }, index) => {
            const isToday = isSameDay(date, today);
            const dateStr = date.toISOString().split('T')[0];
            const dayEvents = allEvents.filter(e => e.start === dateStr);
            
            return (
              <div
                key={index}
                className={`relative p-1.5 bg-slate-900 transition-colors duration-200 overflow-y-auto ${isCurrentMonth ? 'bg-opacity-70 hover:bg-slate-800/50' : 'bg-slate-950/50'} cursor-pointer`}
                onClick={() => handleDayClick(date)}
              >
                <time
                  dateTime={dateStr}
                  className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold
                    ${isToday ? 'bg-accent text-slate-900' : ''}
                    ${!isCurrentMonth ? 'text-slate-500' : 'text-white'}
                  `}
                >
                  {date.getDate()}
                </time>
                <div className="mt-1.5 space-y-1">
                  {dayEvents.map((event) => (
                      <div 
                        key={event.id}
                        onClick={(e) => handleEventClick(e, event)}
                        className={`p-1 rounded text-white ${event.color} text-xs truncate hover:opacity-80`}
                        title={event.title}
                      >
                          {event.title}
                      </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CalendarView;