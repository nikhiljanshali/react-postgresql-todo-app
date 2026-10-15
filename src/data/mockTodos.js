// Helper to format ISO date relative to current date
const getRelativeDate = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

export const CATEGORIES = [
  { id: 'work', label: 'Work', color: '#6366f1', icon: 'Briefcase' },
  { id: 'personal', label: 'Personal', color: '#ec4899', icon: 'User' },
  { id: 'learning', label: 'Learning', color: '#8b5cf6', icon: 'BookOpen' },
  { id: 'health', label: 'Health & Fitness', color: '#10b981', icon: 'Heart' },
  { id: 'finance', label: 'Finance', color: '#f59e0b', icon: 'DollarSign' }
];

export const PRIORITIES = {
  high: { label: 'High', color: '#ef4444', bg: '#fee2e2', darkBg: 'rgba(239, 68, 68, 0.2)' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fef3c7', darkBg: 'rgba(245, 158, 11, 0.2)' },
  low: { label: 'Low', color: '#10b981', bg: '#d1fae5', darkBg: 'rgba(16, 185, 129, 0.2)' }
};

export const INITIAL_MOCK_TODOS = [
  {
    id: 'todo-1',
    title: 'Finalize Q4 Product Roadmap & Milestones',
    description: 'Align with engineering and product leads on key Q4 deliverable targets and sprint allocations.',
    category: 'work',
    priority: 'high',
    dueDate: getRelativeDate(0), // Today
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    subtasks: [
      { id: 'sub-1-1', title: 'Gather feedback from marketing & sales', completed: true },
      { id: 'sub-1-2', title: 'Estimate story points with tech leads', completed: false },
      { id: 'sub-1-3', title: 'Prepare keynote slides for exec review', completed: false }
    ]
  },
  {
    id: 'todo-2',
    title: 'Review PR #248: Auth & Session Management',
    description: 'Check security implications, token refresh cycle, and unit test coverage across OAuth providers.',
    category: 'work',
    priority: 'medium',
    dueDate: getRelativeDate(1), // Tomorrow
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    subtasks: [
      { id: 'sub-2-1', title: 'Review JWT rotation test cases', completed: true },
      { id: 'sub-2-2', title: 'Verify rate limiter headers', completed: false }
    ]
  },
  {
    id: 'todo-3',
    title: 'Renew International Passport & Visa Documents',
    description: 'Submit notarized copies and schedule appointment at the regional consular office.',
    category: 'personal',
    priority: 'high',
    dueDate: getRelativeDate(-2), // Overdue
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    subtasks: [
      { id: 'sub-3-1', title: 'Download and fill DS-82 renewal form', completed: true },
      { id: 'sub-3-2', title: 'Get official passport photos printed', completed: false }
    ]
  },
  {
    id: 'todo-4',
    title: 'Deep Dive: React 19 Server Actions & Transitions',
    description: 'Study the new useActionState, useOptimistic hooks and build a mini showcase.',
    category: 'learning',
    priority: 'medium',
    dueDate: getRelativeDate(3),
    completed: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    subtasks: [
      { id: 'sub-4-1', title: 'Read official React 19 documentation', completed: true },
      { id: 'sub-4-2', title: 'Build demo prototype with optimistic UI', completed: true }
    ]
  },
  {
    id: 'todo-5',
    title: 'Weekly Meal Prep & Grocery Stockup',
    description: 'Buy organic greens, protein sources, oat milk, and prep lunch containers for Mon-Thu.',
    category: 'health',
    priority: 'medium',
    dueDate: getRelativeDate(0), // Today
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    subtasks: [
      { id: 'sub-5-1', title: 'Check pantry staples inventory', completed: true },
      { id: 'sub-5-2', title: 'Visit farmers market for fresh produce', completed: false },
      { id: 'sub-5-3', title: 'Cook and portion quinoa & grilled vegetables', completed: false }
    ]
  },
  {
    id: 'todo-6',
    title: 'Tax Season Preparation & Expense Audit',
    description: 'Download bank statements, categorize business deductions, and send receipts to CPA.',
    category: 'finance',
    priority: 'high',
    dueDate: getRelativeDate(5),
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    subtasks: [
      { id: 'sub-6-1', title: 'Export Stripe and PayPal transaction CSVs', completed: true },
      { id: 'sub-6-2', title: 'Compile software subscriptions receipts', completed: false }
    ]
  },
  {
    id: 'todo-7',
    title: 'Complete 5km Morning Run & Core Workout',
    description: 'Maintain pace below 5:30/km and complete 15-minute cool-down stretch session.',
    category: 'health',
    priority: 'low',
    dueDate: getRelativeDate(0),
    completed: true,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: 'sub-7-1', title: '5km outdoor run on park trail', completed: true },
      { id: 'sub-7-2', title: '15 min core & mobility circuit', completed: true }
    ]
  },
  {
    id: 'todo-8',
    title: 'Read 2 Chapters of "Designing Data-Intensive Applications"',
    description: 'Focus on distributed consensus protocols and partition tolerance strategies.',
    category: 'learning',
    priority: 'low',
    dueDate: getRelativeDate(4),
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    subtasks: [
      { id: 'sub-8-1', title: 'Chapter 8: The Trouble with Distributed Systems', completed: false },
      { id: 'sub-8-2', title: 'Write down key takeaways in Obsidian', completed: false }
    ]
  }
];
