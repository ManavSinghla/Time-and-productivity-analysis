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
    const [priority, setPriority] = useState('Medium');
    const [recurrence, setRecurrence] = useState('none');
    const [subTasks, setSubTasks] = useState([]);
    const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

    useEffect(() => {
        const loadTasks = async () => {
            try {
                const data = await fetchTasks();
                const calendarEvents = [];
                
                data.forEach(task => {
                    const taskDateObj = new Date(task.date || task.createdAt);
                    const baseEvent = {
                        id: task._id,
                        title: task.title,
                        start: taskDateObj,
                        end: new Date(taskDateObj.getTime() + task.timeSpent * 60000),
                        category: task.category || 'Other',
                        timeSpent: task.timeSpent,
                        description: task.description || '',
                        priority: task.priority || 'Medium',
                        recurrence: task.recurrence || { type: 'none' },
                        subTasks: task.subTasks || [],
                        allDay: false
                    };
                    
                    // Add the base event
                    calendarEvents.push(baseEvent);
                    
                    // Generate virtual events if task is recurring
                    if (task.recurrence && task.recurrence.type !== 'none') {
                        const recurrenceType = task.recurrence.type;
                        const startRange = new Date(date.getFullYear(), date.getMonth() - 1, 1);
                        const endRange = new Date(date.getFullYear(), date.getMonth() + 3, 1);
                        
                        let currentOccur = new Date(taskDateObj);
                        
                        // We loop forward up to 3 months from current calendar view date
                        while (true) {
                            if (recurrenceType === 'daily') {
                                currentOccur.setDate(currentOccur.getDate() + 1);
                            } else if (recurrenceType === 'weekly') {
                                currentOccur.setDate(currentOccur.getDate() + 7);
                            } else {
                                break;
                            }
                            
                            if (currentOccur > endRange) break;
                            
                            // Only add if it's within startRange to endRange
                            if (currentOccur >= startRange) {
                                calendarEvents.push({
                                    ...baseEvent,
                                    id: `${task._id}-virtual-${currentOccur.getTime()}`,
                                    baseTaskId: task._id,
                                    title: `${task.title} 🔁`,
                                    start: new Date(currentOccur),
                                    end: new Date(currentOccur.getTime() + task.timeSpent * 60000),
                                    isVirtual: true
                                });
                            }
                        }
                    }
                });
                setEvents(calendarEvents);
            } catch (error) {
                console.error("Error loading tasks for calendar:", error);
            }
        };
        loadTasks();
    }, [refreshTrigger, localTrigger, date]);

    const eventStyleGetter = (event) => {
        let backgroundColor = 'var(--accent-blue)';
        if (event.category === 'Study') backgroundColor = 'var(--accent-indigo)';
        if (event.category === 'Work') backgroundColor = '#e74c3c';
        if (event.category === 'Personal') backgroundColor = '#2ecc71';
        if (event.category === 'Other') backgroundColor = 'var(--text-secondary)';
        
        let borderLeft = '4px solid #f59e0b'; // Default Medium
        if (event.priority === 'Low') borderLeft = '4px solid #60a5fa';
        if (event.priority === 'High') borderLeft = '4px solid #ef4444';

        return {
            style: {
                backgroundColor,
                borderRadius: '8px',
                opacity: 0.9,
                color: 'white',
                border: 'none',
                borderLeft,
                display: 'block'
            }
        };
    };

    const handleSelectSlot = ({ start, end }) => {
        setSelectedSlot({ start, end });
        setTitle('');
        setCategory('Study');
        setDescription('');
        setPriority('Medium');
        setRecurrence('none');
        setSubTasks([]);
        setNewSubTaskTitle('');
        
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
        setTitle(event.title.replace(' 🔁', ''));
        setCategory(event.category);
        setTimeSpent(event.timeSpent);
        setDescription(event.description || '');
        setPriority(event.priority || 'Medium');
        setRecurrence(event.recurrence?.type || 'none');
        setSubTasks(event.subTasks || []);
        setNewSubTaskTitle('');
        
        const dateObj = new Date(event.start);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        setTaskDate(`${year}-${month}-${day}`);

        setIsEditMode(false);
        setIsDetailModalOpen(true);
    };

    const handleAddSubTask = () => {
        if (!newSubTaskTitle.trim()) return;
        setSubTasks([...subTasks, { title: newSubTaskTitle.trim(), completed: false }]);
        setNewSubTaskTitle('');
    };

    const handleRemoveSubTask = (index) => {
        setSubTasks(subTasks.filter((_, i) => i !== index));
    };

    const handleToggleSubtask = async (subtaskIndex) => {
        if (!selectedEvent) return;
        const taskId = selectedEvent.isVirtual ? selectedEvent.baseTaskId : selectedEvent.id;
        const updatedSubTasks = subTasks.map((st, idx) => 
            idx === subtaskIndex ? { ...st, completed: !st.completed } : st
        );
        setSubTasks(updatedSubTasks);
        try {
            await updateTask(taskId, { subTasks: updatedSubTasks });
            setLocalTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error toggling subtask:", error);
        }
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
                priority,
                recurrence: { type: recurrence },
                subTasks,
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

        const taskId = selectedEvent.isVirtual ? selectedEvent.baseTaskId : selectedEvent.id;
        try {
            const baseDate = new Date(selectedEvent.start);
            const [y, m, d] = taskDate.split('-').map(Number);
            if (y && m && d) {
                baseDate.setFullYear(y);
                baseDate.setMonth(m - 1);
                baseDate.setDate(d);
            }

            await updateTask(taskId, {
                title,
                timeSpent: Number(timeSpent),
                category,
                description,
                priority,
                recurrence: { type: recurrence },
                subTasks,
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
        const taskId = selectedEvent.isVirtual ? selectedEvent.baseTaskId : selectedEvent.id;
        const displayTitle = selectedEvent.title.replace(' 🔁', '');
        if (window.confirm(`Are you sure you want to delete "${displayTitle}"?`)) {
            try {
                await deleteTask(taskId);
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

                            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="form-label" htmlFor="calendar-task-priority">Priority</label>
                                    <select 
                                        id="calendar-task-priority"
                                        className="form-select" 
                                        value={priority} 
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label" htmlFor="calendar-task-recurrence">Recurrence</label>
                                    <select 
                                        id="calendar-task-recurrence"
                                        className="form-select" 
                                        value={recurrence} 
                                        onChange={(e) => setRecurrence(e.target.value)}
                                    >
                                        <option value="none">None</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                    </select>
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

                            <div className="subtasks-container" style={{ gridColumn: 'auto' }}>
                                <label className="form-label">Checklist / Sub-tasks</label>
                                <div className="subtask-builder">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Add a checklist step..."
                                        value={newSubTaskTitle}
                                        onChange={(e) => setNewSubTaskTitle(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleAddSubTask}
                                        style={{ padding: "0.5rem 1rem", minWidth: "80px" }}
                                    >
                                        Add
                                    </button>
                                </div>
                                {subTasks.length > 0 && (
                                    <ul className="subtask-list">
                                        {subTasks.map((st, idx) => (
                                            <li key={idx} className="subtask-item" style={{ justifyContent: "space-between" }}>
                                                <span>• {st.title}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSubTask(idx)}
                                                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1.1rem", padding: 0 }}
                                                >
                                                    ×
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
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

                                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="form-label" htmlFor="edit-task-priority">Priority</label>
                                        <select 
                                            id="edit-task-priority"
                                            className="form-select" 
                                            value={priority} 
                                            onChange={(e) => setPriority(e.target.value)}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label" htmlFor="edit-task-recurrence">Recurrence</label>
                                        <select 
                                            id="edit-task-recurrence"
                                            className="form-select" 
                                            value={recurrence} 
                                            onChange={(e) => setRecurrence(e.target.value)}
                                        >
                                            <option value="none">None</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                        </select>
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

                                <div className="subtasks-container" style={{ gridColumn: 'auto' }}>
                                    <label className="form-label">Checklist / Sub-tasks</label>
                                    <div className="subtask-builder">
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Add a checklist step..."
                                            value={newSubTaskTitle}
                                            onChange={(e) => setNewSubTaskTitle(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={handleAddSubTask}
                                            style={{ padding: "0.5rem 1rem", minWidth: "80px" }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {subTasks.length > 0 && (
                                        <ul className="subtask-list">
                                            {subTasks.map((st, idx) => (
                                                <li key={idx} className="subtask-item" style={{ justifyContent: "space-between" }}>
                                                    <span>• {st.title}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSubTask(idx)}
                                                        style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1.1rem", padding: 0 }}
                                                    >
                                                        ×
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
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
                                    <span className="detail-value">
                                        {selectedEvent.title.replace(' 🔁', '')}
                                        {selectedEvent.recurrence?.type && selectedEvent.recurrence.type !== 'none' && (
                                            <span className="recurrence-badge" style={{ marginLeft: "0.5rem", verticalAlign: "middle" }}>
                                                🔁 {selectedEvent.recurrence.type}
                                            </span>
                                        )}
                                    </span>
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
                                        <span className="detail-label">Priority</span>
                                        <span className="detail-value">
                                            <span className={`task-pill pill-priority-${(selectedEvent.priority || 'medium').toLowerCase()}`}>
                                                {selectedEvent.priority || 'Medium'}
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                                    <div className="detail-row" style={{ marginBottom: 0 }}>
                                        <span className="detail-label">Duration</span>
                                        <span className="detail-value">{selectedEvent.timeSpent} mins</span>
                                    </div>
                                    <div className="detail-row" style={{ marginBottom: 0 }}>
                                        <span className="detail-label">Date & Time</span>
                                        <span className="detail-value" style={{ fontSize: '0.95rem' }}>
                                            {format(selectedEvent.start, 'PPP p')}
                                        </span>
                                    </div>
                                </div>

                                {selectedEvent.description && (
                                    <div className="detail-row">
                                        <span className="detail-label">Description</span>
                                        <span className="detail-value" style={{ fontWeight: 'normal', fontSize: '0.95rem', background: 'var(--hover-bg)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                            {selectedEvent.description}
                                        </span>
                                    </div>
                                )}

                                {/* Subtasks Checklist */}
                                {subTasks.length > 0 && (
                                    <div className="subtasks-container" style={{ gridColumn: 'auto', marginBottom: '1.5rem' }}>
                                        <div className="subtask-header">
                                            <span>Checklist ({subTasks.filter(st => st.completed).length} / {subTasks.length})</span>
                                            <span style={{ fontSize: "0.8rem", color: "var(--accent-indigo)" }}>
                                                {Math.round((subTasks.filter(st => st.completed).length / subTasks.length) * 100)}% Complete
                                            </span>
                                        </div>
                                        <ul className="subtask-list">
                                            {subTasks.map((st, idx) => (
                                                <li 
                                                    key={idx} 
                                                    className={`subtask-item ${st.completed ? 'completed' : ''}`}
                                                    onClick={() => handleToggleSubtask(idx)}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={st.completed} 
                                                        onChange={() => {}} 
                                                    />
                                                    <span>{st.title}</span>
                                                </li>
                                            ))}
                                        </ul>
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
