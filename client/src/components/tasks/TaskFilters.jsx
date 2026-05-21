import { Search, X } from 'lucide-react';
import useTaskStore from '../../context/TaskContext';
import { debounce } from '../../utils/helpers';
import { useMemo } from 'react';
import Select from '../ui/Select';

const TaskFilters = () => {
  const { filters, setFilters, clearFilters, users } = useTaskStore();

  const debouncedSearch = useMemo(
    () => debounce((val) => setFilters({ search: val }), 300),
    []
  );

  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-void-cyan/40" />
        <input
          type="text"
          placeholder="Search missions..."
          defaultValue={filters.search}
          onChange={(e) => debouncedSearch(e.target.value)}
          className="input-void rounded-lg pl-9 pr-3 py-1.5 text-sm w-full"
        />
      </div>

      {/* Priority filter */}
      <Select
        value={filters.priority}
        onChange={(e) => setFilters({ priority: e.target.value })}
        className="w-auto min-w-[140px]"
      >
        <option value="">All Priority</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </Select>

      {/* Assignee filter */}
      {users.length > 0 && (
        <Select
          value={filters.assignedTo}
          onChange={(e) => setFilters({ assignedTo: e.target.value })}
          className="w-auto min-w-[160px]"
        >
          <option value="">All Operatives</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>{u.username}</option>
          ))}
        </Select>
      )}

      {/* Clear */}
      {(filters.search || filters.priority || filters.assignedTo) && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-xs text-void-crimson/70 hover:text-void-crimson font-orbitron tracking-wide transition-colors"
        >
          <X size={12} /> CLEAR
        </button>
      )}
    </div>
  );
};

export default TaskFilters;
