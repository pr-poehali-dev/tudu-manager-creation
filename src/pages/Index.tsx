import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  projectId: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
}

const Index = () => {
  const [view, setView] = useState<'projects' | 'calendar'>('projects');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();

  const [projects] = useState<Project[]>([
    { id: 'work', name: 'Работа', color: 'bg-primary' },
    { id: 'personal', name: 'Личное', color: 'bg-purple-400' },
    { id: 'health', name: 'Здоровье', color: 'bg-green-400' },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Завершить презентацию', completed: false, dueDate: new Date(2025, 10, 15), projectId: 'work' },
    { id: '2', title: 'Купить продукты', completed: false, dueDate: new Date(2025, 10, 14), projectId: 'personal' },
    { id: '3', title: 'Утренняя пробежка', completed: true, dueDate: new Date(2025, 10, 14), projectId: 'health' },
  ]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      dueDate: selectedDate,
      projectId: selectedProject === 'all' ? 'personal' : selectedProject,
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setSelectedDate(undefined);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const getTasksForProject = (projectId: string) => {
    if (projectId === 'all') return tasks;
    return tasks.filter(task => task.projectId === projectId);
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      task.dueDate && 
      task.dueDate.toDateString() === date.toDateString()
    );
  };

  const getUpcomingTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks
      .filter(task => task.dueDate && task.dueDate >= today && !task.completed)
      .sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0));
  };

  const isDateHasTasks = (date: Date) => {
    return tasks.some(task => 
      task.dueDate && 
      task.dueDate.toDateString() === date.toDateString()
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-2">Задачи</h1>
          <p className="text-muted-foreground">Планируй. Выполняй. Достигай.</p>
        </header>

        <div className="flex gap-3 mb-8">
          <Button
            variant={view === 'projects' ? 'default' : 'ghost'}
            onClick={() => setView('projects')}
            className="rounded-full"
          >
            <Icon name="FolderKanban" className="mr-2" size={18} />
            Проекты
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'ghost'}
            onClick={() => setView('calendar')}
            className="rounded-full"
          >
            <Icon name="Calendar" className="mr-2" size={18} />
            Календарь
          </Button>
        </div>

        {view === 'projects' && (
          <div className="space-y-8 animate-fade-in">
            <Card className="p-6 border-0 shadow-sm">
              <div className="flex gap-3">
                <Input
                  placeholder="Новая задача..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  className="flex-1 border-0 bg-muted/50 focus-visible:ring-1"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="rounded-full">
                      <Icon name="CalendarDays" size={18} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={ru}
                    />
                  </PopoverContent>
                </Popover>
                <Button onClick={addTask} className="rounded-full">
                  <Icon name="Plus" size={18} />
                </Button>
              </div>
              {selectedDate && (
                <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
                  <Icon name="Bell" size={14} />
                  Срок: {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                </p>
              )}
            </Card>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedProject === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedProject('all')}
                size="sm"
                className="rounded-full"
              >
                Все задачи
              </Button>
              {projects.map(project => (
                <Button
                  key={project.id}
                  variant={selectedProject === project.id ? 'default' : 'outline'}
                  onClick={() => setSelectedProject(project.id)}
                  size="sm"
                  className="rounded-full"
                >
                  <div className={`w-2 h-2 rounded-full ${project.color} mr-2`} />
                  {project.name}
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              {getTasksForProject(selectedProject).map(task => {
                const project = projects.find(p => p.id === task.projectId);
                return (
                  <Card
                    key={task.id}
                    className="p-4 border-0 shadow-sm hover:shadow-md transition-all duration-200 hover-scale"
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <p className={`${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        {task.dueDate && (
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            <Icon name="Clock" size={14} />
                            {format(task.dueDate, 'd MMMM', { locale: ru })}
                          </p>
                        )}
                      </div>
                      {project && (
                        <Badge variant="secondary" className="rounded-full">
                          <div className={`w-2 h-2 rounded-full ${project.color} mr-2`} />
                          {project.name}
                        </Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {getUpcomingTasks().length > 0 && (
              <Card className="p-6 border-0 shadow-sm bg-primary/5">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Icon name="BellRing" size={18} />
                  Напоминания
                </h3>
                <div className="space-y-2">
                  {getUpcomingTasks().slice(0, 3).map(task => (
                    <div key={task.id} className="flex items-center gap-3 text-sm">
                      <Icon name="AlertCircle" size={16} className="text-primary" />
                      <span>{task.title}</span>
                      <span className="text-muted-foreground ml-auto">
                        {task.dueDate && format(task.dueDate, 'd MMMM', { locale: ru })}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {view === 'calendar' && (
          <div className="space-y-8 animate-fade-in">
            <Card className="p-8 border-0 shadow-sm">
              <Calendar
                mode="single"
                locale={ru}
                className="mx-auto"
                modifiers={{
                  hasTasks: (date) => isDateHasTasks(date)
                }}
                modifiersStyles={{
                  hasTasks: {
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    textDecorationColor: 'hsl(var(--primary))',
                    textDecorationThickness: '2px'
                  }
                }}
                onDayClick={(date) => {
                  const tasksForDay = getTasksForDate(date);
                  if (tasksForDay.length > 0) {
                    setSelectedDate(date);
                  }
                }}
              />
            </Card>

            {selectedDate && getTasksForDate(selectedDate).length > 0 && (
              <Card className="p-6 border-0 shadow-sm animate-scale-in">
                <h3 className="font-medium mb-4">
                  {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                </h3>
                <div className="space-y-3">
                  {getTasksForDate(selectedDate).map(task => {
                    const project = projects.find(p => p.id === task.projectId);
                    return (
                      <Card
                        key={task.id}
                        className="p-4 border-0 bg-muted/30"
                      >
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(task.id)}
                            className="rounded-full"
                          />
                          <p className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </p>
                          {project && (
                            <Badge variant="secondary" className="rounded-full">
                              <div className={`w-2 h-2 rounded-full ${project.color} mr-2`} />
                              {project.name}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
