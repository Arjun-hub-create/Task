import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import useTaskStore from '../../context/TaskContext';
import useToast from '../../hooks/useToast';
import { format } from 'date-fns';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['todo', 'in-progress', 'review', 'completed']),
  assignedTo: z.string().min(1, 'Please assign this task'),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
});

const TaskForm = ({ task, onSuccess, onCancel }) => {
  const { createTask, updateTask, users, fetchUsers } = useTaskStore();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description || '',
          priority: task.priority,
          status: task.status,
          assignedTo: task.assignedTo?._id || task.assignedTo,
          dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
          tags: task.tags?.join(', ') || '',
        }
      : { priority: 'medium', status: 'todo', title: '', description: '', assignedTo: '', dueDate: '', tags: '' },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      dueDate: data.dueDate || undefined,
    };

    const result = task
      ? await updateTask(task._id, payload)
      : await createTask(payload);

    if (result.success) {
      toast.success(task ? 'Mission updated.' : 'Mission created. Transmission sent.', 'SUCCESS');
      onSuccess?.();
    } else {
      toast.error(result.message, 'ERROR');
    }
  };

  const inputClass = 'input-void rounded-lg px-3 py-2.5 text-sm w-full';
  const labelClass = 'text-xs font-orbitron tracking-wider text-void-cyan/70 uppercase block mb-1';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Mission Title"
        {...register('title')}
        error={errors.title?.message}
        placeholder="Enter mission title..."
      />

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          {...register('description')}
          rows={3}
          className={`${inputClass} resize-none`}
          placeholder="Mission briefing (optional)..."
        />
        {errors.description && <p className="text-xs text-void-crimson mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="Priority" {...register('priority')}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </Select>
        <Select label="Status" {...register('status')}>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
        </Select>
      </div>

      <Select
        label="Assign To"
        {...register('assignedTo')}
        error={errors.assignedTo?.message}
      >
        <option value="">Select operative...</option>
        {users.map((u) => (
          <option key={u._id} value={u._id}>{u.username} ({u.role})</option>
        ))}
      </Select>

      <Input
        label="Due Date"
        type="date"
        {...register('dueDate')}
        error={errors.dueDate?.message}
      />

      <Input
        label="Tags (comma separated)"
        {...register('tags')}
        placeholder="e.g. frontend, urgent, api"
        error={errors.tags?.message}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isSubmitting} glow className="flex-1">
          {task ? 'UPDATE MISSION' : 'LAUNCH MISSION'}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} className="flex-1">
            ABORT
          </Button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
