import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { fetchTasks, addTask, updateTask, deleteTask } from '../services/taskService';
import '../App.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function CalendarView({ refreshTrigger }) {
    const [events, setEvents] = useState([]);
    const [localTrigger, setLocalTrigger] = useState(0);

    // Controlled Calendar State
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState('week');

    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Form fields
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Study');
    const [timeSpent, setTimeSpent] = useState(30);
    const [description, setDescription] = useState('');
    const [taskDate, setTaskDate] = useState('');

    useEffect(() => {
        const loadTasks = async () => {
            try {
                const data = await fetchTasks();
                const calendarEvents = data.map(task => {
                    const taskDateObj = new Date(task.date || task.createdAt);
                    return {
                        id: task._id,
                        title: task.title,
                        start: taskDateObj,
                        end: new Date(taskDateObj.getTime() + task.timeSpent * 60000), // add timeSpent minutes
                        category: task.category || 'Other',
                        timeSpent: task.timeSpent,
                        description: task.description || '',
                        allDay: false
                    };
                });
                setEvents(calendarEvents);
            } catch (error) {
                console.error("Error loading tasks for calendar:", error);
            }
        };
        loadTasks();
    }, [refreshTrigger, localTrigger]);

    const eventStyleGetter = (event) => {
        let backgroundColor = 'var(--accent-blue)';
        if (event.category === 'Study') backgroundColor = 'var(--accent-indigo)';
        if (event.category === 'Work') backgroundColor = '#e74c3c';
        if (event.category === 'Personal') backgroundColor = '#2ecc71';
        if (event.category === 'Other') backgroundColor = 'var(--text-secondary)';
        
        return {
            style: {
                backgroundColor,
                borderRadius: '8px',
                opacity: 0.9,
                color: 'white',
                border: 'none',
                display: 'block'
            }
        };
    };

    const handleSelectSlot = ({ start, end }) => {
        setSelectedSlot({ start, end });
        setTitle('');
        setCategory('Study');
        setDescription('');
        // Calculate difference in minutes for default time spent
        const diffMs = end - start;
        const diffMins = Math.max(15, Math.round(diffMs / 60000));
        setTimeSpent(diffMins);
        
        // Prefill date input (YYYY-MM-DD)
        const year = start.getFullYear();
        const month = String(start.getMonth() + 1).padStart(2, '0');
        const day = String(start.getDate()).padStart(2, '0');
        setTaskDate(`${year}-${month}-${day}`);
        
        setIsCreateModalOpen(true);
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setTitle(event.title);
        setCategory(event.category);
        setTimeSpent(event.timeSpent);
        setDescription(event.description || '');
        
        const dateObj = new Date(event.start);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        setTaskDate(`${year}-${month}-${day}`);

        setIsEditMode(false);
        setIsDetailModalOpen(true);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            // Combine selected taskDate with original slot time
            const baseDate = selectedSlot ? selectedSlot.start : new Date();
            const [y, m, d] = taskDate.split('-').map(Number);
            const finalDate = new Date(baseDate);
            if (y && m && d) {
                finalDate.setFullYear(y);
                finalDate.setMonth(m - 1);
                finalDate.setDate(d);
            }

            await addTask({
                title,
                timeSpent: Number(timeSpent),
                category,
                description,
                date: finalDate
            });

            setIsCreateModalOpen(false);
            setLocalTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error creating task from calendar:", error);
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !selectedEvent) return;

        try {
            const baseDate = new Date(selectedEvent.start);
            const [y, m, d] = taskDate.split('-').map(Number);
            if (y && m && d) {
                baseDate.setFullYear(y);
                baseDate.setMonth(m - 1);
                baseDate.setDate(d);
            }

            await updateTask(selectedEvent.id, {
                title,
                timeSpent: Number(timeSpent),
                category,
                description,
                date: baseDate
            });

            setIsDetailModalOpen(false);
            setIsEditMode(false);
            setLocalTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error updating task from calendar:", error);
        }
    };

    const handleDelete = async () => {
        if (!selectedEvent) return;
        if (window.confirm(`Are you sure you want to delete "${selectedEvent.title}"?`)) {
            try {
                await deleteTask(selectedEvent.id);
                setIsDetailModalOpen(false);
                setLocalTrigger(prev => prev + 1);
            } catch (error) {
                console.error("Error deleting task:", error);
            }
        }
    };

    return (
        <div className="container" style={{ padding: 0, marginTop: "2rem" }}>
            <div className="analytics-container" style={{ minHeight: '750px' }}>
                <h2 className="chart-title">📅 Calendar Timeline</h2>
                <Calendar
                    selectable
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 620, color: "var(--text-primary)" }}
                    eventPropGetter={eventStyleGetter}
                    views={['month', 'week', 'day', 'agenda']}
                    date={date}
                    onNavigate={(newDate) => setDate(newDate)}
                    view={view}
                    onView={(newView) => setView(newView)}
                />
            </div>

            {/* Custom Modal for Task Creation */}
            {isCreateModalOpen && (
                <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setIsCreateModalOpen(false)}>×</button>
                        <h3 className="modal-title">➕ Create New Task</h3>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="calendar-task-title">Task Title</label>
                                <input 
                                    id="calendar-task-title"
                                    type="text" 
                                    className="form-input" 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    required 
                                    placeholder="What are you working on?"
                                />
                            </div>

                            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="form-label" htmlFor="calendar-task-category">Category</label>
                                    <select 
                                        id="calendar-task-category"
                                        className="form-select" 
                                        value={category} 
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option>Study</option>
                                        <option>Work</option>
                                        <option>Personal</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label" htmlFor="calendar-task-duration">Duration (mins)</label>
                                    <input 
                                        id="calendar-task-duration"
                                        type="number" 
                                        className="form-input" 
                                        value={timeSpent} 
                                        onChange={(e) => setTimeSpent(e.target.value)} 
                                        min="1" 
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="calendar-task-date">Date</label>
                                <input 
                                    id="calendar-task-date"
                                    type="date" 
                                    className="form-input" 
                                    value={taskDate} 
                                    onChange={(e) => setTaskDate(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="calendar-task-desc">Description</label>
                                <textarea 
                                    id="calendar-task-desc"
                                    className="form-input" 
                                    rows="3" 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add descriptions or notes..."
                                    style={{ fontFamily: 'inherit', resize: 'vertical' }}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Modal for Task Details & Edit/Delete */}
            {isDetailModalOpen && selectedEvent && (
                <div className="modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setIsDetailModalOpen(false)}>×</button>
                        <h3 className="modal-title">
                            {isEditMode ? '✏️ Edit Task' : '📋 Task Details'}
                        </h3>

                        {isEditMode ? (
                            <form onSubmit={handleUpdateSubmit}>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="edit-task-title">Task Title</label>
                                    <input 
                                        id="edit-task-title"
                                        type="text" 
                                        className="form-input" 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        required 
                                    />
                                </div>

                                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="form-label" htmlFor="edit-task-category">Category</label>
                                        <select 
                                            id="edit-task-category"
                                            className="form-select" 
                                            value={category} 
                                            onChange={(e) => setCategory(e.target.value)}
                                        >
                                            <option>Study</option>
                                            <option>Work</option>
                                            <option>Personal</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label" htmlFor="edit-task-duration">Duration (mins)</label>
                                        <input 
                                            id="edit-task-duration"
                                            type="number" 
                                            className="form-input" 
                                            value={timeSpent} 
                                            onChange={(e) => setTimeSpent(e.target.value)} 
                                            min="1" 
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="edit-task-date">Date</label>
                                    <input 
                                        id="edit-task-date"
                                        type="date" 
                                        className="form-input" 
                                        value={taskDate} 
                                        onChange={(e) => setTaskDate(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="edit-task-desc">Description</label>
                                    <textarea 
                                        id="edit-task-desc"
                                        className="form-input" 
                                        rows="3" 
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)}
                                        style={{ fontFamily: 'inherit', resize: 'vertical' }}
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditMode(false)}>Back</button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <div className="detail-row">
                                    <span className="detail-label">Title</span>
                                    <span className="detail-value">{selectedEvent.title}</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                                    <div className="detail-row" style={{ marginBottom: 0 }}>
                                        <span className="detail-label">Category</span>
                                        <span className="detail-value">
                                            <span className={`task-pill pill-${selectedEvent.category.toLowerCase()}`}>
                                                {selectedEvent.category}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="detail-row" style={{ marginBottom: 0 }}>
                                        <span className="detail-label">Duration</span>
                                        <span className="detail-value">{selectedEvent.timeSpent} mins</span>
                                    </div>
                                </div>

                                <div className="detail-row">
                                    <span className="detail-label">Date & Time</span>
                                    <span className="detail-value" style={{ fontSize: '0.95rem' }}>
                                        {format(selectedEvent.start, 'PPP p')}
                                    </span>
                                </div>

                                {selectedEvent.description && (
                                    <div className="detail-row">
                                        <span className="detail-label">Description</span>
                                        <span className="detail-value" style={{ fontWeight: 'normal', fontSize: '0.95rem', background: 'var(--hover-bg)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                            {selectedEvent.description}
                                        </span>
                                    </div>
                                )}

                                <div className="modal-actions" style={{ justifyContent: 'space-between', width: '100%' }}>
                                    <button type="button" className="btn btn-danger" onClick={handleDelete}>🗑️ Delete</button>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button type="button" className="btn btn-secondary" onClick={() => setIsDetailModalOpen(false)}>Close</button>
                                        <button type="button" className="btn btn-primary" onClick={() => setIsEditMode(true)}>✏️ Edit</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CalendarView;
