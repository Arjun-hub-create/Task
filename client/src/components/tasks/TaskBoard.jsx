import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import Modal from '../ui/Modal';
import TaskForm from './TaskForm';
import { statusColumns } from '../../utils/helpers';
import useTaskStore from '../../context/TaskContext';
import useAuthStore from '../../context/AuthContext';
import useToast from '../../hooks/useToast';
import { taskService } from '../../services/taskService';
import { containerVariants, cardVariants } from '../../utils/animations';

const columnColors = {
  todo: '#ffffff40',
  'in-progress': '#7B2FFF',
  review: '#FF9500',
  completed: '#00FF88',
};

const TaskBoard = ({ tasks, onRefresh }) => {
  const { user } = useAuthStore();
  const { deleteTask, updateStatus, socketUpdateTask } = useTaskStore();
  const toast = useToast();
  const [createModal, setCreateModal] = useState(false);
  const [viewTask, setViewTask] = useState(null);
  const [viewModal, setViewModal] = useState(false);

  const getColumnTasks = (status) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const task = tasks.find((t) => t._id === draggableId);
    if (!task) return;

    // Optimistic update
    socketUpdateTask({ ...task, status: newStatus, order: destination.index });

    try {
      await taskService.updateOrder(draggableId, destination.index, newStatus);
    } catch {
      toast.error('Failed to move task.', 'ERROR');
      onRefresh?.();
    }
  };

  const handleDelete = async (id) => {
    const result = await deleteTask(id);
    if (result.success) {
      toast.success('Mission eliminated.', 'DELETED');
    } else {
      toast.error(result.message, 'ERROR');
    }
  };

  const handleComplete = async (id) => {
    const result = await updateStatus(id, 'completed');
    if (result.success) {
      toast.success('Mission accomplished! 🚀', 'COMPLETED');
    }
  };

  const handleView = (id) => {
    const task = tasks.find((t) => t._id === id);
    setViewTask(task);
    setViewModal(true);
  };

  return (
    <>
      {user?.role === 'manager' && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-orbitron text-sm tracking-wider text-void-black font-bold transition-all btn-glow"
            style={{
              background: 'linear-gradient(135deg, #00F5FF, #7B2FFF)',
            }}
          >
            <Plus size={16} />
            NEW MISSION
          </button>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {statusColumns.map(({ id, label, color }) => {
            const colTasks = getColumnTasks(id);
            return (
              <div key={id} className="flex flex-col gap-3">
                {/* Column header */}
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-lg border"
                  style={{
                    background: `${color}08`,
                    borderColor: `${color}25`,
                  }}
                >
                  <span
                    className="text-xs font-orbitron tracking-widest font-bold"
                    style={{ color, textShadow: `0 0 8px ${color}80` }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-xs font-orbitron px-2 py-0.5 rounded-full border"
                    style={{ color, borderColor: `${color}40`, background: `${color}15` }}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Droppable column */}
                <Droppable droppableId={id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-col gap-2.5 min-h-[200px] p-2 rounded-xl transition-all duration-200 ${snapshot.isDraggingOver ? 'drag-over' : 'border border-transparent'}`}
                      style={{
                        background: snapshot.isDraggingOver ? `${color}05` : 'transparent',
                      }}
                    >
                      <AnimatePresence>
                        {colTasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                style={{ ...prov.draggableProps.style }}
                              >
                                <TaskCard
                                  task={task}
                                  onDelete={handleDelete}
                                  onComplete={handleComplete}
                                  onView={handleView}
                                  isDragging={snap.isDragging}
                                  dragHandleProps={prov.dragHandleProps}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}

                      {colTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex items-center justify-center py-8 text-white/20 text-xs font-orbitron tracking-widest">
                          EMPTY
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Create Task Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="◈ LAUNCH NEW MISSION" size="md">
        <TaskForm onSuccess={() => setCreateModal(false)} onCancel={() => setCreateModal(false)} />
      </Modal>

      {/* View/Edit Task Modal */}
      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="◈ MISSION DETAILS" size="md">
        {viewTask && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-orbitron text-white mb-1">{viewTask.title}</h3>
              {viewTask.description && (
                <p className="text-sm text-white/60 font-inter">{viewTask.description}</p>
              )}
            </div>
            {user?.role === 'manager' && (
              <TaskForm
                task={viewTask}
                onSuccess={() => {
                  setViewModal(false);
                  toast.success('Mission updated.', 'UPDATED');
                }}
                onCancel={() => setViewModal(false)}
              />
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default TaskBoard;
