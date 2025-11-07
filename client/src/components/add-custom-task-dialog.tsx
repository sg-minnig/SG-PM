import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const addTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  status: z.enum(["upcoming", "in-progress", "completed"]),
  insertPosition: z.enum(["start", "end", "after-current"]),
});

type AddTaskFormData = z.infer<typeof addTaskSchema>;

interface AddCustomTaskDialogProps {
  memberName: string;
  currentTaskCount: number;
  hasCurrentTask: boolean;
  onAddTask: (task: { title: string; status: string; order: number }) => void;
}

export function AddCustomTaskDialog({
  memberName,
  currentTaskCount,
  hasCurrentTask,
  onAddTask,
}: AddCustomTaskDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<AddTaskFormData>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      title: "",
      status: "upcoming",
      insertPosition: "after-current",
    },
  });

  const onSubmit = (data: AddTaskFormData) => {
    let order = currentTaskCount;

    if (data.insertPosition === "start") {
      order = 0;
    } else if (data.insertPosition === "end") {
      order = currentTaskCount;
    } else if (data.insertPosition === "after-current" && hasCurrentTask) {
      order = currentTaskCount / 2;
    }

    onAddTask({
      title: data.title,
      status: data.status,
      order,
    });

    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-add-custom-task">
          <Plus className="h-4 w-4" />
          Add Custom Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-add-custom-task">
        <DialogHeader>
          <DialogTitle>Add Custom Task</DialogTitle>
          <DialogDescription>
            Add a task to {memberName}'s timeline that's outside the standard transition plan.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Set up meeting with department head"
                      {...field}
                      data-testid="input-task-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-task-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="insertPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insert Position</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-insert-position">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="start">At the beginning</SelectItem>
                      {hasCurrentTask && (
                        <SelectItem value="after-current">After current task</SelectItem>
                      )}
                      <SelectItem value="end">At the end</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button type="submit" data-testid="button-submit-task">
                Add Task
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
